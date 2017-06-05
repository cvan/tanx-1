var tmpVec = new pc.Vec3();
var tmpQuat = new pc.Quat();

var slerp = function (lhs, rhs, alpha) {
    var q1x, q1y, q1z, q1w, q2x, q2y, q2z, q2w,
        omega, cosOmega, invSinOmega, flip, beta;

    q1x = lhs.x;
    q1y = lhs.y;
    q1z = lhs.z;
    q1w = lhs.w;

    q2x = rhs.x;
    q2y = rhs.y;
    q2z = rhs.z;
    q2w = rhs.w;

    cosOmega = q1x * q2x + q1y * q2y + q1z * q2z + q1w * q2w;

    // If B is on opposite hemisphere from A, use -B instead
    flip = cosOmega < 0;
    if (flip) {
        cosOmega *= -1;
    }

    // Complementary interpolation parameter
    beta = 1 - alpha;

    if (cosOmega < 1) {
        omega = Math.acos(cosOmega);
        invSinOmega = 1 / Math.sin(omega);

        beta = Math.sin(omega * beta) * invSinOmega;
        alpha = Math.sin(omega * alpha) * invSinOmega;

        if (flip) {
            alpha = -alpha;
        }
    }

    this.x = beta * q1x + alpha * q2x;
    this.y = beta * q1y + alpha * q2y;
    this.z = beta * q1z + alpha * q2z;
    this.w = beta * q1w + alpha * q2w;

    return this;
};

var names = document.createElement('div');
names.id = 'names';
document.body.appendChild(names);

