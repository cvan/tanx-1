var EventEmitter = require('events').EventEmitter;
var sockjs = require('sockjs');


// var ws = require('ws');


var Client = require('./socket-client');


function Server(args) {
    EventEmitter.call(this);
    args = args || { };

    // args.verifyClient = function() {
    //     TODO
    //     add session stuff
    //     so it can be restored and reused
    // };

    this.socket = sockjs.createServer({
        log: function(level, msg) {
            if (level !== 'error')
                return;

            console.log(msg);
        }
    });
    this.socket.installHandlers(args.http, {
        prefix: args.prefix || ''
    });

    this.socket.on('connection', this._onconnection.bind(this));
}
Server.prototype = Object.create(EventEmitter.prototype);


Server.prototype._onconnection = function(socket) {
    this.emit('connection', new Client(socket));
};


module.exports = Server;
