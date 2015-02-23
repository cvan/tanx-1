pc.script.create('pickable', function (context) {
    var Pickable = function (entity) {
        this.entity = entity;
    };

    Pickable.prototype = {
        initialize: function () {
            this.model = this.entity.findByName('model');
            this.glow = this.entity.findByName('glow');
        },

        update: function (dt) {
            var t = Math.sin(Date.now() / 400);
            
            this.model.rotate(0, 180 * dt, 0);
            this.model.setLocalPosition(0, .7 + t * .2, 0);
            
            var scale = 1.5 + t * .5;
            this.glow.setLocalScale(scale, 1, scale);
        }
    };

    return Pickable;
});