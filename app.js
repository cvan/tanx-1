process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    console.log(err.stack);
});


// http
var http = require('http');
var server = http.createServer();
var port = parseInt(process.env.TANX_PORT || '30043', 10) || 30043;
var host = process.env.TANX_HOST || '0.0.0.0';
server.listen(port, host, function () {
    var host = server.address();
    console.log('Listening on %s:%s', host.address, host.port);
});


// socket
var WebSocketServer = require('./modules/socket-server');
var ws = new WebSocketServer({
    http: server,
    prefix: '/socket'
});


// lobby
var Lobby = require('./modules/lobby');
var lobby = new Lobby();

// gamepad players
var players = {};
var gamepads = {};
var colors = {};

// socket connection
ws.on('connection', function(client) {
    // console.log('connected', client.id);

    client.send('init', {
        id: client.id
    });

    client.on('register.game', function(playerID) {
        console.log('register.game', playerID);
        players[playerID] = client;

        // We don't want to spam the gamepad with events from the lobby.
        lobby.join(client);
    });

    client.on('register.gamepad', function(playerID) {
        console.log('register.gamepad', playerID);
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
      console.log('[gamepad] Sending gamepad color to gamepad:', data);

      var playerID = data.player;
      var gamepadClient = gamepads[playerID];

      colors[playerID] = data.color;

      if (!gamepadClient) {
        return console.error('[gamepad] Player %s not yet in gamepads:',
        playerID);
      }

      gamepadClient.send('gamepad.color', data.color);
    });

});
