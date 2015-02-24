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
    this.radius = .75;

    this.scoreLast = 0;
    this.score = 0;

    this.pos = Vec2.new(0, 0);
    this.movementDirection = Vec2.new();

    this.speed = 0.3;
    this.range = 16.0;

    this.tHit = 0;
    this.tRecover = 0;

    this.hp = 10.0;
    this.shield = 0;
    this.bullets = 0;

    this.shooting = false;
    this.lastShot = 0;
    this.reloading = false;

    this.killer = null;
    this.died = 0;
    this.dead = true;
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
    if (this.deleted || this.dead) return;

    var now = Date.now();
    this.tHit = now;
    this.reloading = true;
    this.lastShot = now;
    var bullet = new Bullet(this);
    if (this.bullets > 0) {
        this.bullets--;
        bullet.special = true;
        bullet.damage += 2;
        bullet.speed += .2;
    }
    return bullet;
};


Tank.prototype.respawn = function() {
    if (this.deleted || this.dead) return;

    this.dead = true;
    this.died = Date.now();
};


Tank.prototype.update = function() {
    if (this.deleted) return;

    var now = Date.now();

    if (! this.dead) {
        // movement
        if (this.movementDirection.len())
            this.pos.add(Vec2.alpha.setV(this.movementDirection).norm().mulS(this.speed));

        // reloading
        if (this.reloading && now - this.lastShot > 400)
            this.reloading = false;

        // auto recover
        if (this.hp < 10 && now - this.tHit > 3000 && now - this.tRecover > 1000) {
            this.hp = Math.min(this.hp + 1, 10);
            this.tRecover = now;
        }
    } else {
        // dead
        if (now - this.died > 5000) {
            this.dead = false;
            this.hp = 10;
            this.shield = 0;
            this.bullets = 0;
            this.respawned = now;
            this.pos.setXY(2.5 + ((this.team.id % 2) * 35) + Math.floor(Math.random() * 9), 2.5 + (Math.floor(this.team.id / 2) * 35) + Math.floor(Math.random() * 9));
        }
    }
};


Object.defineProperty(
    Tank.prototype,
    'data', {
        get: function() {
            return {
                id: this.id,
                team: this.team.id,
                owner: this.owner.id,
                pos: [ parseFloat(this.pos[0].toFixed(3), 10), parseFloat(this.pos[1].toFixed(3), 10) ],
                angle: Math.floor(this.angle),
                hp: this.hp,
                shield: this.shield,
                dead: this.dead,
                score: this.score
            };
        },
        set: function() { }
    }
);

module.exports = Tank;
