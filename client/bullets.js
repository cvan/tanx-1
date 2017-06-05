pc.script.create('bullets', function (context) {
    var vecTmp = new pc.Vec3();
    var matSpecial = null;
    var matDefault = null;
    
    var Bullets = function (entity) {
        this.entity = entity;
    };

    Bullets.prototype = {
        initialize: function () {
            this.tanks = context.root.findByName('tanks');
            this.bullet = context.root.findByName('bullet');
            this.bullet.enabled = false;
            
            this.bullets = context.root.findByName('bullets');

            if (! matSpecial) {
                var bulletSpecial = context.root.findByName('bullet-special');
                matDefault = this.bullet.model.material;
                matSpecial = bulletSpecial.model.material;
                bulletSpecial.destroy();
            }
            
            this.active = [ ];
            this.pool = [ ];
            this.index = { };
            this.length = 0;
        },

        new: function(data) {
            var self = this;
            
            if (this.pool.length === 0) {
                var before = this.length;
                // extend pool
                this.length += 8;
                
                for(var i = 0; i < this.length - before; i++) {
                    var bullet = this.bullet.clone();
                    
                    // destroy when bullet has finished its life
                    bullet.on('finish', function() {
                        self.delete({ id: this.id });
                    });
                    
                    this.bullets.addChild(bullet);
                    
                    // add to pool
                    this.pool.push(bullet);
                }
            }
            
            var tank = this.tanks.findByName('tank_' + data.tank);
            if (! tank) return;
            
            // get bullet from pool
            var bullet = this.pool.pop();
            this.active.push(bullet);
            bullet.script.bullet.finished = false;
            
            // attach ID
            bullet.id = data.id;
            
            // index
            this.index[data.id] = bullet;
            
            // clear minimap data
            bullet.lastX = undefined;
            bullet.lastZ = undefined;

            // offset
            vecTmp.set(0, 0, 1);
            tank.script.tank.head.getRotation().transformVector(vecTmp, vecTmp);
            vecTmp.normalize().scale(0.5);
            
            bullet.setPosition(tank.getPosition().x + vecTmp.x, 0.9, tank.getPosition().z + vecTmp.z);
            bullet.targetPosition = new pc.Vec3(data.tx, 0.9, data.ty);
            bullet.speed = data.sp * 50 * 0.5;
            
            // material and scale if special
            if (data.s) {
                bullet.model.material = matSpecial;
                bullet.setLocalScale(.3, .2, .3);
            } else {
                bullet.model.material = matDefault;
                bullet.setLocalScale(.2, .2, .2);
            }
            
            bullet.enabled = true;
            bullet.audiosource.pitch = Math.random() * .2 + .9;
            bullet.audiosource.play('shoot');
        },
        
        finish: function(data) {
            var bullet = this.index[data.id];
            if (! bullet) return;
            bullet.script.bullet.finish();
        },
        
        delete: function(args) {
            var bullet = this.index[args.id];
            if (! bullet) return;
            
            // fire particles
            var i = Math.floor(Math.random() * 2 + 1);
            while(i--) {
                context.root.getChildren()[0].script.fires.new({
                    x: args.x + (Math.random() - 0.5) * 2,
                    z: args.y + (Math.random() - 0.5) * 2,
                    size: Math.random() * 1 + 1,
                    life: Math.floor(Math.random() * 50 + 200)
                });
            }
            
            // remove from index
            delete this.index[args.id];

            // disable
            bullet.audiosource.stop();
            bullet.enabled = false;
            
            // push to pool back
            this.pool.push(bullet);
            
            var ind = this.active.indexOf(bullet);
            if (ind !== -1)
                this.active.splice(ind, 1);
        }
    };

    return Bullets;
});