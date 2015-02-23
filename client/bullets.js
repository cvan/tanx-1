pc.script.create('bullets', function (context) {
    var vecTmp = new pc.Vec3();
    var specialMaterial = null;
    
    var Bullets = function (entity) {
        this.entity = entity;
    };

    Bullets.prototype = {
        initialize: function () {
            this.tanks = context.root.findByName('tanks');
            this.bullet = context.root.findByName('bullet');
            this.bullet.enabled = false;
            
            this.bullets = context.root.findByName('bullets');
            
            if (! specialMaterial) {
                var bulletSpecial = context.root.findByName('bullet-special');
                specialMaterial = bulletSpecial.model.material;
                bulletSpecial.destroy();
            }
        },

        new: function(data) {
            var tank = this.tanks.findByName('tank_' + data.tank);
            if (! tank) return;
            
            var bullet = this.bullet.clone();
            bullet.setName('bullet_' + data.id);
            bullet.enabled = true;
            // offset
            vecTmp.set(0, 0, 1);
            tank.script.tank.head.getRotation().transformVector(vecTmp, vecTmp);
            vecTmp.normalize().scale(0.5);
            
            bullet.setPosition(tank.getPosition().x + vecTmp.x, 0.9, tank.getPosition().z + vecTmp.z);
            bullet.targetPosition = new pc.Vec3(data.tx, 0.9, data.ty);
            bullet.speed = data.sp * 50 * 0.5;
            
            // special
            if (data.s) {
                bullet.model.material = specialMaterial;
                bullet.setLocalScale(.3, .2, .3);
            }
            
            this.bullets.addChild(bullet);
        },
        
        delete: function(args) {
            var bullet = this.bullets.findByName('bullet_' + args.id);
            if (! bullet) return;
            
            var i = Math.floor(Math.random() * 2 + 1);
            while(i--) {
                context.root.getChildren()[0].script.fires.new({
                    x: args.x + (Math.random() - 0.5) * 2,
                    z: args.y + (Math.random() - 0.5) * 2,
                    size: Math.random() * 1 + 1,
                    life: Math.floor(Math.random() * 50 + 200)
                });
            }

            bullet.destroy();
        }
    };

    return Bullets;
});