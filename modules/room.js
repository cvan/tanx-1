var EventEmitter = require('events').EventEmitter;
var Loop = require('./loop');
var World = require('./world');
var Block = require('./block');
var Tank = require('./tank');
var Bullet = require('./bullet');
var uuid = require('node-uuid');


function Room() {
    EventEmitter.call(this);

    this.id = uuid.v4();
    this.clients = [ ];

    this.world = new World({
        width: 48,
        height: 48,
        clusterSize: 4,
        indexes: [ 'tank', 'bullet', 'block' ]
    });

    var level = [
        [ 13.5, 2, 1, 4 ],
        [ 13.5, 12, 1, 2 ],
        [ 12.5, 13.5, 3, 1 ],
        [ 2, 13.5, 4, 1 ],
        [ 11.5, 15, 1, 2 ],
        [ 11.5, 23.5, 1, 5 ],

        [ 10, 26.5, 4, 1 ],
        [ 6, 26.5, 4, 1 ],

        [ 2, 34.5, 4, 1 ],
        [ 12.5, 34.5, 3, 1 ],
        [ 13.5, 36, 1, 2 ],
        [ 15, 36.5, 2, 1 ],
        [ 13.5, 46, 1, 4 ],

        [ 23.5, 36.5, 5, 1 ],
        [ 26.5, 38, 1, 4 ],
        [ 26.5, 42, 1, 4 ],

        [ 34.5, 46, 1, 4 ],
        [ 34.5, 36, 1, 2 ],
        [ 35.5, 34.5, 3, 1 ],
        [ 36.5, 33, 1, 2 ],
        [ 46, 34.5, 4, 1 ],

        [ 36.5, 24.5, 1, 5 ],
        [ 38, 21.5, 4, 1 ],
        [ 42, 21.5, 4, 1 ],

        [ 46, 13.5, 4, 1 ],
        [ 35.5, 13.5, 3, 1 ],
        [ 34.5, 12, 1, 2 ],
        [ 33, 11.5, 2, 1 ],
        [ 34.5, 2, 1, 4 ],

        [ 24.5, 11.5, 5, 1 ],
        [ 21.5, 10, 1, 4 ],
        [ 21.5, 6, 1, 4 ],

        // center
        [ 18.5, 22, 1, 6 ],
        [ 19, 18.5, 2, 1 ],
        [ 26, 18.5, 6, 1 ],
        [ 29.5, 19, 1, 2 ],
        [ 29.5, 26, 1, 6 ],
        [ 29, 29.5, 2, 1 ],
        [ 22, 29.5, 6, 1 ],
        [ 18.5, 29, 1, 2 ]
    ];

    this.createBlocks(level);

    this.loop = new Loop({
        ups: 20
    });

    var self = this;
    this.loop.on('tick', function() {
        self.emit('update');
    });
}
Room.prototype = Object.create(EventEmitter.prototype);


Room.prototype.createBlocks = function(data) {
    for(var i = 0; i < data.length; i++) {
        this.world.add('block', new Block({
            x: data[i][0],
            y: data[i][1],
            width: data[i][2],
            height: data[i][3]
        }));
    }
};


Room.prototype.join = function(client) {
    if (this.clients.indexOf(client) !== -1)
        return;

    this.clients.push(client);

    var self = this;
    client.on('disconnect', function() {
        self.leave(client);
    });

    var tank = new Tank(client);
    this.world.add('tank', tank);

    // random spawn position
    tank.pos.setXY(Math.random() * this.world.width, Math.random() * this.world.height);

    // movement
    client.on('move', function(data) {
        if (data &&
            data instanceof Array &&
            data.length == 2 &&
            typeof(data[0]) == 'number' &&
            typeof(data[1]) == 'number') {

            tank.movementDirection.setV(data);
        }
    });

    // targeting
    client.on('target', function(angle) {
        if (angle && typeof(angle) == 'number')
            tank.angle = angle;
    });

    // shooting
    client.on('shoot', function(state) {
        tank.shooting = state;
    });

    // TODO
    // publish user:add

    // send other tanks
    this.world.forEach('tank', function(tank) {
        if (tank.owner === client)
            return;

        client.send('tank.new', tank.data);
    });

    // publish new tank
    this.publish('tank.new', tank.data);
};


Room.prototype.leave = function(client) {
    var ind = this.clients.indexOf(client);

    if (ind === -1)
        return;

    this.clients.splice(ind, 1);

    this.publish('tank.delete', {
        id: client.tank.id
    });

    this.world.remove('tank', client.tank);
    client.tank.delete();

    // TODO
    // publish user:remove
};


Room.prototype.forEach = function(fn) {
    this.clients.forEach(fn);
};


Room.prototype.publish = function(name, data) {
    var raw = null;
    for(var i = 0; i < this.clients.length; i++) {
        if (! raw) {
            raw = this.clients[i].send(name, data);
        } else {
            this.clients[i].sendRaw(raw);
        }
    }
};


module.exports = Room;
