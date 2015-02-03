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

    var data = {
        tanks: { }
    };

    world.forEach('tank', function(tank) {
        tank.update();

        world.forEachAround('tank', tank, function(tankOther) {
            if (tank === tankOther)
                return;

            // check for collision
            var dist = tank.pos.dist(tankOther.pos);
            if (dist < tank.radius) {
                Vec2.alpha
                .setV(tank.pos)
                .sub(tankOther.pos)
                .norm()
                .mulS(dist - tank.radius);

                tank.pos.sub(Vec2.alpha);
                tankOther.pos.add(Vec2.alpha);
            }
        });

        tank.node.root.updateItem(tank);

        // // shoot
        // if (tank.shooting && ! tank.reloading) {
        //     var bullet = tank.shoot();
        //     world.add('bullet', bullet);
        //     self.publish('bullet.new', bullet.data);
        // }
    });

    /*
    // bullets to delete
    var bulletsDeleting = [ ];

    // for each bullet
    world.forEach('bullet', function(bullet) {
        // bullet update
        bullet.update();
        bullet.node.root.updateItem(bullet);

        var deleting = false;
        if (bullet.pos.dist(bullet.target) < 1) {
            deleting = true;
        } else if (bullet.pos[0] <= 0 || bullet.pos[1] <= 0 || bullet.pos[0] >= world.width || bullet.pos[1] >= world.height) {
            deleting = true;
        } else {
            // for each tank around
            world.forEachAround('tank', bullet.pos, function(tank) {
                // already hit the target
                if (deleting)
                    return;

                // own bullet
                if (tank === bullet.owner)
                    return;

                // tank just respawned
                if (Date.now() - tank.respawned <= 1000)
                    return;

                // too far
                if (tank.pos.dist(bullet.pos) > tank.radius)
                    return;

                if (! bullet.owner.deleted) {
                    // damage tank
                    tank.hp -= bullet.damage;

                    // killed, give point
                    if (tank.hp <= 0)
                        tank.owner.send('point', 1);
                }

                // hit
                bullet.hit = true;
                bullet.pos.setV(tank.pos);

                // bullet delete
                deleting = true;
                bullet.publish = true;
            });
        }

        if (deleting)
            bulletsDeleting.push(bullet);
    });


    // if there are bullets to delete (hit target)
    if (bulletsDeleting.length) {
        data.bulletsDelete = [ ];

        // for each bullet awaiting deletion
        for(var i = 0; i < bulletsDeleting.length; i++) {
            var bullet = bulletsDeleting[i];

            // remove from world
            world.remove('bullet', bullet);
            bullet.delete();

            // publish
            if (bullet.publish) {
                // data
                var item = {
                    id: bullet.id
                };

                // if bullet hit, set position
                if (bullet.hit)
                    item.pos = [ parseFloat(bullet.pos[0].toFixed(2), 10), parseFloat(bullet.pos[1].toFixed(2), 10) ]

                // add to data
                data.bulletsDelete.push(item);
            }
        }
    }
    */

    // for each tank
    world.forEach('tank', function(tank) {
        // respawn
        if (tank.hp <= 0) {
            tank.respawn();
            data.tanksRespawn = data.tanksRespawn || [ ];
            data.tanksRespawn.push(tank.id);
        }

        // data
        data.tanks[tank.id] = [
            parseFloat(tank.pos[0].toFixed(2), 10), // x
            parseFloat(tank.pos[1].toFixed(2), 10), // y
            Math.floor(tank.angle), // angle
            parseFloat(tank.hp.toFixed(2), 10), // hp
            tank.node.ind // node ind
        ];
    });


    // publish tank data
    this.publish('update', data);
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
