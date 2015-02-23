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
            
            var children = this.templates.getChildren();
            for(var i = 0; i < children.length; i++) {
                var name = children[i].name.slice(9);
                this.pick[name] = children[i];
            }
        },
        
        new: function(data) {
            var tpl = this.pick[data.t] || this.pick['default'];
            
            if (! tpl)
                return;
            
            var item = tpl.clone();
            item.name = 'pickable_' + data.id;
            item.type = data.t;
            item.enabled = true;
            item.setPosition(data.x, 0, data.y);
            
            this.pickables.addChild(item);
        },
        
        delete: function(data) {
            var item = this.pickables.findByName('pickable_' + data.id);
            if (! item)
                return;
                
            item.destroy();
        },

        update: function (dt) {
        }
    };

    return Pickables;
});