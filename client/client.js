pc.script.create('client', function (context) {
    
    var tmpVec = new pc.Vec3();
    var uri = new pc.URI(window.location.href);
    var query = uri.getQuery();
    var gamepadNum = query.gamepad;

    var Client = function (entity) {
        this.entity = entity;
        this.id = null;
        this.movement = [ 0, 0 ];
        context.keyboard = new pc.input.Keyboard(document.body);
        
        document.body.style.cursor = 'none';
    };
    
    var getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    function guLoadUser(client) {
        localforage.getItem('gamertoken', function(err, gamertoken) {
            if (gamertoken) {
                client.gamertoken = gamertoken;
                ident(client);
                return;
            }
            localforage.getItem('gameruuid', function(err, gameruuid) {
                if (!gameruuid) {
                    console.log('Could not find "gameruuid" in localStorage, generating a new one.');
                    var uuid = UUID.generate();
                    localforage.setItem('gameruuid', uuid, function(err, val) {
                        gameruuid = uuid;
                        guLogin(client, gameruuid);
                    });
                    return;
                }
                guLogin(client, gameruuid);
            });
        });
    }
    
    function guLogin(client, gameruuid) {
        client.guclient.loginAnonymous(gameruuid, {
            success: function(status, data) {
                localforage.setItem('gamertoken', data.token, function(err, val) {
                    client.gamertoken = data.token;
                    ident(client);
                });
            },
            error: function(status, response) {
                console.log(response);
            }
        });
    }
    
    function ident(client) {
        client.guclient.getGamer(client.gamertoken, {
            success: function(status, data) {
                client.socket.send('user.name', data.nickname);
            },
            error: function(status, response) {
                console.log(response);
            }
        });
    }

    Client.prototype = {
        initialize: function () {
            this.guclient = new GameUp.Client("1c1720c127e44de0a472f2617722ee19");
            
            this.tanks = context.root.getChildren()[0].script.tanks;
            this.bullets = context.root.getChildren()[0].script.bullets;
            this.pickables = context.root.getChildren()[0].script.pickables;
            this.teams = context.root.getChildren()[0].script.teams;
            this.profile = context.root.getChildren()[0].script.profile;
            
            var self = this;
            var servers = {
                'local': 'http://localhost:30043/socket', // local
                // 'us': 'http://54.67.22.188:30043/socket', // us
                // 'default': 'https://tanx.playcanvas.com/socket' // load balanced
                'default': 'http://gutanx.gameup.io:8080/socket'
            };

            var env = getParameterByName('server') || 'default';
            var url = env && servers[env] || servers['default'];

            var socket = this.socket = new Socket({ url: url });
            
            this.connected = false;
            
            socket.on('error', function(err) {
                console.log(err);
            });
            
            socket.on('init', function(data) {
                self.id = data.id;
                self.connected = true;
                
                guLoadUser(self);
                
                users.on(self.id + ':name', function(name) {
                    self.profile.set(name);
                });
            });
            
            users.bind(socket);
            
            socket.on('tank.new', function(data) {
                self.tanks.new(data);
            });
            
            socket.on('tank.delete', function(data) {
                self.tanks.delete(data);
            });
            
            var dataQueue = [ ];
            
            socket.on('update', function(data) {
                // bullets add
                if (data.bullets) {
                    for(var i = 0; i < data.bullets.length; i++)
                        self.bullets.new(data.bullets[i]);
                }
                
                // bullets delete
                if (data.bulletsDelete) {
                    for(var i = 0; i < data.bulletsDelete.length; i++)
                        self.bullets.finish(data.bulletsDelete[i]);
                }
                
                // pickables add
                if (data.pickable) {
                    for(var i = 0; i < data.pickable.length; i++)
                        self.pickables.new(data.pickable[i]);
                }
                
                // pickable delete
                if (data.pickableDelete) {
                    for(var i = 0; i < data.pickableDelete.length; i++)
                        self.pickables.finish(data.pickableDelete[i]);
                }
                
                // tanks update
                if (data.tanks)
                    self.tanks.updateData(data.tanks);

                // tanks respawn
                if (data.tanksRespawn) {
                    for(var i = 0; i < data.tanksRespawn.length; i++)
                        self.tanks.respawn(data.tanksRespawn[i]);
                }
                
                // teams score
                if (data.teams) {
                    for(var i = 0; i < data.teams.length; i++) {
                        self.teams.teamScore(i, data.teams[i]);
                    }
                }
                
                // winner
                if (data.winner) {
                    self.shoot(false);
                    self.teams.teamWin(data.winner);
                }
            });

            context.mouse.on('mousedown', this.onMouseDown, this);
            context.mouse.on('mouseup', this.onMouseUp, this);
            
            this.gamepadConnected = false;
            this.gamepadActive = false;
            
            window.addEventListener('gamepadconnected', function () {
                this.gamepadConnected = true;
            }.bind(this));
            window.addEventListener('gamepaddisconnected', function () {
                this.gamepadConnected = false;
            }.bind(this));
            
            // Chrome doesn't have the gamepad events, and we can't
            // feature detect them in Firefox unfortunately.
            if ('chrome' in window) {
                // This is a lie, but it lets us begin polling.
                this.gamepadConnected = true;
            }
        },

        update: function (dt) {
            if (! this.connected)
                return;
                
            // WASD movement
            var movement = [
                context.keyboard.isPressed(pc.input.KEY_D) - context.keyboard.isPressed(pc.input.KEY_A),
                context.keyboard.isPressed(pc.input.KEY_S) - context.keyboard.isPressed(pc.input.KEY_W)
            ];
            
            // ARROWs movement
            movement[0] += context.keyboard.isPressed(pc.input.KEY_RIGHT) - context.keyboard.isPressed(pc.input.KEY_LEFT);
            movement[1] += context.keyboard.isPressed(pc.input.KEY_DOWN) - context.keyboard.isPressed(pc.input.KEY_UP);
            
            // gamepad controls
            // AUTHORS: Potch and cvan
            if (context.gamepads.gamepadsSupported && this.gamepadConnected) {
                var gamepadIdx = gamepadNum - 1;

                if (!context.gamepads.poll()[gamepadIdx]) {
                    // If it was active at one point, reset things.
                    if (self.gamepadActive && self.link && self.link.mouse) {
                        self.link.mouse.move = true;
                        this.gamepadActive = false;
                    }
                } else {
                    // Gamepad movement axes.
                    var x = context.gamepads.getAxis(gamepadIdx, pc.PAD_L_STICK_X);
                    var y = context.gamepads.getAxis(gamepadIdx, pc.PAD_L_STICK_Y);
                    if ((x * x + y * y) > .25) {
                        movement[0] += x;
                        movement[1] += y;
                    }

                    // Gamepad firing axes.
                    var gpx = context.gamepads.getAxis(gamepadIdx, pc.PAD_R_STICK_X);
                    var gpy = context.gamepads.getAxis(gamepadIdx, pc.PAD_R_STICK_Y);

                    if (x || y || gpx || gpy) {
                        this.gamepadActive = true;

                        if (this.link && this.link.mouse) {
                            this.link.mouse.move = false;

                            // TODO: Figure out how to hide cursor without destroying
                            // (so we can show the cursor again if gamepad is disconnected).
                            var target = context.root.findByName('target');
                            if (target) {
                                target.destroy();
                            }
                        }
                    }

                    // Gamepad shooting.
                    if (gpx * gpx + gpy * gpy > .25) {
                        this.shoot(true);

                        if (this.link) {
                            this.link.mPos = [
                                gpx / 2 * (context.graphicsDevice.width / 2),
                                gpy / 2 * (context.graphicsDevice.height / 2)
                            ];

                            this.link.angle = Math.floor(Math.atan2(gpx, gpy) / (Math.PI / 180) + 45);
                            this.link.link.targeting(this.link.angle);
                        }
                    } else {
                        this.shoot(false);
                    }
                }
            }
            
            // rotate vector
            var t =       movement[0] * Math.sin(Math.PI * 0.75) - movement[1] * Math.cos(Math.PI * 0.75);
            movement[1] = movement[1] * Math.sin(Math.PI * 0.75) + movement[0] * Math.cos(Math.PI * 0.75);
            movement[0] = t;
            
            // check if it is changed
            if (movement[0] !== this.movement[0] || movement[1] != this.movement[1]) {
                this.movement = movement;
                this.socket.send('move', this.movement);
            }
        },
        
        onMouseDown: function() {
            this.shoot(true);
        },
        
        onMouseUp: function() {
            this.shoot(false);
        },
        
        shoot: function(state) {
            if (! this.connected)
                return;
                
            if (this.shootingState !== state) {
                this.shootingState = state;
                
                this.socket.send('shoot', this.shootingState);
            }
        }
    };

    return Client;
});