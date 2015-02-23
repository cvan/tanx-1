pc.script.create('minimap', function (context) {
    var Minimap = function (entity) {
        this.entity = entity;
        
        this.sizeInc = 48;
        this.size = 4;
        
        this.canvas = this.prepareCanvas();
        this.canvas.width = this.sizeInc * this.size;
        this.canvas.height = this.sizeInc * this.size;
        document.body.appendChild(this.canvas);
        document.body.style.overflow = 'hidden';
        
        this.ctx = this.canvas.getContext('2d');
        
        this.circles = [ ];
        this.lastCircle = Date.now();
        this.circleLife = 1000;
    };

    Minimap.prototype = {
        prepareCanvas: function() {
            var canvas = document.createElement('canvas');
            canvas.className = 'minimap';
            canvas.style.display = 'block';
            canvas.style.position = 'absolute';
            canvas.style.top = (10 * this.size + 16) + 'px';
            canvas.style.right = (10 * this.size + 16) + 'px';
            canvas.style.zIndex = 1;
            canvas.style.backgroundColor = '#212224';
            canvas.style.border = '4px solid #5e7578';
            canvas.style.cursor = 'default';
            canvas.style.webkitTransform = 'rotate(45deg)';
            canvas.style.mozTransform = 'rotate(45deg)';
            canvas.style.msTransform = 'rotate(45deg)';
            canvas.style.transform = 'rotate(45deg)';
            
            return canvas;
        },
        
        initialize: function () {
            this.bullets = context.root.findByName('bullets');
            this.tanks = context.root.findByName('tanks');
            this.pickables = context.root.findByName('pickables');
            this.client = context.root.getChildren()[0].script.client;
            this.teams = context.root.getChildren()[0].script.teams;
            
            this.level = [
                [ 13.5, 2, 1, 4 ],
                [ 13.5, 12, 1, 2 ],
                [ 12.5, 13.5, 3, 1 ],
                [ 2, 13.5, 4, 1 ],
                [ 11.5, 15, 1, 2 ],
                [ 11.5, 23.5, 1, 5 ],
        
                [ 10, 26.5, 4, 1 ],
                [ 6, 26.5, 4, 1 ],
        
                [ 2, 34.5, 4, 1 ],
                [ 12.5, 34.5, 3, 1 ],
                [ 13.5, 36, 1, 2 ],
                [ 15, 36.5, 2, 1 ],
                [ 13.5, 46, 1, 4 ],
        
                [ 23.5, 36.5, 5, 1 ],
                [ 26.5, 38, 1, 4 ],
                [ 26.5, 42, 1, 4 ],
        
                [ 34.5, 46, 1, 4 ],
                [ 34.5, 36, 1, 2 ],
                [ 35.5, 34.5, 3, 1 ],
                [ 36.5, 33, 1, 2 ],
                [ 46, 34.5, 4, 1 ],
        
                [ 36.5, 24.5, 1, 5 ],
                [ 38, 21.5, 4, 1 ],
                [ 42, 21.5, 4, 1 ],
        
                [ 46, 13.5, 4, 1 ],
                [ 35.5, 13.5, 3, 1 ],
                [ 34.5, 12, 1, 2 ],
                [ 33, 11.5, 2, 1 ],
                [ 34.5, 2, 1, 4 ],
        
                [ 24.5, 11.5, 5, 1 ],
                [ 21.5, 10, 1, 4 ],
                [ 21.5, 6, 1, 4 ],
        
                // center
                [ 18.5, 22, 1, 6 ],
                [ 19, 18.5, 2, 1 ],
                [ 26, 18.5, 6, 1 ],
                [ 29.5, 19, 1, 2 ],
                [ 29.5, 26, 1, 6 ],
                [ 29, 29.5, 2, 1 ],
                [ 22, 29.5, 6, 1 ],
                [ 18.5, 29, 1, 2 ]
            ];
            
            this.pickableColors = {
                'repair': '#6f6',
                'damage': '#f60',
                'shield': '#06f'
            };
            
            this.resize(true);
        },
        
        resize: function(force) {
            var size = Math.max(2, Math.min(4, Math.floor(window.innerWidth / 240)));
            if (size !== this.size || force) {
                this.size = size;
                this.canvas.width = this.sizeInc * this.size;
                this.canvas.height = this.sizeInc * this.size;
                
                this.canvas.style.top = (10 * this.size + 16) + 'px';
                this.canvas.style.right = (10 * this.size + 16) + 'px';
                
                var info = document.getElementById('infoButton');
                if (info) {
                    info.script.setSize(34 * this.size - 22);
                }
                var leaderboard = document.getElementById('leaderboardButton');
                if (leaderboard) {
                    leaderboard.script.setSize(34 * this.size - 22);
                }
                var fs = document.getElementById('fullscreenButton');
                if (fs) {
                    fs.script.setSize(34 * this.size - 22);
                }
                
                this.ctx.font = Math.floor(12 + (10 * (this.size / 3))) + 'px Arial';
            }
        },
        
        draw: function() {
            this.resize();

            var ctx = this.ctx;
            var clr, i, pos, size;

            ctx.setTransform(1, 0, 0, 1, 0, 0);            
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // grid
            // var gridSize = this.canvas.width / 12;
            // ctx.beginPath();
            // for(var x = 1; x < 12; x++) {
            //     ctx.moveTo(Math.floor(gridSize * x) + 0.5, 0);
            //     ctx.lineTo(Math.floor(gridSize * x) + 0.5, this.canvas.height);
            // }
            // for(var y = 1; y < 12; y++) {
            //     ctx.moveTo(0, Math.floor(gridSize * y) + 0.5);
            //     ctx.lineTo(this.canvas.width, Math.floor(gridSize * y) + 0.5);
            // }
            // ctx.strokeStyle = '#313234';
            // ctx.stroke();
            
            
            // // radar circles
            // i = this.circles.length;
            // while(i--) {
            //     if (Date.now() - this.circles[i].time > this.circleLife) {
            //         this.circles.splice(i, 1);
            //     } else {
            //         size = ((this.circleLife - (Date.now() - this.circles[i].time)) / this.circleLife);
            //         ctx.beginPath();
            //         ctx.arc(this.circles[i].x, this.circles[i].z, Math.max(1, (1.0 - size) * 8 * this.size), 0, Math.PI * 2, false);
            //         ctx.strokeStyle = 'rgba(46, 204, 113, ' + Math.min(1.0, size * 2) + ')';
            //         ctx.stroke();
            //     }
            // }

            
            // score
            for(i = 0; i < 4; i++) {
                var x = (i % 2 * 35 + 6.5) / 48 * this.canvas.width;
                var y = (Math.floor(i / 2) * 35 + 6.5) / 48 * this.canvas.height;
                ctx.save();
                ctx.beginPath();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 4);
                ctx.fillStyle = 'rgb(' + this.teams.colors[i].join(',') + ')';
                // ctx.strokeStyle = '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // ctx.lineWidth = 2;
                // ctx.strokeText(this.teams.scores[i], 0, 0);
                ctx.fillText(this.teams.scores[i], 0, 0);
                ctx.restore();
            }
            
            // bullets
            ctx.beginPath();
            var bullets = this.bullets.getChildren();
            i = bullets.length;
            while(i--) {
                pos = [ bullets[i].getPosition().x, bullets[i].getPosition().z ];
                pos[0] = pos[0] / 48 * this.canvas.width;
                pos[1] = pos[1] / 48 * this.canvas.width;

                if (bullets[i].lastX !== undefined) {
                    ctx.moveTo(bullets[i].lastX, bullets[i].lastZ);
                    ctx.lineTo(pos[0], pos[1]);
                }
                
                bullets[i].lastX = pos[0];
                bullets[i].lastZ = pos[1];
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, .8)';
            ctx.stroke();
            
            // level
            ctx.beginPath();
            var cellSize = this.canvas.width / 48;
            for(i = 0; i < this.level.length; i++) {
                ctx.rect((this.level[i][0] - this.level[i][2] / 2) * cellSize, (this.level[i][1] - this.level[i][3] / 2) * cellSize, this.level[i][2] * cellSize, this.level[i][3] * cellSize);
            }
            ctx.fillStyle = '#5e7578';
            ctx.fill();

            // pickables
            var pickables = this.pickables.getChildren();
            size = 3 * (this.size / 3);
            for(i = 0; i < pickables.length; i++) {
                pos = [ pickables[i].getPosition().x, pickables[i].getPosition().z ];
                pos[0] = pos[0] / 48 * this.canvas.width;
                pos[1] = pos[1] / 48 * this.canvas.width;
                ctx.beginPath();
                ctx.rect(pos[0] - size / 2, pos[1] - size / 2, size, size);
                ctx.fillStyle = this.pickableColors[pickables[i].type] || '#fff';
                ctx.fill();
            }
            
            // tanks
            var tanks = this.tanks.getChildren();
            size = (this.size / 3);
            i = tanks.length;
            while(i--) {
                // dont render if dead
                if (tanks[i].script.tank.dead)
                    continue;
                    
                pos = [ tanks[i].getPosition().x, tanks[i].getPosition().z ];
                pos[0] = pos[0] / 48 * this.canvas.width;
                pos[1] = pos[1] / 48 * this.canvas.width;
                
                // // circle
                // if (tanks[i].script.tank.own && Date.now() - this.lastCircle > 1300) {
                //     this.lastCircle = Date.now();
                //     this.circles.push({
                //         time: Date.now(),
                //         x: pos[0],
                //         z: pos[1]
                //     });
                // }
                
                // dont render if flashit
                if (! tanks[i].script.tank.flashState)
                    continue;
                
                // render tank
                ctx.save();
                ctx.beginPath();
                ctx.translate(pos[0], pos[1]);
                ctx.rotate(-Math.atan2(tanks[i].forward.x, tanks[i].forward.z));
                ctx.rect(-2.5 * size, -4 * size, 5 * size, 8 * size);
                if(tanks[i].script.tank.own) {
                    ctx.fillStyle = '#fff';
                } else {
                    clr = tanks[i].script.tank.matBase.emissive;
                    ctx.fillStyle = '#' + ('00' + Math.floor(clr.r * 255).toString(16)).slice(-2) + ('00' + Math.floor(clr.g * 255).toString(16)).slice(-2) + ('00' + Math.floor(clr.b * 255).toString(16)).slice(-2);
                }
                ctx.fill();
                ctx.restore();
            }
        }
    };

    return Minimap;
});