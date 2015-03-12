pc.script.create('fireParticle', function (context) {
    var FireParticle = function (entity) {
        this.entity = entity;
    };

    FireParticle.prototype = {
        initialize: function () {
            this.born = 0;
            this.life = 0;
            this.size = 0.01;
            this.targetSize = 0.1;
        },

        update: function (dt) {
            var time = Date.now() - this.born;
            if (time > this.life) {
                this.entity.fire('finish');
                this.entity.enabled = false;
            } else {
                this.size += (this.targetSize - this.size) * (0.1 * (this.life / 200));
                this.entity.setLocalScale(this.size, 0.1, this.size);
            }
        }
    };

    return FireParticle;
});