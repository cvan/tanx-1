pc.script.create('fires', function (app) {
    var Fires = function (entity) {
        this.entity = entity;
    };

    Fires.prototype = {
        initialize: function () {
            this.entities = app.root.findByName('fires');
            this.blank = app.root.findByName('fire');
            this.blank.enabled = false;
            
            this.pool = [ ];
            this.length = 0;
        },
        
        new: function(args) {
            var self = this;
            if (this.pool.length === 0) {
                var before = this.length;
                // extend pool
                this.length += 8;
                
                for(var i = 0; i < this.length - before; i++) {
                    var fire = this.blank.clone();
                    
                    // destroy when fire has finished its life
                    fire.on('finish', function() {
                        self.pool.push(this);
                    });
                    
                    this.entities.addChild(fire);
                    
                    // add to pool
                    this.pool.push(fire);
                }
            }
            
            var item = this.pool.pop();
            item.setPosition(args.x, 0.2 + Math.random() * 0.05, args.z);
            item.script.fireParticle.born = Date.now();
            item.script.fireParticle.life = args.life;
            item.script.fireParticle.size = 0.01;
            item.script.fireParticle.targetSize = args.size;
            item.enabled = true;
        }
    };

    return Fires;
});