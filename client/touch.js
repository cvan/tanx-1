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
        
        drawHex: function(ctx, color, stroke) {
            ctx.beginPath();
            for (var i = 0; i < 7; i++) {
                ctx.lineTo(this.size / 2 * Math.sin(Math.PI * 2 / 6 * i) + this.size / 2, this.size / 2 * Math.cos(Math.PI * 2 / 6 * i) + this.size / 2);
            }
            ctx.fillStyle = color;
            ctx.fill();
            if (stroke) {
                ctx.strokeStyle = stroke;
                ctx.stroke();
            }
        },

        update: function (dt) {
            if (! this.touch) return;
            
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
                
                this.forEach('down', function(touch) {
                    if (! touch.joy) return;
                   
                    var rect = touch.joy.getBoundingClientRect();
                    this.vec.set(touch.x - rect.left - this.size / 2, touch.y - rect.top - this.size / 2);
                    
                    if (this.vec.length() > this.size / 2 - 24) {
                        this.vec.normalize().mul(this.tmp.set(this.size / 2 - 24, this.size / 2 - 24));
                    }
                    
                    var ctx = touch.joy.ctx;
                    ctx.clearRect(0, 0, touch.joy.width, touch.joy.height);
                    
                    this.drawHex(ctx, 'rgba(255, 255, 255, .03)', '#2ecc71');
    
                    ctx.beginPath();
                    for (var i = 0; i < 7; i++) {
                        ctx.lineTo(24 * Math.sin(Math.PI * 2 / 6 * i) + this.size / 2 + this.vec.x, 24 * Math.cos(Math.PI * 2 / 6 * i) + this.size / 2 + this.vec.y);
                    }
                    ctx.fillStyle = 'rgba(255, 255, 255, .1)';
                    ctx.fill();
                    ctx.strokeStyle = '#2ecc71';
                    ctx.stroke();
                    
                    if (touch.joy == this.joyRight && this.link.link) {
                        this.link.mPos = [ (this.vec.x / (this.size / 2)) * (context.graphicsDevice.width / 2), (this.vec.y / (this.size / 2)) * (context.graphicsDevice.height / 2) ];
                        this.vec.normalize();
                        
                        var t =      this.vec.x * Math.sin(Math.PI * 0.75) - this.vec.y * Math.cos(Math.PI * 0.75);
                        this.vec.y = this.vec.y * Math.sin(Math.PI * 0.75) + this.vec.x * Math.cos(Math.PI * 0.75);
                        this.vec.x = t;
                        
                        this.link.angle = Math.floor(Math.atan2(this.vec.x, this.vec.y) / (Math.PI / 180));
                        this.link.link.targeting(this.link.angle);
                        this.client.shoot(true);
                    } else if (touch.joy == this.joyLeft) {
                        if (Date.now() - this.lastMove > 200) {
                            this.lastMove = Date.now();
                            this.vec.normalize();
                            
                            var t =      this.vec.x * Math.sin(Math.PI * 0.75) - this.vec.y * Math.cos(Math.PI * 0.75);
                            this.vec.y = this.vec.y * Math.sin(Math.PI * 0.75) + this.vec.x * Math.cos(Math.PI * 0.75);
                            this.vec.x = t;
    
                            this.client.socket.send('move', [ this.vec.x, this.vec.y ]);
                        }
                    }
                    
                }.bind(this));
                
                this.forEach('end', function(touch) {
                    if (! touch.joy) return;
                    
                    var ctx = touch.joy.ctx;
                    ctx.clearRect(0, 0, touch.joy.width, touch.joy.height);
                    
                    this.drawHex(ctx, 'rgba(255, 255, 255, .1)', '#2ecc71');
    
                    if (touch.joy == this.joyRight) {
                        this.client.shoot(false);
                        this.link.mPos = [ 0, 0 ];
                    } else {
                        this.client.socket.send('move', [ 0, 0 ]);
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