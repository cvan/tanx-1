var http = require('http');

var Gamepad = require('./modules/gamepad');
var logger = require('./modules/logger');
var WebSocketServer = require('./modules/socket-server');

var log = logger.log;


function Server(requestListener, opts) {
    opts = opts || {};
    var server = http.createServer(requestListener);

    var node_env = process.env.NODE_ENVIRONMENT || 'development';
    var listen_port = opts.port || parseInt(process.env.TANX_PORT || '30043', 10) || 30043;
    var listen_host = opts.host || process.env.TANX_HOST || '0.0.0.0';

    server.listen(listen_port, listen_host, function () {
        var host = server.address();
        log('[%s] Server listening on %s:%s',
            node_env, host.address, host.port);
    });


    // socket
    var ws = new WebSocketServer({
        http: server,
        prefix: '/socket'
    });

    // lobby
    var Lobby = require('./modules/lobby');
    var lobby = new Lobby();

    // socket connection
    ws.on('connection', function(client) {
        log('[connection] Client connected:', client.id);

        client.send('init', {
            id: client.id
        });

        client.on('register.game', function(playerID) {
            log('[register.game] Player:', playerID);

            // We don't want to spam the gamepad with events from the lobby.
            lobby.join(client);
        });

        new Gamepad().listen(client);
    });

    return server;
}

// If the server is called directly (i.e., not required as a module),
// immediately start the server.
if (require.main === module) {
    Server();
}

process.on('uncaughtException', function(err) {
    log('Caught exception: ' + err);
    log(err.stack);
});

module.exports = Server;
