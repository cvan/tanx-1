'use strict';
var logger = require('./logger');
var log = logger.log;
var warn = logger.warn;


function Gamepad() {
    this.waitingSocketGamepads = {};
    this.waitingRtcGamepads = {};
}


Gamepad.prototype.listen = function (client) {
    client.on('register.gamepad', function (playerID) {
        log('[register.gamepad] Player:', playerID);

        client.player = playerID;

        var waiting = this.waitingSocketGamepads[playerID];

        if (waiting && waiting !== client && waiting.socket.readyState === 1) {
            log('[register.gamepad] Other gamepad found');
            client.gamepadPeer = waiting;
            waiting.gamepadPeer = client;
            this.waitingSocketGamepads[playerID] = null;
            waiting.send('gamepad.found');
            client.send('gamepad.found');
        } else {
            log('[register.gamepad] No other gamepad found');
            // I am waiting for you.
            this.waitingSocketGamepads[playerID] = client;
        }
    }.bind(this));

    client.on('disconnect', function () {
        log('[disconnect]');
        var gamepadPeer = client.gamepadPeer;
        if (gamepadPeer) {
            log('[disconnect] unsetting gamepadPeer', gamepadPeer.player);
            gamepadPeer.gamepadPeer = null;
            client.gamepadPeer = null;
            this.waitingSocketGamepads[gamepadPeer.player] = gamepadPeer;
        }
    }.bind(this));

    client.on('gamepad', function (data) {
        log('[gamepad] Forwarding gamepad message to gamepad:', data);
        if (client.gamepadPeer) {
            client.gamepadPeer.send('gamepad', data);
        }
    });

    client.on('rtc.peer', function (data) {
        var playerID = data.player;
        var peerGamepad = this.waitingRtcGamepads[playerID];

        log('\n\n[rtc.peer] Peer request made for player', playerID);

        // Initiator or not.
        if (peerGamepad && peerGamepad !== client &&
            peerGamepad.socket.readyState === 1) {

            log('[rtc.peer] Found a waiting peer');

            // Send a wink!
            client.send('rtc.peer', {initiator: true});
            peerGamepad.send('rtc.peer');

            // Swap numbers ;)
            client.peer = peerGamepad;
            peerGamepad.peer = client;

            // Wait no more!
            this.waitingRtcGamepads[playerID] = null;
        } else {
            // Waiting for a friend.
            this.waitingRtcGamepads[playerID] = client;
            log('[rtc.peer] No peer found yet, waiting…');
        }
    }.bind(this));

    client.on('rtc.signal', function (data) {
        log('[rtc.signal] Signal recieved');
        if (client.peer) {
            client.peer.send('rtc.signal', data);
        } else {
            warn('[rtc.signal] Signal with no peer!');
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
        this.waitingRtcGamepads[playerID] = client;
    }.bind(this));
};


module.exports = Gamepad;
