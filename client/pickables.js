pc.script.create('pickables', function (context) {
    var Pickables = function (entity) {
        this.entity = entity;
    };

    Pickables.prototype = {
        initialize: function () {
            this.templates = context.root.findByName('pickables-templates');
            this.templates.enabled = false;
            
            this.pickables = context.root.findByName('pickables');
            
            this.pick = { };
            this.pool = { };
            this.length = { };
            this.index = { };
            
            var children = this.templates.getChildren();
            for(var i = 0; i < children.length; i++) {
                var name = children[i].name.slice(9);
                this.pool[name] = [ ];
                this.length[name] = 0;
                this.pick[name] = children[i];
            }
        },
        
        new: function(data) {
            var self = this;
            var type = data.t || 'default';
            
            if (this.pool[type].length === 0) {
                var before = this.length[type];
                // extend pool
                this.length[type] += 4;
                
                for(var i = 0; i < this.length[type] - before; i++) {
                    var item = this.pick[type].clone();
                    item.type = type;
                    
                    // destroy when item has finished its life
                    item.on('finish', function() {
                        self.delete({ id: this.id });
                    });

                    // add to pool
                    this.pool[type].push(item);
                }
            }
            
            // get item from pool
            var item = this.pool[type].pop();
            this.index[data.id] = item;
            item.id = data.id;
            item.enabled = true;
            item.setPosition(data.x, 0, data.y);
            
            this.pickables.addChild(item);
        },
        
        finish: function(data) {
            var item = this.index[data.id];
            if (! item)
                return;
                
            item.script.pickable.finish();
        },
        
        delete: function(data) {
            var item = this.index[data.id];
            if (! item)
                return;
            
            item.enabled = false;
            this.pickables.removeChild(item);

            var ind = this.pool[item.type].indexOf(item);
            this.pool[item.type].splice(ind, 1);
            
            delete this.index[data.id];
            
            this.pool[item.type].push(item);
        }
    };

    return Pickables;
});