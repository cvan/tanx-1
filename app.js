// process.on('uncaughtException', function(err) {
//     console.log('Caught exception: ' + err);
//     console.log(err.stack);
// });


// http
var http = require('http');
var server = http.createServer();
var port = parseInt(process.env.TANX_PORT || '30043', 10) || 30043;
var host = process.env.TANX_HOST || '0.0.0.0';
server.listen(port, host, function () {
    var host = server.address();
    console.log('Listening on %s:%s', host.address, host.port);
});


// socket
var WebSocketServer = require('./modules/socket-server');
var ws = new WebSocketServer({
    http: server,
    prefix: '/socket'
});


// room
var Room = require('./modules/room');
var room = new Room();

var Vec2 = require('./modules/vec2');
var Pickable = require('./modules/pickable');



room.on('update', function() {
    var now = Date.now();
    var self = this;
    var world = this.world;

    // game state to send
    var state = { };

    // for each tank
    world.forEach('tank', function(tank) {
        tank.update();

        if (! tank.dead) {
            // tank-tank collision
            world.forEachAround('tank', tank, function(tankOther) {
                if (tank === tankOther || tankOther.dead)
                    return;

                // check for collision
                var dist = tank.pos.dist(tankOther.pos);
                if (dist < tank.radius + tankOther.radius) {
                    // collided
                    Vec2.alpha
                    .setV(tank.pos)
                    .sub(tankOther.pos)
                    .norm()
                    .mulS(dist - (tank.radius + tankOther.radius));
                    // move apart
                    tank.pos.sub(Vec2.alpha);
                    tankOther.pos.add(Vec2.alpha);
                }
            });

            // tank-block collision
            world.forEachAround('block', tank, function(block) {
                var point = block.collideCircle(tank);
                if (point)
                    tank.pos.add(point);
            });

            // tank-pickable collision
            world.forEachAround('pickable', tank, function(pickable) {
                if (! pickable.collideCircle(tank))
                    return;

                switch(pickable.type) {
                    case 'repair':
                        // don't need repair
                        if (tank.hp == 10)
                            return;

                        // recover a bit
                        tank.hp = Math.min(10, tank.hp + 3);
                        break;
                    case 'damage':
                        // give 3 bullets
                        tank.bullets += 3;
                        break;
                    case 'shield':
                        // set full shield
                        tank.shield = 10;
                        break;
                }

                world.remove('pickable', pickable);

                state.pickableDelete = state.pickableDelete || [ ];
                state.pickableDelete.push({
                    id: pickable.id
                });

                self.pickables[pickable.ind].picked = now;
                self.pickables[pickable.ind].item = null;

                pickable.delete();
            });
        }

        // update in world
        tank.node.root.updateItem(tank);

        // shoot
        if (! tank.dead && tank.shooting && ! tank.reloading) {
            // new bullet
            var bullet = tank.shoot();
            world.add('bullet', bullet);

            // publish
            state.bullets = state.bullets || [ ];
            state.bullets.push(bullet.data);
        }
    });


    // respawn pickables
    for(var i = 0; i < this.pickables.length; i++) {
        var pickable = this.pickables[i];
        if (! pickable.item && (now - pickable.picked) > pickable.delay) {
            pickable.item = new Pickable({
                type: pickable.type,
                x: pickable.x,
                y: pickable.y
            });
            pickable.item.ind = i;
            world.add('pickable', pickable.item);

            state.pickable = state.pickable || [ ];
            state.pickable.push(pickable.item.data);
        }
    }


    // for each bullet
    world.forEach('bullet', function(bullet) {
        // bullet update
        bullet.update();

        var deleting = false;
        if (bullet.pos.dist(bullet.target) < 1) {
            deleting = true;
        } else if (bullet.pos[0] <= 0 ||
                   bullet.pos[1] <= 0 ||
                   bullet.pos[0] >= world.width ||
                   bullet.pos[1] >= world.height) {
            deleting = true;
        } else {
            // for each tank around
            world.forEachAround('tank', bullet, function(tank) {
                // refuse tank if any of conditions not met
                if (deleting ||  // bullet already hit the target
                    tank.dead ||  // tank is dead
                    tank === bullet.owner ||  // own bullet
                    now - tank.respawned <= 1000 ||  // tank just respawned
                    tank.pos.dist(bullet.pos) > (tank.radius + bullet.radius)) {  // no collision
                    return;
                }

                // hit
                bullet.hit = true;
                bullet.pos.setV(tank.pos);

                if (! bullet.owner.deleted) {
                    // damage tank
                    var damage = bullet.damage;

                    tank.tHit = now;

                    // if has shield
                    if (tank.shield) {
                        if (tank.shield > damage) {
                            // enough to sustain whole damage
                            tank.shield -= damage;
                            damage = 0;
                        } else {
                            // shielded only some damage
                            damage -= tank.sheild;
                            tank.shield = 0;
                        }
                    }

                    if (damage) {
                        tank.hp -= damage;

                        // killed, give point
                        if (tank.hp <= 0) {
                            // add point
                            bullet.owner.owner.send('point', 1);
                            // remember killer
                            tank.killer = bullet.owner.id;
                            // respawn
                            tank.respawn();
                        }
                    }
                }

                // bullet delete
                deleting = true;
                bullet.publish = true;
            });

            if (! deleting) {
                // for each block around
                world.forEachAround('block', bullet, function(block) {
                    if (deleting)
                        return;

                    // collision with level block
                    var point = block.collideCircle(bullet);
                    if (point) {
                        bullet.pos.add(point);
                        bullet.publish = true;
                        deleting = true;
                    }
                });
            }
        }

        if (! deleting) {
            // update in world
            bullet.node.root.updateItem(bullet);

        } else {
            // delete bullet

            // publish
            if (bullet.publish) {
                state.bulletsDelete = state.bulletsDelete || [ ];

                state.bulletsDelete.push({
                    id: bullet.id,
                    x: parseFloat(bullet.pos[0].toFixed(2), 10),
                    y: parseFloat(bullet.pos[1].toFixed(2), 10)
                });
            }

            // remove from world
            world.remove('bullet', bullet);
            bullet.delete();
        }
    });

    // for each tank
    world.forEach('tank', function(tank) {
        // state data
        state.tanks = state.tanks || [ ];

        // tank data
        var obj = {
            id: tank.id,
            x: parseFloat(tank.pos[0].toFixed(2), 10),
            y: parseFloat(tank.pos[1].toFixed(2), 10),
            a: Math.floor(tank.angle)
        };

        if (tank.dead) {
            // dead
            obj.dead = true;
            // killer
            if (tank.killer) {
                obj.killer = tank.killer;
                tank.killer = null;
            }
        } else {
            // alive
            obj.hp = parseFloat(tank.hp.toFixed(2), 10);
        }

        // add to state
        state.tanks.push(obj);
    });

    // publish data
    if (Object.keys(state).length) {
        this.publish('update', state);
    }
});


// start loop
room.loop.start();


// socket connection
ws.on('connection', function(client) {
    console.log('connected', client.id);

    client.send('init', {
        id: client.id
    });

    room.join(client);
});