pc.script.create('tank', function (context) {
    var matBase = null;
    var matTracks = null;
    var matGlow = null;
    // var matBullet = null;
    
    var css = function() {/*
        #names {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: auto;
            height: auto;
            overflow: hidden;
        }
        #names > div {
            display: none;
            color: rgba(255, 255, 255, .7);
            position: absolute;
            font-size: 12px;
            line-height: 16px;
            width: 128px;
            text-align: center;
            margin: -16px 0 0 -64px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-smoothing: antialiased;
        }
        #names > div.active {
            display: block;
        }
        @media all and (max-width: 640px) {
            #names > div {
                
            }
        }
    */};
    css = css.toString().trim();
    css = css.slice(css.indexOf('/*') + 2).slice(0, -3);

    var style = document.createElement('style');
    style.innerHTML = css;
    document.querySelector('head').appendChild(style);
    
    var camera = null;
    
    var Tank = function (entity) {
        this.entity = entity;
        this.entity.angle = this.angle.bind(this);
        this.entity.targeting = this.targeting.bind(this);
        
        this.movePoint = new pc.Vec3();
        this.targetPoint = new pc.Quat();
        
        this.matBase = null;
        this.head = null;
        this.hpBar = null;
        
        this.hp = 0;
        this.sp = 0;
        
        this.ind = 0;

        this._hidden = false;
    };

    Tank.prototype = {
        initialize: function () {
            if (! camera)
                camera = context.root.findByName('camera').camera;
                
            var self = this;
            // profile
            this.profile = context.root.getChildren()[0].script.profile;
            
            // find head
            this.head = this.entity.findByName('head');
            
            // find shiela model
            this.auraShield = this.entity.findByName('shield');

            // name
            var name = this.name = document.createElement('div');
            var user = users.get(this.entity.owner);
            this.name.textContent = (user && user.name) || 'guest';
            users.on(this.entity.owner + ':name', function(text) {
                name.textContent = text;
            });
            document.getElementById('names').appendChild(this.name);
            this.nameVec = new pc.Vec3();

            // find hpBar
            this.hpBar = this.head.findByName('hp');
            this.hpBarLeft = this.hpBar.findByName('left');
            this.hpBarRight = this.hpBar.findByName('right');
            
            // clone material
            if (matBase === null) {
                matBase = context.assets.find('tank').resource;
                matTracks = context.assets.find('tracks').resource;
                matGlow = context.assets.find('tank-glow').resource;
            }
            
            this.matBase = matBase.clone();
            this.matTracks = matTracks.clone();
            this.matGlow = matGlow.clone();
            
            this.tracksOffset = 0;
            
            this.blinkParts = this.entity.findByLabel('sub-part');

            // put new material on each sub-part
            this.blinkParts.forEach(function(entity) {
                var meshes = entity.model.model.meshInstances;
                for(var i = 0; i < meshes.length; i++) {
                    if (meshes[i].node.name === 'Caterpillar') {
                        meshes[i].material = this.matTracks;
                    } else {
                        meshes[i].material = this.matBase;
                    }
                }
            }.bind(this));
            
            // add shadow to blinkParts
            this.blinkParts.push(this.entity.findByName('shadow'));
            this.blinkParts.push(this.hpBar);
            this.blinkParts.push(this.name);
            this.blinkParts.push(this.auraShield);
            // glow
            var glow = this.entity.findByName('glow');
            glow.model.material = this.matGlow;
            this.blinkParts.push(glow);

            this.entity.fire('ready');
            
            this.movePoint.copy(this.entity.getPosition());
            
            this.respawned = Date.now();
            this.dead = true;
            this.deadBefore = true;
            this.flashState = false;
            
            if (context.root.getChildren()[0].script.client.id === this.entity.owner) {
                this.own = true;
                // this.uiHP = context.root.getChildren()[0].script.hp;
                this.overlay = context.root.getChildren()[0].script.overlay;
                this.minimap = context.root.getChildren()[0].script.minimap;
            }
            this.teams = context.root.getChildren()[0].script.teams;
            
            this.entity.on('culled', function(state) {
                if (! self.dead)
                    self.hidden(state);
            });
        },
        
        destroy: function() {
            this.name.parentNode.removeChild(this.name);
        },

        update: function (dt) {
            var pos = this.entity.getPosition();
            
            if (this.deadBefore && ! this.dead) {
                // respawned
                this.deadBefore = false;
                this.respawned = Date.now();
                // show stuff
                this.hidden(false);
                // killer
                if (this.own) {
                    this.overlay.killer(false);
                    this.overlay.cinematic(false);
                    this.overlay.overlay(false);
                    this.minimap.state(true);
                }
                
            } else if (this.dead && ! this.deadBefore) {
                // died
                this.deadBefore = true;
                // hide
                this.hidden(true);
                
                if (this.own) {
                    // hp ui
                    // this.uiHP.set(0);
                    // vibrate
                    if (window.navigator.vibrate)
                        window.navigator.vibrate(100 + Math.floor(Math.random() * 100));

                    // killer
                    var killerUser = this.killer && users.get(this.killer.owner);
                    var name = (killerUser && killerUser.name) || 'guest';
                    this.overlay.killer(name, this.teams.names[this.killer && this.killer.script && this.killer.script.tank.team]);
                    // cinematic
                    this.overlay.cinematic(true);
                    this.overlay.overlay(.2);
                    this.overlay.timer(5);
                    this.minimap.state(false);
                }
                
                // explosion
                this.entity.audiosource.pitch = Math.random() * 0.6 - 0.3 + 1.0;
                this.entity.audiosource.play('tank_explosion');
                
                // particles
                var i = Math.floor(Math.random() * 4 + 2);
                while(i--) {
                    context.root.getChildren()[0].script.fires.new({
                        x: pos.x + (Math.random() - 0.5) * 2,
                        z: pos.z + (Math.random() - 0.5) * 2,
                        size: Math.random() * 2 + 2,
                        life: Math.floor(Math.random() * 400 + 300)
                    });
                }
            }
            // rotation
            tmpVec.copy(pos);
            var len = tmpVec.sub(this.movePoint).length();
            if (len > 0.2) {
                var angle = Math.floor(Math.atan2(pos.x - this.movePoint.x, pos.z - this.movePoint.z) / (Math.PI / 180));
                tmpQuat.setFromEulerAngles(0, angle + 180, 0);
                slerp.call(tmpQuat, this.entity.getRotation(), tmpQuat, 0.2);
                this.entity.setRotation(tmpQuat);
            }
            
            // movement
            tmpVec.lerp(pos, this.movePoint, 0.1);
            this.entity.setPosition(tmpVec);
            // if (! isNaN(tmpVec.x) && len > .001) {
            //     var sp = 6;
            //     if (len > 1)
            //         sp = sp * 2;
                    
            //     if (len > sp * dt)
            //         len = sp * dt;
            //     tmpVec.normalize().scale(len);
            //     this.entity.setPosition(pos.sub(tmpVec));
            // }
            
            // targeting
            slerp.call(tmpQuat, this.head.getRotation(), this.targetPoint, 0.3);
            this.head.setRotation(tmpQuat);
            
            if (Date.now() - this.respawned < 1500) {
                var state = (Math.floor((Date.now() - this.respawned) / 100) % 2) == 1;
                if (this.flashState !== state) {
                    this.flashState = state;
                    // parts
                    this.hidden(! state);
                }
            } else if (! this.flashState) {
                this.flashState = true;
                // parts
                this.hidden(false);
            }
            
            if (! this._hidden) {
                // shield
                if (this.sp) {
                    this.auraShield.enabled = true;
                    this.auraShield.setRotation(0, 0, 0, 1);
                    this.auraShield.rotate(0, 45, 0);
                } else {
                    this.auraShield.enabled = false;
                }
            
                // hp bar
                this.hpBar.setRotation(0, 0, 0, 1);
                this.hpBar.rotate(0, 45, 0);
                
                // name
                var pos = this.hpBar.getPosition();
                pos.y += .1;
                camera.worldToScreen(pos, this.nameVec);
                this.name.style.left = Math.floor(this.nameVec.x) + 'px';
                this.name.style.top = Math.floor(this.nameVec.y) + 'px';
            }
        },
        
        setHP: function(hp) {
            if (this.hp == hp) return;
            
            if (this.hp > hp) {
                this.entity.audiosource.pitch = Math.random() * 0.6 - 0.3 + 1.0;
                this.entity.audiosource.play('hit');
                
                if (this.own && window.navigator.vibrate)
                    window.navigator.vibrate(30 + Math.floor(Math.random() * 40));
            }
            this.hp = hp;
            
            var left = Math.min(10, hp / 10);
            this.hpBarLeft.setLocalScale(left, 0.1, 0.1);
            this.hpBarLeft.setLocalPosition(-Math.max(0.01, 1 - left) / 2, 0, 0);
            this.hpBarRight.setLocalScale(Math.max(0.01, 1 - left), 0.1, 0.1);
            this.hpBarRight.setLocalPosition(left / 2, 0, 0);
            
            // if (this.own)
            //     this.uiHP.set(hp);
        },
        
        setSP: function(sp) {
            if (this.sp == sp)
                return;
            
            if (this.sp > sp) {
                this.entity.audiosource.pitch = Math.random() * 0.6 - 0.3 + 1.0;
                this.entity.audiosource.play('hit-shield');
                
                if (this.own && window.navigator.vibrate)
                    window.navigator.vibrate(20 + Math.floor(Math.random() * 30));
            }

            this.sp = sp;
        },
        
        setName: function(canvas) {
            this.name.model.material.emissiveMap.setSource(canvas);
        },
        
        setDead: function(dead) {
            if (this.dead == dead)
                return;
                
            this.dead = dead;
        },
        
        angle: function(angle) {
            this.entity.setRotation(this.entity.getRotation().setFromEulerAngles(0, angle, 0));
        },
        
        targeting: function(angle) {
            this.targetPoint.setFromEulerAngles(0, angle, 0);
        },
        
        moveTo: function(pos) {
            this.movePoint.set(pos[0], 0, pos[1]);
            if (this.dead)
                this.entity.setPosition(this.movePoint);
        },
        
        hidden: function(state) {
            state = state || ! this.entity.script || this.entity.script.cullingItem.culled;
            
            if (this._hidden === state)
                return;
                
            this._hidden = state;
            
            for(var i = 0; i < this.blinkParts.length; i++) {
                this.blinkParts[i].enabled = ! this._hidden;
            }
            
            if (this._hidden) {
                this.name.classList.remove('active');
            } else {
                this.name.classList.add('active');
            }
        }
    };

    return Tank;
});