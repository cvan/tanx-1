pc.script.create('pickable', function (context) {
    var Pickable = function (entity) {
        this.entity = entity;
    };

    Pickable.prototype = {
        initialize: function () {
            this.model = this.entity.findByName('model');
            this.glow = this.entity.findByName('glow');
            this.aura = this.entity.findByName('aura');
            
            this.finished = false;
            // this._culled = false;
            // this._hidden = false;
            // this.sphere = new pc.shape.Sphere(this.entity.position, 1);
            
            var self = this;
            this.entity.on('culled', function(state) {
                self.hidden(state);
            });
        },

        update: function (dt) {
            if (this.finished || this._hidden)
                return;
                
            var t = Math.sin(Date.now() / 400);
            
            this.model.rotate(0, 180 * dt, 0);
            this.model.setLocalPosition(0, .7 + t * .2, 0);
            
            var scale = 1.5 + t * .5;
            this.glow.setLocalScale(scale, 1, scale);
        },
        
        hidden: function(state) {
            if (this._hidden === state)
                return;
                
            this._hidden = state;
            
            this.model.enabled = ! this._hidden;
            this.glow.enabled = ! this._hidden;
            this.aura.enabled = ! this._hidden;
        },
        
        finish: function() {
            if (this.finished)
                return;
                
            this.finished = true;
            this.hidden(true);
            this.entity.audiosource.play(this.entity.audiosource.data.currentSource);
            
            var self = this;
            setTimeout(function() {
                self.entity.audiosource.stop();
                self.entity.fire('finish');
                self.hidden(false);
                self.entity.enabled = false;
                self.finished = false;
            }, 1500);
        }
    };

    return Pickable;
});