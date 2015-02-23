pc.script.create('teams', function (context) {
    var Teams = function (entity) {
        this.entity = entity;
        
        var css = [
            ".winner {",
            "   display: none;",
            "   position: absolute;",
            "   top: 0;",
            "   left: 0;",
            "   right: 0;",
            "   bottom: 0;",
            "   width: auto;",
            "   height: auto;",
            "   background-color: rgba(0, 0, 0, .7);",
            "   z-index: 1;",
            "   cursor: default;",
            "}",
            ".winner:focus {",
            "   outline: none;",
            "}",
            ".winner > .inner {",
            "   position: absolute;",
            "   top: calc(50% - 64px);",
            "   left: 0;",
            "   right: 0;",
            "   width: auto;",
            "   height: 128px;",
            "   text-align: center;",
            "   font-size: 32px;",
            "   color: #fff;",
            "}",
            ".winner > .inner > .team {",
            "   line-height: 72px;",
            "   font-size: 72px;",
            "   font-weight: bold;",
            "}",
            ".winner > .inner > .text {",
            "   padding-right: 8px;",
            "   color: #999;",
            "   font-size: 24px;",
            "}"
        ].join('\n');
        
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
    };

    Teams.prototype = {
        initialize: function () {
            this.uiHP = context.root.getChildren()[0].script.hp;
            
            this.element = document.createElement('div');
            this.element.tabIndex = 0;
            this.element.classList.add('winner');
            document.body.appendChild(this.element);
            
            // prevent events propagation
            var self = this;
            var events = [ 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend' ];
            var stopPropagation = function(evt) {
                if (self.element.style.display !== 'block')
                    return;
                evt.stopPropagation();
            };
            for(var i = 0; i < events.length; i++) {
                this.element.addEventListener(events[i], stopPropagation, false);
            }

            this.elInner = document.createElement('div');
            this.elInner.classList.add('inner');
            this.element.appendChild(this.elInner);
            
            this.elTeam = document.createElement('div');
            this.elTeam.classList.add('team');
            this.elTeam.textContent = '';
            this.elInner.appendChild(this.elTeam);
            
            var wins = document.createElement('div');
            wins.classList.add('text');
            wins.textContent = 'wins';
            this.elInner.appendChild(wins);
            
            this.colors = [
                [ 68, 169, 241 ], // blue
                [ 251, 34, 47 ], // red
                [ 123, 198, 75 ], // green
                [ 251, 145, 48 ] // yellow
            ];
            this.names = [
                'blue',
                'red',
                'green',
                'yello'
            ];
            this.scores = [ 0, 0, 0, 0 ];
            
            var spawns = context.root.findByName('spawns').getChildren();
            for(var i = 0; i < spawns.length; i++) {
                var color = this.colors[this.names.indexOf(spawns[i].name)];
                spawns[i].getChildren()[0].model.material.emissive.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
                spawns[i].getChildren()[0].model.material.update();
            }
        },
        
        tankAdd: function(tank, team) {
            var color = this.colors[team];
            tank.matBase.emissive.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
            tank.matBase.update();
            tank.matTracks.emissive.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
            tank.matTracks.update();
            tank.matGlow.diffuse.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
            tank.matGlow.update();
        },
        
        teamScore: function(team, score) {
            this.scores[team] = score;
        },
        
        teamWin: function(data) {
            this.elTeam.textContent = this.names[data.team];
            this.elTeam.style.color = 'rgb(' + this.colors[data.team].join(',') + ')';
            this.element.style.display = 'block';
            this.uiHP.setCinematic(true);
            
            var self = this;
            setTimeout(function() {
                self.element.style.display = 'none';
                self.uiHP.setCinematic(false);
            }, 3000);
        }
    };

    return Teams;
});