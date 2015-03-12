pc.script.create('touch', function (context) {
    // Creates a new Touch instance
    var Touch = function (entity) {
        
        document.body.style.userSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.khtmlUserSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        
        this.entity = entity;
        this.touch = 'ontouchstart' in document.documentElement;
        this.touches = { };
        
        this.size = 2 * 74 + 16;
        this.joyPadding = 6;
        this.vec = new pc.Vec2(0, 0);
        this.tmp = new pc.Vec2(0, 0);
        
        if (this.touch) {
            this.joyLeft = document.createElement('canvas');
            this.joyLeft.width = this.size;
            this.joyLeft.height = this.size;
            this.joyLeft.ctx = this.joyLeft.getContext('2d');
            this.joyLeft.style.position = 'absolute';
            this.joyLeft.style.left = this.joyPadding + 'px';
            this.joyLeft.style.bottom = this.joyPadding + 'px';
            
            var ctx = this.joyLeft.ctx;
            this.drawHex(ctx, 'rgba(255, 255, 255, .07)');
            
            document.body.appendChild(this.joyLeft);
            
            this.joyRight = document.createElement('canvas');
            this.joyRight.width = this.size;
            this.joyRight.height = this.size;
            this.joyRight.ctx = this.joyRight.getContext('2d');
            this.joyRight.style.position = 'absolute';
            this.joyRight.style.right = this.joyPadding + 'px';
            this.joyRight.style.bottom = this.joyPadding + 'px';
            
            ctx = this.joyRight.ctx;
            this.drawHex(ctx, 'rgba(255, 255, 255, .07)');
            
            document.body.appendChild(this.joyRight);
            
            this.lastMove = Date.now();
            this.lastRender = Date.now();
            
            this.lastVec = [ 0, 0 ];
            this._hidden = true;
        }
    };

    Touch.prototype = {
        initialize: function () {
            if (! this.touch) return;
            
            window.addEventListener('touchstart', this.onTouchStart.bind(this), true);
            window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
            window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
            
            this.client = context.root.getChildren()[0].script.client;
            this.link = context.root.findByName('camera').script.link;
            
            this.resize(true);
        },
        
        resize: function(force) {
            if (! this.joyLeft || ! this.joyRight)
                return;
                
            var size = Math.max(2, Math.min(4, Math.floor(window.innerWidth / 240))) * 69 + 24;
            
            if (size !== this.size || force) {
                this.size = size;
                this.joyLeft.width = this.size;
                this.joyLeft.height = this.size;
                this.joyRight.width = this.size;
                this.joyRight.height = this.size;
                
                var ctx = this.joyLeft.ctx;
                this.drawHex(ctx, 'rgba(255, 255, 255, .07)', '#2ecc71');
                
                ctx = this.joyRight.ctx;
                this.drawHex(ctx, 'rgba(255, 255, 255, .07)', '#2ecc71');
            }
        },
        
        hidden: function(state) {
            if (this._hidden == state)
                return;
                
            this._hidden = state;
            this.resize(true);
        },
        
        drawHex: function(ctx, color, stroke) {
            if (this._hidden)
                return;
                
            ctx.beginPath();
            for (var i = 0; i < 11; i++) {
                ctx.lineTo(this.size / 2 * Math.sin(Math.PI * 2 / 10 * (i + .5)) + this.size / 2, this.size / 2 * Math.cos(Math.PI * 2 / 10 * (i + .5)) + this.size / 2);
            }
            ctx.fillStyle = color;
            ctx.fill();
        },

        update: function (dt) {
            if (! this.touch)
                return;

            this.resize();
            
            if (this.client.connected) {
                this.forEach('start', function(touch) {
                    var rect = this.joyLeft.getBoundingClientRect();
                    this.vec.set(touch.x - rect.left - this.size / 2, touch.y - rect.top - this.size / 2);
                    if (this.vec.length() < (this.size / 2)) {
                        touch.joy = this.joyLeft;
                    }
                    
                    rect = this.joyRight.getBoundingClientRect();
                    this.vec.set(touch.x - rect.left - this.size / 2, touch.y - rect.top - this.size / 2);
                    if (this.vec.length() < (this.size / 2)) {
                        touch.joy = this.joyRight;
                    }
                }.bind(this));
                
                var aimed = false;
                
                this.forEach('down', function(touch) {
                    if (! touch.joy) return;
                   
                    var rect = touch.joy.getBoundingClientRect();
                    this.vec.set(touch.x - rect.left - this.size / 2, touch.y - rect.top - this.size / 2);
                    
                    if (this.vec.length() > this.size / 2 - 24) {
                        this.vec.normalize().mul(this.tmp.set(this.size / 2 - 24, this.size / 2 - 24));
                    }
                    
                    var ctx = touch.joy.ctx;
                    ctx.clearRect(0, 0, touch.joy.width, touch.joy.height);
                    
                    if (! this._hidden) {
                        this.drawHex(ctx, 'rgba(255, 255, 255, .03)', '#2ecc71');
        
                        ctx.beginPath();
                        for (var i = 0; i < 11; i++) {
                            ctx.lineTo(24 * Math.sin(Math.PI * 2 / 10 * i) + this.size / 2 + this.vec.x, 24 * Math.cos(Math.PI * 2 / 10 * i) + this.size / 2 + this.vec.y);
                        }
                        ctx.fillStyle = 'rgba(255, 255, 255, .2)';
                        ctx.fill();
                    }
                    
                    if (touch.joy == this.joyRight && this.link.link) {
                        aimed = true;
                        this.link.mPos = [ (this.vec.x / (this.size / 2)) * (context.graphicsDevice.width / 2), (this.vec.y / (this.size / 2)) * (context.graphicsDevice.height / 2) ];
                        this.vec.normalize();
                        
                        var t =      this.vec.x * Math.sin(Math.PI * 0.75) - this.vec.y * Math.cos(Math.PI * 0.75);
                        this.vec.y = this.vec.y * Math.sin(Math.PI * 0.75) + this.vec.x * Math.cos(Math.PI * 0.75);
                        this.vec.x = t;
                        
                        this.link.angle = Math.floor(Math.atan2(this.vec.x, this.vec.y) / (Math.PI / 180));
                        this.link.link.targeting(this.link.angle);
                        this.client.shoot(true);
                    } else if (touch.joy == this.joyLeft) {
                        this.tmp.copy(this.vec);
                        this.vec.normalize();
                        
                        var t =      this.vec.x * Math.sin(Math.PI * 0.75) - this.vec.y * Math.cos(Math.PI * 0.75);
                        this.vec.y = this.vec.y * Math.sin(Math.PI * 0.75) + this.vec.x * Math.cos(Math.PI * 0.75);
                        this.vec.x = t;
                        
                        if (Date.now() - this.lastMove > 100) {
                            this.lastMove = Date.now();

                            var moveX = parseFloat(this.vec.x.toFixed(1));
                            var moveY = parseFloat(this.vec.y.toFixed(1));
                            
                            if (this.lastVec[0] !== moveX || this.lastVec[1] !== moveY) {
                                this.lastVec[0] = moveX;
                                this.lastVec[1] = moveY;
                                this.client.socket.send('move', this.lastVec);
                            }
                        }
                        
                        if (! aimed) {
                            this.link.mPos = [ (this.tmp.x / (this.size / 2)) * (context.graphicsDevice.width / 2), (this.tmp.y / (this.size / 2)) * (context.graphicsDevice.height / 2) ];
                            this.link.angle = Math.floor(Math.atan2(this.vec.x, this.vec.y) / (Math.PI / 180));
                            this.link.link.targeting(this.link.angle);
                        }
                    }
                }.bind(this));

                this.forEach('end', function(touch) {
                    if (! touch.joy) return;
                    
                    var ctx = touch.joy.ctx;
                    ctx.clearRect(0, 0, touch.joy.width, touch.joy.height);
                    
                    if (! this._hidden)
                        this.drawHex(ctx, 'rgba(255, 255, 255, .1)', '#2ecc71');
    
                    if (touch.joy == this.joyRight) {
                        this.client.shoot(false);
                    } else {
                        this.client.socket.send('move', [ 0, 0 ]);
                    }
                    
                    if (! aimed || touch.joy == this.joyRight) {
                        this.link.mPos = [ 0, 0 ];
                    }
                }.bind(this));
            }
            
            this.touchFlush();
        },
        
        onTouchStart: function(evt) {
            var i = evt.touches.length, id;
            while(i--) {
                id = evt.touches[i].identifier;
                if (this.touches[id]) continue;
                
                this.touches[id] = {
                    x: evt.touches[i].clientX,
                    y: evt.touches[i].clientY,
                    start: true
                };
            }
            evt.preventDefault();
        },
        
        onTouchEnd: function(evt) {
            var i = evt.changedTouches.length, id;
            while(i--) {
                id = evt.changedTouches[i].identifier;
                if (this.touches[id] !== undefined && ! this.touches[id]['end']) {
                    delete this.touches[id]['start'];
                    delete this.touches[id]['down'];
                    this.touches[id]['end'] = true;
                }
            }
            evt.preventDefault();
        },
        
        onTouchMove: function(evt) {
            var i = evt.touches.length, id;
            while(i--) {
                id = evt.touches[i].identifier;
                if (! this.touches[id]) continue;
                
                this.touches[id].x = evt.touches[i].clientX;
                this.touches[id].y = evt.touches[i].clientY;
            }
            evt.preventDefault();
        },
        
        touchFlush: function() {
            for(var id in this.touches) {
                if (this.touches[id]['start']) {
                    delete this.touches[id]['start'];
                    this.touches[id]['down'] = true;
                }
                if (this.touches[id]['end']) {
                    delete this.touches[id];
                }
            }
        },
        
        forEach: function(state, fn) {
            for(var id in this.touches) {
                if (this.touches[id][state]) {
                    fn(this.touches[id]);
                }
            }
        }
    };

    return Touch;
});