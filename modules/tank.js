var Vec2 = require('./vec2');
var color = require('./color');
var Bullet = require('./bullet');

var tankIds = 0;


function Tank(client) {
    this.deleted = false;

    this.id = ++tankIds;
    this.owner = client;
    client.tank = this;
    // this.hue = Math.floor(Math.random() * 360);
    this.radius = 2.0;
    this.respawning = false;

    this.pos = Vec2.new(0, 0);
    this.movementDirection = Vec2.new();

    this.speed = 0.3;
    this.range = 16.0;

    this.hp = 10.0;

    this.shooting = false;
    this.lastShot = 0;
    this.reloading = false;
    this.respawned = Date.now();

    this.angle = Math.random() * 360;
}


Tank.prototype.delete = function() {
    this.deleted = true;

    this.pos.delete();
    this.movementDirection.delete();
    this.owner = null;
};


Tank.prototype.shoot = function() {
    if (this.deleted) return;

    this.reloading = true;
    this.lastShot = Date.now();
    return new Bullet(this);
};


Tank.prototype.respawn = function() {
    if (this.deleted) return;

    this.hp = 10;
    this.respawned = Date.now();
    this.pos = Vec2.new(Math.random() * this.world.width, Math.random() * this.world.height);
};


Tank.prototype.update = function() {
    if (this.deleted) return;

    if (this.movementDirection.len()) {
        this.pos.add(Vec2.alpha.setV(this.movementDirection).norm().mulS(this.speed));

        this.pos[0] = Math.max(0, Math.min(this.world.width, this.pos[0]));
        this.pos[1] = Math.max(0, Math.min(this.world.height, this.pos[1]));
    }

    if (this.reloading && Date.now() - this.lastShot > 400) {
        this.reloading = false;
    }
};


Object.defineProperty(
    Tank.prototype,
    'data', {
        get: function() {
            return {
                id: this.id,
                owner: this.owner.id,
                pos: [ parseFloat(this.pos[0].toFixed(3), 10), parseFloat(this.pos[1].toFixed(3), 10) ],
                angle: Math.floor(this.angle),
            }
        },
        set: function() { }
    }
);

module.exports = Tank;
