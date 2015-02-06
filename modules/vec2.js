// degree to radians constant
var rd = Math.PI / 180.0;

// 2d vector [x, y] library
var Vec2 = {
    cacheSize: 64,
    cache: [ ],
    clear: function() {
        this.cache = [ ];
    },
    new: function(x, y) {
        if (this.cache.length) {
            return this.cache.pop().setXY(x, y);
        } else {
            return new Float32Array([ x || 0, y || 0 ]);
        }
    },
    alpha:   null,
    charlie: null,
    bet:     null
};
Vec2.alpha   = Vec2.new();
Vec2.charlie = Vec2.new();
Vec2.beta    = Vec2.new();


// push vector into cache stack for reusability
Float32Array.prototype.delete = function() {
    if (Vec2.cache.length >= Vec2.cacheSize) return;
    Vec2.cache.push(this);
};


// clone
Float32Array.prototype.clone = function() {
    return Vec2.new(this[0], this[1]);
};


// compare for equal
Float32Array.prototype.equal = function(v) {
    return this[0] == v[0] && this[1] == v[1];
};
Float32Array.prototype.equalS = function(s) {
    return this[0] == s && this[1] == s;
};
Float32Array.prototype.equalXY = function(x, y) {
    return this[0] == x && this[1] == y;
};


// clear
Float32Array.prototype.setV = function(v) {
    this[0] = v && v[0] || 0;
    this[1] = v && v[1] || 0;
    return this;
};
Float32Array.prototype.setS = function(s) {
    this[0] = s || 0;
    this[1] = s || 0;
    return this;
};
Float32Array.prototype.setR = function(r) {
    this[0] = Math.cos(r);
    this[1] = Math.sin(r);
    return this;
};
Float32Array.prototype.setXY = function(x, y) {
    this[0] = x || 0;
    this[1] = y || 0;
    return this;
};


// add
Float32Array.prototype.add = function(v) {
    this[0] += v[0];
    this[1] += v[1];
    return this;
};
Float32Array.prototype.addS = function(s) {
    this[0] += s;
    this[1] += s;
    return this;
};
Float32Array.prototype.addXY = function(x, y) {
    this[0] += x;
    this[1] += y;
    return this;
};


// linear interpolation
Float32Array.prototype.lerp = function(v, f) {
    this[0] += f * (v[0] - this[0]);
    this[1] += f * (v[1] - this[1]);
    return this;
};
Float32Array.prototype.lerpS = function(s, f) {
    this[0] += f * (s - this[0]);
    this[1] += f * (s - this[1]);
    return this;
};
Float32Array.prototype.lerpXY = function(x, y, f) {
    this[0] += f * (x - this[0]);
    this[1] += f * (y - this[1]);
    return this;
};


// subtract
Float32Array.prototype.sub = function(v) {
    this[0] -= v[0];
    this[1] -= v[1];
    return this;
};
Float32Array.prototype.subS = function(s) {
    this[0] -= s;
    this[1] -= s;
    return this;
};
Float32Array.prototype.subXY = function(x, y) {
    this[0] -= x;
    this[1] -= y;
    return this;
};


// multiply
Float32Array.prototype.mul = function(v) {
    this[0] *= v[0];
    this[1] *= v[1];
    return this;
};
Float32Array.prototype.mulS = function(s) {
    this[0] *= s;
    this[1] *= s;
    return this;
};
Float32Array.prototype.mulXY = function(x, y) {
    this[0] *= x;
    this[1] *= y;
    return this;
};


// divide
Float32Array.prototype.div = function(v) {
    this[0] /= v[0];
    this[1] /= v[1];
    return this;
};
Float32Array.prototype.divS = function(s) {
    this[0] /= s;
    this[1] /= s;
    return this;
};
Float32Array.prototype.divXY = function(x, y) {
    this[0] /= x;
    this[1] /= y;
    return this;
};


// length
Float32Array.prototype.len = function() {
    return Math.sqrt((this[0] * this[0]) + (this[1] * this[1]));
};


// distance
Float32Array.prototype.dist = function(v) {
    var x = this[0] - v[0];
    var y = this[1] - v[1];
    return Math.sqrt(x * x + y * y);
};
Float32Array.prototype.distXY = function(x, y) {
    return Math.sqrt(this[0] * x + this[1] * y);
};


// dot
Float32Array.prototype.dot = function(v) {
    return this[0] * v[0] + this[1] * v[1];
};
Float32Array.prototype.dotXY = function(x, y) {
    return this[0] * x + this[1] * y;
};


// normal
Float32Array.prototype.norm = function() {
    var l = 1.0 / Math.sqrt((this[0] * this[0]) + (this[1] * this[1]));
    this[0] *= l;
    this[1] *= l;
    return this;
};


// radians
Float32Array.prototype.radians = function() {
    return Math.atan2(this[1], this[0]);
};


// rotate
Float32Array.prototype.rot = function(v) {
    Vec2.charlie.set(v).norm();
    var t   = this[0] * Vec2.charlie[0] - this[1] * Vec2.charlie[1];
    this[1] = this[1] * Vec2.charlie[0] + this[0] * Vec2.charlie[1];
    this[0] = t;
    return this;
};
Float32Array.prototype.rotR = function(r) {
    return this.rot(Vec2.charlie.setR(r));
};
Float32Array.prototype.rotXY = function(x, y) {
    return this.rot(Vec2.charlie.setXY(x, y).norm());
};


// saturate   0.0 .. 1.0
Float32Array.prototype.sat = function() {
    if (this.len() > 1.0) {
        this.norm();
    }
    return this;
};


// floor
Float32Array.prototype.floor = function() {
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    return this;
};


// round
Float32Array.prototype.round = function() {
    this[0] = Math.round(this[0]);
    this[1] = Math.round(this[1]);
    return this;
};


// ceil
Float32Array.prototype.ceil = function() {
    this[0] = Math.ceil(this[0]);
    this[1] = Math.ceil(this[1]);
    return this;
};

module.exports = Vec2;
