var http = require('http');

var WebSocketServer = require('./modules/socket-server');


function Server(requestListener, opts) {
    opts = opts || {};
    var server = http.createServer(requestListener);

    var node_env = process.env.NODE_ENVIRONMENT || 'development';
    var listen_port = opts.port || parseInt(process.env.TANX_PORT || '30043', 10) || 30043;
    var listen_host = opts.host || process.env.TANX_HOST || '0.0.0.0';

    server.listen(listen_port, listen_host, function () {
        var host = server.address();
        console.log('[%s] Server listening on %s:%s',
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

    // gamepads
    var waitingSocketGamepads = {};
    var waitingRtcGamepads = {};

    // socket connection
    ws.on('connection', function(client) {
        // console.log('connected', client.id);

        client.send('init', {
            id: client.id
        });

        client.on('register.game', function(playerID) {
            console.log('[register.game] Player:', playerID);

            // We don't want to spam the gamepad with events from the lobby.
            lobby.join(client);
        });

        client.on('register.gamepad', function(playerID) {
            console.log('[register.gamepad] Player:', playerID);

            client.player = playerID;

            var waiting = waitingSocketGamepads[playerID];

            if (waiting && waiting !== client && waiting.socket.readyState === 1) {
                console.log('[register.gamepad] Other gamepad found');
                client.gamepadPeer = waiting;
                waiting.gamepadPeer = client;
                waitingSocketGamepads[playerID] = null;
                waiting.send('gamepad.found');
                client.send('gamepad.found');
            } else {
                console.log('[register.gamepad] No other gamepad found');
                // I am waiting for you.
                waitingSocketGamepads[playerID] = client;
            }
        });

        client.on('disconnect', function() {
            console.log('[disconnect]');
            var gamepadPeer = client.gamepadPeer;
            if (gamepadPeer) {
                console.log('[disconnect] unsetting gamepadPeer', gamepadPeer.player);
                gamepadPeer.gamepadPeer = null;
                client.gamepadPeer = null;
                waitingSocketGamepads[gamepadPeer.player] = gamepadPeer;
            }
        });

        client.on('gamepad', function(data) {
            console.log('[gamepad] Forwarding gamepad message to gamepad:', data);
            if (client.gamepadPeer) {
                client.gamepadPeer.send('gamepad', data);
            }
        });

        client.on('rtc.peer', function (data) {
            var playerID = data.player;
            var peerGamepad = waitingRtcGamepads[playerID];

            console.log('\n\n[rtc.peer] Peer request made for player', playerID);

            // Initiator or not.
            if (peerGamepad && peerGamepad !== client &&
                peerGamepad.socket.readyState === 1) {

                console.log('[rtc.peer] Found a waiting peer');

                // Send a wink!
                client.send('rtc.peer', {initiator: true});
                peerGamepad.send('rtc.peer');

                // Swap numbers ;)
                client.peer = peerGamepad;
                peerGamepad.peer = client;

                // Wait no more!
                waitingRtcGamepads[playerID] = null;
            } else {
                // Waiting for a friend.
                waitingRtcGamepads[playerID] = client;
                console.log('[rtc.peer] No peer found yet, waiting…');
            }
        });

        client.on('rtc.signal', function (data) {
            console.log('[rtc.signal] Signal recieved');
            if (client.peer) {
                client.peer.send('rtc.signal', data);
            } else {
                console.warn('[rtc.signal] Signal with no peer!');
            }
        });

        client.on('rtc.close', function (data) {
            var peer = client.peer;
            var playerID = data.player;
            if (peer) {
                peer.send('rtc.close');
                peer.peer = null;
                client.peer = null;
            }
            waitingRtcGamepads[playerID] = client;
        });
    });

    return server;
}

// If the server is called directly (i.e., not required as a module),
// immediately start the server.
if (require.main === module) {
    Server();
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    console.log(err.stack);
});

module.exports = Server;
