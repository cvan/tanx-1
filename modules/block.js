'use strict';

var Vec2 = require('./vec2');


function Block(args) {
    this.deleted = false;
    this.pos = Vec2.new(args.x, args.y);
    this.size = Vec2.new(args.width || 1, args.height || 1);
}


Block.prototype.delete = function() {
    if (! this.deleted)
        return;

    this.deleted = true;
    this.pos.delete();
    this.size.delete();
};


Block.prototype.collideCircle = function(item) {
    // half sizes
    var halfW = this.size[0] / 2;
    var halfH = this.size[1] / 2;

    // item XY normalized to center of rect
    var itemX = item.pos[0] - this.pos[0];
    var itemY = item.pos[1] - this.pos[1];

    // inside horizontaly?
    var x = Math.abs(itemX) <= (halfW + item.radius);
    if (! x) return false;

    // inside verticaly?
    var y = Math.abs(itemY) <= (halfH + item.radius);
    if (! y) return false;

    // which side
    x = itemX < 0 ? -1 : 1;
    y = itemY < 0 ? -1 : 1;

    // check if center is inside
    var centerInsideX = Math.abs(itemX) < halfW;
    var centerInsideY = Math.abs(itemY) < halfH;

    // offset
    var offset;

    if (centerInsideX && centerInsideY) {
        // item is inside
        // find side to move to
        if ((halfW - Math.abs(itemX)) < (halfH - Math.abs(itemY))) {
            y = 0;
            offset = (halfW - Math.abs(itemX)) + item.radius;
        } else {
            x = 0;
            offset = (halfH - Math.abs(itemY)) + item.radius;
        }
    } else if (! centerInsideX && ! centerInsideY) {
        // item is on corner
        x = itemX - (x * halfW);
        y = itemY - (y * halfH);
        // distance
        var dist = Math.sqrt((x * x) + (y * y));
        // too far
        if (dist > item.radius)
            return false;
        // normalize
        x /= dist;
        y /= dist;
        offset = item.radius - dist;
    } else {
        // item is on side
        // check which side
        if (centerInsideX) {
            x = 0;
            offset = item.radius - (Math.abs(itemY) - halfH);
        } else if (centerInsideY) {
            y = 0;
            offset = item.radius - (Math.abs(itemX) - halfW);
        }
    }

    // return vector of offset
    return [ x * offset, y * offset ];
};


Block.prototype.intersectPoint = function(pos) {
    return pos[0] >= this.pos[0] - this.size[0] / 2 &&
           pos[0] <= this.pos[0] + this.size[0] / 2 &&
           pos[1] >= this.pos[1] - this.size[1] / 2 &&
           pos[1] <= this.pos[1] + this.size[1] / 2;
};


module.exports = Block;
