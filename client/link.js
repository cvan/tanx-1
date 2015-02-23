var tmpVec = new pc.Vec3();

pc.script.create('link', function (context) {
    var Link = function (entity) {
        this.entity = entity;
        this.entity.link = this.link.bind(this);
        this.link = null;
        this.vec = new pc.Vec2();
        this.angle = 0;
        this.lastAngle = 0;
        this.lastSend = 0;
        this.mPos = [ 0, 0 ];
    };

    Link.prototype = {
        initialize: function () {
            context.mouse.on(pc.input.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.client = context.root.getChildren()[0].script.client;
            
            if (! ('ontouchstart' in document.documentElement)) {
                this.target = context.root.findByName('target');
                this.mouse = {
                    move: false,
                    x: 0,
                    y: 0
                };
            } else {
                context.root.findByName('target').destroy();
            }
        },

        update: function (dt) {
            if (this.link) {
                var target = this.link;
                
                // choose focus target
                if (this.link.script.tank.dead) {
                    if (this.target)
                        this.target.enabled = false;
                        
                    if (this.link.script.tank.killer && this.link.script.tank.killer.script && ! this.link.script.tank.killer.script.tank.dead) {
                        // focus on killer
                        target = this.link.script.tank.killer;
                    } else {
                        target = null;
                    }
                } else {
                    if (this.target)
                        this.target.enabled = true;
                }
                
                if (target) {
                    // rotate vector
                    var rot = this.mPos.slice(0);
                    var t =  rot[0] * Math.sin(Math.PI * 0.75) - rot[1] * Math.cos(Math.PI * 0.75);
                    rot[1] = rot[1] * Math.sin(Math.PI * 0.75) + rot[0] * Math.cos(Math.PI * 0.75);
                    rot[0] = t;
                    
                    tmpVec.set(
                        target.getPosition().x + 8 + (rot[0] / (context.graphicsDevice.width / 2) * 4),
                        12,
                        target.getPosition().z + 8 + (rot[1] / (context.graphicsDevice.height / 2) * 4)
                    );
                    this.entity.setPosition(tmpVec.lerp(this.entity.getPosition(), tmpVec, 0.1));
                }
                
                if (this.mouse && this.mouse.move) {
                    // camera offset
                    this.mPos[0] = this.mouse.x - context.graphicsDevice.width / 2;
                    this.mPos[1] = this.mouse.y - context.graphicsDevice.height / 2;
                    
                    // cursor
                    var point = this.entity.camera.screenToWorld(this.mouse.x, this.mouse.y, 2);
                    if (this.target)
                        this.target.setPosition(point);
                    
                    // targeting
                    if (! this.link.script.tank.dead) {
                        var self = this;
                        var from = this.entity.getPosition();
                        var to = this.entity.camera.screenToWorld(this.mouse.x, this.mouse.y, this.entity.camera.farClip);

                        // raycast
                        context.systems.rigidbody.raycastFirst(from, to, function(result) {
                            // relative pont
                            result.point.sub(self.link.getPosition()).normalize();
                            // angle
                            self.angle = Math.floor(Math.atan2(result.point.x, result.point.z) / (Math.PI / 180));
                            // target
                            self.link.targeting(self.angle);
                        });
                    }
                }
                
                // var halfW = context.graphicsDevice.width / 2;
                // var halfH = context.graphicsDevice.height / 2;
                
                
                // var screenX = (this.mouse.x - halfW) / halfW;
                // var screenY = (this.mouse.y - halfH) / halfH;
                // this.rayVec.set(screenX, screenY, 1.0);
                // this.rayVec.normalize();
                
                // // console.log(this.rayVec.x, this.rayVec.y, this.rayVec.z)
                
                // this.pickHelper.setEulerAngles(this.rayVec.y * 90, this.rayVec.x * 90, 0);
                
                // console.log(screenX, screenY)
            }
            
            if (Date.now() - this.lastSend > 100 && this.angle !== this.lastAngle) {
                this.lastSend = Date.now();
                this.lastAngle = this.angle;
                
                this.client.socket.send('target', this.angle);
            }
        },
        
        onMouseMove: function(evt) {
            this.mouse.x = evt.x;
            this.mouse.y = evt.y;
            this.mouse.move = true;
            
            // if (this.link) {
            //     // camera offset
            //     this.mPos[0] = evt.x - context.graphicsDevice.width / 2;
            //     this.mPos[1] = evt.y - context.graphicsDevice.height / 2;
                
            //     // targeting
            //     if (! this.link.script.tank.dead) {
            //         var self = this;
            //         var from = this.entity.getPosition();
            //         var to = this.entity.camera.screenToWorld(evt.x, evt.y, this.entity.camera.farClip);
    
            //         // raycast
            //         context.systems.rigidbody.raycastFirst(from, to, function(result) {
            //             // relative pont
            //             result.point.sub(self.link.getPosition()).normalize();
            //             // angle
            //             self.angle = Math.floor(Math.atan2(result.point.x, result.point.z) / (Math.PI / 180));
            //             // target
            //             self.link.targeting(self.angle);
            //         });
            //     }
            // }
        },
        
        link: function(tank) {
            this.link = tank;
        }
    };

    return Link;
});