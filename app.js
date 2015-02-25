var http = require('http');

var WebSocketServer = require('./modules/socket-server');


function Server(requestListener) {
    var server = http.createServer(requestListener);

    var node_env = process.env.NODE_ENVIRONMENT || 'development';
    var listen_port = parseInt(process.env.TANX_PORT || '30043', 10) || 30043;
    var listen_host = process.env.TANX_HOST || '0.0.0.0';

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

    // gamepad players
    var colors = {};
    var gamepads = {};
    var players = {};
    var gamepads = {};
    var colors = {};

    // rtc controller
    var waitingGamepads = {};

    // socket connection
    ws.on('connection', function(client) {
        // console.log('connected', client.id);

        client.send('init', {
            id: client.id
        });

        client.on('register.game', function(playerID) {
            console.log('[register.game] player:', playerID);
            players[playerID] = client;

            // We don't want to spam the gamepad with events from the lobby.
            lobby.join(client);
        });

        client.on('register.gamepad', function(playerID) {
            console.log('[register.gamepad] player:', playerID);
            if (!(playerID in players)) {
                return console.warn('[register.gamepad] Player %s not yet in players:',
                    playerID, players);
            }

            gamepads[playerID] = client;
            if (playerID in colors) {
                client.send('gamepad.color', colors[playerID]);
            } else {
                console.warn('no color yet for player', playerID);
            }
        });

        client.on('gamepad', function(data) {
            console.log('[gamepad] Sending gamepad message to client:', data);

            var playerID = data.player;
            var playerClient = players[playerID];

            if (!playerClient) {
                return console.error('[gamepad] Player %s not yet in players:',
                    playerID);
            }

            playerClient.send('gamepad', data);
        });

        client.on('gamepad.color', function(data) {
            console.log('[gamepad.color] Sending tank color to gamepad:', data);

            var playerID = data.player;
            var gamepadClient = gamepads[playerID];

            colors[playerID] = data.color;

            if (!gamepadClient) {
                return console.error('[gamepad.color] Player %s not yet in gamepads:',
                    playerID);
            }

            gamepadClient.send('gamepad.color', data.color);
        });

        client.on('rtc.peer', function (data) {
            var playerID = data.playerID;
            var peerGamepad = waitingGamepads[playerID];

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
                waitingGamepads[playerID] = null;
            } else {
                // Waiting for a friend.
                waitingGamepads[playerID] = client;
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
            waitingGamepads[playerID] = client;
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
