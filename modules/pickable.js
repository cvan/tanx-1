'use strict';

var Vec2 = require('./vec2');
var pickableIds = 0;


function Pickable(args) {
    this.deleted = false;
    this.id = ++pickableIds;
    this.radius = .3;
    this.pos = Vec2.new(args.x, args.y);
    this.type = args.type;
}


Pickable.prototype.collideCircle = function(item) {
    return ! this.deleted && this.pos.dist(item.pos) <= (item.radius + this.radius);
};


Pickable.prototype.delete = function() {
    if (this.deleted)
        return;

    this.deleted = true;
    this.pos.delete();
};


Object.defineProperty(
    Pickable.prototype,
    'data', {
        get: function() {
            return {
                id: this.id,
                t: this.type,
                r: parseFloat(this.radius.toFixed(2), 10),
                x: parseFloat(this.pos[0].toFixed(2), 10),
                y: parseFloat(this.pos[1].toFixed(2), 10)
            };
        }
    }
);


module.exports = Pickable;
