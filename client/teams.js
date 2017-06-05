pc.script.create('teams', function (context) {
    var Teams = function (entity) {
        var css = function() {/*
            .teams {
                position: absolute;
                left: calc(50% - 152px);
                bottom: 16px;
                width: 304px;
                height: 42px;
                z-index: 4;
            }
            .teams > .team {
                float: left;
                width: 64px;
                height: 42px;
                margin-right: 16px;
            }
            .teams > .team:last-child {
                margin-right: 0;
            }
            .teams > .team > .top {
                width: 64px;
                height: 32px;
                background-color: rgba(33, 34, 36, .75);
            }
            .teams > .team > .top > .icon {
                float: left;
                width: 20px;
                height: 20px;
                margin: 6px;
            }
            .teams > .team > .top > .score {
                float: left;
                width: 28px;
                height: 32px;
                line-height: 31px;
                text-align: center;
                font-weight: 100;
                color: #eee;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                font-smoothing: antialiased;
            }
            .teams > .team > .tank {
                float: left;
                width: 19px;
                height: 4px;
                margin: 4px 4px 0 0;
                background-color: rgba(33, 34, 36, .75);
            }
            .teams > .team-1 > .tank.active {
                background-color: rgb(68, 169, 241);
            }
            .teams > .team-2 > .tank.active {
                background-color: rgb(251, 34, 47);
            }
            .teams > .team-3 > .tank.active {
                background-color: rgb(123, 198, 75);
            }
            .teams > .team-4 > .tank.active {
                background-color: rgb(251, 145, 48);
            }
            .teams > .team > .tank:last-child {
                width: 18px;
                margin-right: 0;
            }
            #logo {
                position: absolute;
                top: 16px;
                left: calc(50% - 48px);
                width: 96px;
                opacity: 0.5;
            }
            @media all and (max-width: 640px) {
                .teams {
                    top: 8px;
                    left: calc(50% - 108px);
                    width: 216px;
                    height: 32px;
                }
                .teams > .team {
                    width: 48px;
                    margin-right: 8px;
                }
                .teams > .team > .top {
                    width: 48px;
                    height: 24px;
                }
                .teams > .team > .top > .icon {
                    width: 16px;
                    height: 16px;
                    margin: 4px;
                }
                .teams > .team > .top > .score {
                    width: 20px;
                    height: 24px;
                    line-height: 23px;
                    font-size: 14px;
                }
                .teams > .team > .tank {
                    width: 13px;
                }
                .teams > .team > .tank:last-child {
                    width: 14px;
                }
                #logo {
                    top: auto;
                    bottom: 8px;
                }
            }
            @media all and (max-width: 479px) {
                .teams {
                    left: 8px;
                }
            }
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);

        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
    };

    Teams.prototype = {
        initialize: function () {
            this.overlay = context.root.getChildren()[0].script.overlay;
            this.minimap = context.root.getChildren()[0].script.minimap;
            
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
                'yellow'
            ];
            this.scores = [ 0, 0, 0, 0 ];
            
            var spawns = context.root.findByName('spawns').getChildren();
            for(var i = 0; i < spawns.length; i++) {
                var color = this.colors[this.names.indexOf(spawns[i].name)];
                spawns[i].getChildren()[0].model.material.emissive.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
                spawns[i].getChildren()[0].model.material.update();
            }
            
            var teamsContainer = this.elTeamsContainer = document.createElement('div');
            teamsContainer.classList.add('teams');
            document.body.appendChild(teamsContainer);
            
            this.teams = [ ];
            
            for(var i = 0; i < 4; i++) {
                var team = this.teams[i] = document.createElement('div');
                team.tanks = [ ];
                team.classList.add('team', 'team-' + (i + 1));
                teamsContainer.appendChild(team);
                
                var top = document.createElement('div');
                top.classList.add('top');
                team.appendChild(top);
                
                var icon = document.createElement('div');
                icon.classList.add('icon');
                icon.style.backgroundColor = 'rgb(' + this.colors[i].join(',') + ')';
                top.appendChild(icon);
                
                var score = team.score = document.createElement('div');
                score.classList.add('score');
                score.textContent = '0';
                top.appendChild(score);
                
                for(var t = 0; t < 3; t++) {
                    var tank = team.tanks[t] = document.createElement('div');
                    tank.classList.add('tank');
                    team.appendChild(tank);
                }
            }
        },
        
        tankAdd: function(tank, team) {
            var color = this.colors[team];
            for(var t = 0; t < 3; t++) {
                if (! this.teams[team].tanks[t].classList.contains('active')) {
                    this.teams[team].tanks[t].classList.add('active');
                    break;
                }
            }
            tank.team = team;
            tank.matBase.emissive.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
            tank.matBase.update();
            tank.matTracks.emissive.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
            tank.matTracks.update();
            tank.matGlow.diffuse.set(color[0] / 255, color[1] / 255, color[2] / 255, 1);
            tank.matGlow.update();
            
            var self = this;
            tank.entity.on('destroy', function() {
                var t = 3;
                while(t--) {
                    if (self.teams[team].tanks[t].classList.contains('active')) {
                        self.teams[team].tanks[t].classList.remove('active');
                        return;
                    }
                }
            });
        },

        teamScore: function(team, score) {
            this.scores[team] = score;
            this.teams[team].score.textContent = score;
        },
        
        teamWin: function(data) {
            this.overlay.overlay(true);
            this.overlay.cinematic(true);
            this.minimap.state(false);
            // winner message
            this.overlay.winner(this.names[data.team]);
            this.overlay.timer(5);
            
            var self = this;
            setTimeout(function() {
                self.overlay.overlay(false);
                self.overlay.winner(false);
                self.overlay.cinematic(false);
                self.minimap.state(true);
            }, 5000);
        }
    };

    return Teams;
});