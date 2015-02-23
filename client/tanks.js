pc.script.create('tanks', function (context) {
    var Tanks = function (entity) {
        this.entity = entity;
        this.ind = 0;
    };

    Tanks.prototype = {
        initialize: function () {
            this.tank = context.root.findByName('tank');
            this.tank.enabled = false;
            // this.tank.findByName('light').enabled = false;
            
            this.tanks = context.root.findByName('tanks');
            this.client = context.root.getChildren()[0].script.client;
            this.camera = context.root.findByName('camera');
            this.minimap = context.root.getChildren()[0].script.minimap;
            this.teams = context.root.getChildren()[0].script.teams;
            this.hpBar = context.root.getChildren()[0].script.hp;
            
            this.explodeSound = context.root.findByName('explode_sound');
        },
        
        new: function(args) {
            var newTank = this.tank.clone();
            newTank.setName('tank_' + args.id);
            newTank.nickname = args.nickname;
            newTank.owner = args.owner;
            newTank.enabled = true;
            newTank.setPosition(args.pos[0], 0, args.pos[1]);
            newTank.rotate(0, Math.random() * 360, 0);
            
            this.teams.tankAdd(newTank.script.tank, args.team);
            
            if (args.owner == this.client.id)
                this.camera.script.link.link = newTank;
            
            this.tanks.addChild(newTank);
        },
        
        delete: function(args) {
            var tank = this.tanks.findByName('tank_' + args.id);
            if (! tank) return;
            
            tank.destroy();
        },
        
        update: function(data) {
            var tank = this.tanks.findByName('tank_' + data.id);
            if (! tank) return;

            tank.nickname = data.nickname;
        },
        
        updateData: function(data) {
            for(var i = 0; i < data.length; i++) {
                var tankData = data[i];
                
                var tank = this.tanks.findByName('tank_' + tankData.id);
                
                if (! tank) continue;
                tank = tank.script.tank;
                
                tank.nickname = tankData.nickname;
                
                // movement
                if (tankData.hasOwnProperty('x'))
                    tank.moveTo([ tankData.x, tankData.y ]);
                
                // targeting
                if (! tank.own && tankData.hasOwnProperty('a'))
                    tank.targeting(tankData.a);

                // hp
                if (tankData.hasOwnProperty('hp'))
                    tank.setHP(tankData.hp);
                
                // shield
                tank.sp = tankData.sp || 0;
                
                // dead/alive
                tank.dead = tankData.dead || false;

                // killer
                if (tank.own && tankData.hasOwnProperty('killer')) {
                    // find killer
                    tank.killer = this.tanks.findByName('tank_' + tankData.killer);
                }
                
                // score
                if (tank.own && tankData.hasOwnProperty('s'))
                    this.hpBar.setScore(tankData.s);
            }
            
            this.minimap.draw();
        }
    };

    return Tanks;
});