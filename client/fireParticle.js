pc.script.create('fireParticle', function (context) {
    // Creates a new FireParticle instance
    var FireParticle = function (entity) {
        this.entity = entity;
    };

    FireParticle.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.born = Date.now();
            this.life = this.life || this.entity.life;
            this.size = this.size || 0.01;
            this.targetSize = this.targetSize || this.entity.targetSize;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            var time = Date.now() - this.born;
            if (time > this.life) {
                this.entity.destroy();
            } else {
                this.size += (this.targetSize - this.size) * (0.1 * (this.life / 200));
                this.entity.setLocalScale(this.size, 0.1, this.size);
            }
        }
    };

    return FireParticle;
});