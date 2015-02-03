// process.on('uncaughtException', function(err) {
//     console.log('Caught exception: ' + err);
//     console.log(err.stack);
// });


// http
var http = require('http');
var server = http.createServer();
server.listen(30043);


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


room.on('update', function() {
    var self = this;
    var world = this.world;

    // game state to send
    var state = { };

    // for each tank
    world.forEach('tank', function(tank) {
        tank.update();

        if (! tank.dead) {
            // check for tank-tank collision
            world.forEachAround('tank', tank, function(tankOther) {
                if (tank === tankOther || tankOther.dead)
                    return;

                // check for collision
                var dist = tank.pos.dist(tankOther.pos);
                if (dist < tank.radius) {
                    // collided
                    Vec2.alpha
                    .setV(tank.pos)
                    .sub(tankOther.pos)
                    .norm()
                    .mulS(dist - tank.radius);
                    // move apart
                    tank.pos.sub(Vec2.alpha);
                    tankOther.pos.add(Vec2.alpha);
                }
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

    // for each bullet
    world.forEach('bullet', function(bullet) {
        // bullet update
        bullet.update();

        var deleting = false;
        if (bullet.pos.dist(bullet.target) < 1) {
            deleting = true;
        } else if (bullet.pos[0] <= 0 || bullet.pos[1] <= 0 || bullet.pos[0] >= world.width || bullet.pos[1] >= world.height) {
            deleting = true;
        } else {
            // for each tank around
            world.forEachAround('tank', bullet, function(tank) {
                // refuse tank if any of conditions not met
                if (deleting // bullet already hit the target
                || tank.dead // tank is dead
                || tank === bullet.owner // own bullet
                || Date.now() - tank.respawned <= 1000 // tank just respawned
                || tank.pos.dist(bullet.pos) > tank.radius) // no collision
                    return;

                // hit
                bullet.hit = true;
                bullet.pos.setV(tank.pos);

                if (! bullet.owner.deleted) {
                    // damage tank
                    tank.hp -= bullet.damage;

                    // killed, give point
                    if (tank.hp <= 0) {
                        // add point
                        bullet.owner.send('point', 1);
                        // remember killer
                        tank.killer = bullet.owner.id;
                        // respawn
                        tank.respawn();
                    }
                }

                // bullet delete
                deleting = true;
                bullet.publish = true;
            });
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
        state.tanks.push(obj)
    });

    // publish data
    if (Object.keys(state).length)
        this.publish('update', state);
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


console.log('started');
