pc.script.attribute('radius', 'number', 1);
pc.script.attribute('single', 'boolean', false);

pc.script.create('cullingItem', function (app) {
    var culling = null;
    
    var CullingItem = function (entity) {
        this.entity = entity;
    };

    CullingItem.prototype = {
        initialize: function () {
            this._ignore = false;
            this.culled = false;
            
            this.entity.getPosition();
            this.sphere = new pc.shape.Sphere(this.entity.position, this.radius);
            
            if (! culling)
                culling = app.root.getChildren()[0].script.culling;
            
            culling.add(this);
            
            var self = this;
            this.entity.on('destroy', function() {
                culling.remove(self);
            });
        },
        
        state: function(state) {
            if (this.culled === state)
                return;
                
            this.culled = state;
            this.entity.fire('culled', state);
            
            if (this.single)
                this.entity.enabled = ! state;
        }
    };
    
    Object.defineProperty(CullingItem.prototype, 'ignore', {
        get: function() {
            if (! this.single && ! this.entity.enabled)
                return true;
                
            return this._ignore;
        },
        set: function(value) {
            this._ignore = value;
        }
    });

    return CullingItem;
});