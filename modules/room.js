var EventEmitter = require('events').EventEmitter;
var Loop = require('./loop');
var World = require('./world');
var Tank = require('./tank');
var Bullet = require('./bullet');
var uuid = require('node-uuid');


function Room() {
    EventEmitter.call(this);

    this.id = uuid.v4();
    this.clients = [ ];

    this.world = new World({
        width: 32,
        height: 32,
        clusterSize: 4,
        indexes: [ 'tank', 'bullet' ]
    });

    this.loop = new Loop({
        ups: 20
    });

    var self = this;
    this.loop.on('tick', function() {
        self.emit('update');
    });
}
Room.prototype = Object.create(EventEmitter.prototype);


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
        id: client.id
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
    for(var i = 0; i < this.clients.length; i++) {
        this.clients[i].send(name, data);
    }
};


module.exports = Room;
