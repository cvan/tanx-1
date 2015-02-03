var EventEmitter = require('events').EventEmitter;


function Loop(args) {
    EventEmitter.call(this);
    args = args || { };

    this.ups = args.ups || 20;
    this.running = false;
}
Loop.prototype = Object.create(EventEmitter.prototype);


Loop.prototype._tick = function() {
    var self = this;

    setTimeout(function() {
        if (! self.running)
            return;

        self._tick();
    }, 1000 / this.ups);

    this.emit('tick');
};


Loop.prototype.start = function() {
    if (this.running)
        return;

    this.running = true;
    var self = this;

    setTimeout(function() {
        if (! self.running)
            return;

        self._tick();
    }, 1000 / this.ups);
};


Loop.prototype.stop = function() {
    this.running = false;
};


module.exports = Loop;
