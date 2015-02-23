pc.script.create('fires', function (context) {
    var Fires = function (entity) {
        this.entity = entity;
    };

    Fires.prototype = {
        initialize: function () {
            this.entities = context.root.findByName('fires');
            this.blank = context.root.findByName('fire');
            this.blank.enabled = false;
        },
        
        new: function(args) {
            var item = this.blank.clone();
            item.enabled = true;
            item.setPosition(args.x, 0.2 + Math.random() * 0.05, args.z);
            item.script.fireParticle.life = args.life;
            item.script.fireParticle.targetSize = args.size;
            this.entities.addChild(item);
        }
    };

    return Fires;
});