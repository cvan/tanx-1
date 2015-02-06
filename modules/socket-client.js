var EventEmitter = require('events').EventEmitter;
var uuid = require('node-uuid');


var ReservedNames = {
    'connect': 1,
    'close': 1,
    'error': 1,
    'message': 1
};


function Client(socket) {
    this._uuid = uuid.v4();
    this.socket = socket;

    this.socket.on('close', this._onclose.bind(this));
    this.socket.on('error', this._onerror.bind(this));
    this.socket.on('data', this._onmessage.bind(this));
}
Client.prototype = Object.create(EventEmitter.prototype);


Object.defineProperty(Client.prototype, 'id', {
    get: function() {
        return this._uuid;
    }
});


Client.prototype._onclose = function(code) {
    this.emit('disconnect', code);
};


Client.prototype._onerror = function(data) {
    this.emit('error', data);
};


Client.prototype._onmessage = function(data) {
    var obj;

    try {
        obj = JSON.parse(data);
    } catch(ex) {
        this._onerror(new Error('could not parse message - is it JSON?'));
        return;
    }

    if (ReservedNames[obj.n]) {
        this._onerror(new Error('could not receive message - name is reserved:', obj.n));
        return;
    }

    this.emit('message', obj.n, obj.d);
    this.emit(obj.n, obj.d);
};


Client.prototype.send = function(name, data) {
    if (ReservedNames[name]) {
        this._onerror(new Error('could not send message - name is reserved:', name));
        return;
    }

    var msg = JSON.stringify({
        n: name,
        d: data
    });

    this.socket.write(msg);

    return msg;
};

Client.prototype.sendRaw = function(data) {
    this.socket.write(data);
};


module.exports = Client;
