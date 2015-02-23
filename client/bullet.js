var tmpVec = new pc.Vec3();

pc.script.create('bullet', function (context) {
    var Bullet = function (entity) {
        this.entity = entity;
    };

    Bullet.prototype = {
        initialize: function () {
            this.fires = context.root.getChildren()[0].script.fires;
            this.entity.audiosource.pitch = Math.random() * 0.2 + 0.7;
        },

        update: function (dt) {
            var pos = this.entity.getPosition();
            tmpVec.copy(this.entity.targetPosition).sub(pos).normalize().scale(this.entity.speed * dt);
            this.entity.setPosition(tmpVec.add(pos));
            
            pos = this.entity.getPosition();
            
            if (tmpVec.copy(this.entity.targetPosition).sub(pos).length() < this.entity.speed * dt * 1.5 ||
                pos.x < 0 ||
                pos.z < 0 ||
                pos.x > 48 ||
                pos.z > 48) {
                    
                var i = Math.floor(Math.random() * 2 + 1);
                while(i--) {
                    context.root.getChildren()[0].script.fires.new({
                        x: pos.x + (Math.random() - 0.5) * 2,
                        z: pos.z + (Math.random() - 0.5) * 2,
                        size: Math.random() * 1 + 1,
                        life: Math.floor(Math.random() * 50 + 200)
                    });
                }
                
                this.entity.destroy();
            }
        }
    };

    return Bullet;
});