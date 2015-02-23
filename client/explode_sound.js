pc.script.create('explode_sound', function (context) {
    var Explode_sound = function (entity) {
        this.entity = entity;
    };

    Explode_sound.prototype = {
        initialize: function () {
            this.entity.audiosource.pitch = Math.random() * 0.6 + 0.7;
            setTimeout(function() {
                this.entity.destroy();
            }.bind(this), 1000);
        }
    };

    return Explode_sound;
});