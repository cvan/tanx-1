pc.script.create('culling', function (app) {
    // Creates a new Culling instance
    var Culling = function (entity) {
        this.entity = entity;
    };

    Culling.prototype = {
        initialize: function () {
            this.frustum = null;
            this.list = [ ];
        },

        update: function (dt) {
            if (! this.frustum)
                return;
                
            var culled = false;
            var item = null;
            
            for(var i = 0; i < this.list.length; i++) {
                item = this.list[i];
                if (item.ignore)
                    continue;
                    
                culled = ! this.frustum.containsSphere(item.sphere);
                if (culled !== item.culled)
                    item.state(culled);
            }
        },
        
        setCamera: function(camera) {
            this.frustum = camera && camera.frustum || null;
        },
        
        add: function(item) {
            this.list.push(item);
        },
        
        remove: function(item) {
            var ind = this.list.indexOf(item);
            if (ind === -1)
                return;
                
            this.list.splice(ind, 1);
        }
    };

    return Culling;
});