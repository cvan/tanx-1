pc.script.create('hp', function (context) {
    var Hp = function (entity) {
        var css = [
            "#hpBar {",
            "   position: absolute;",
            "   top: 16px;",
            "   left: 35%;",
            "   width: 30%;",
            "   height: 6px;",
            "   background-color: rgba(164, 164, 164, .7);",
            "}",
            "#hpBar > .bar {",
            "   width: 100%;",
            "   height: 6px;",
            "   background-color: #2ecc71;",
            "   -webkit-transition: 200ms;",
            "   -moz-transition: 200ms;",
            "   -ms-transition: 200ms;",
            "   transition: 200ms;",
            "}",
            "#score {",
            "   position: absolute;",
            "   top: 22px;",
            "   left: calc(50% - 16px);",
            "   width: 32px;",
            "   height: 32px;",
            "   line-height: 32px;",
            "   padding: 2px 0 0 6px;",
            "   background-color: rgb(33, 34, 36);",
            "   text-align: center;",
            "   font-size: 24px;",
            "   color: #fff;",
            "}",
            "#killer {",
            "   display: none;",
            "   position: absolute;",
            "   bottom: 15%;",
            "   left: calc(50% - 160px);",
            "   width: 320px;",
            "   line-height: 42px;",
            "   z-index: 2;",
            "   text-align: center;",
            "   font-size: 36px;",
            "   color: #2ecc71;",
            "}",
            ".cinematic-top,",
            ".cinematic-bottom {",
            "   position: absolute;",
            "   left: 0;",
            "   right: 0;",
            "   width: auto;",
            "   height: 0%;",
            "   visibility: hidden;",
            "   background-color: #000;",
            "   z-index: 2;",
            "   transition: visibility 200ms, height 200ms;",
            "}",
            ".cinematic-top.active,",
            ".cinematic-bottom.active {",
            "   height: 15%;",
            "   visibility: visible;",
            "}",
            ".cinematic-top {",
            "   top: 0;",
            "}",
            ".cinematic-bottom {",
            "   bottom: 0;",
            "}"
        ].join('\n');
        
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
        
        
        var div = document.createElement('div');
        div.id = 'hpBar';
        document.body.appendChild(div);
        
        var hp = this.hp = document.createElement('div');
        hp.classList.add('bar');
        div.appendChild(hp);
        
        var score = this.score = document.createElement('div');
        score.id = 'score';
        score.textContent = '0';
        document.body.appendChild(score);
        
        // cinematic top
        var cinematicTop = this.elCinematicTop = document.createElement('div');
        cinematicTop.classList.add('cinematic-top');
        document.body.appendChild(cinematicTop);

        // cinematic bottom
        var cinematicBottom = this.elCinematicBottom = document.createElement('div');
        cinematicBottom.classList.add('cinematic-bottom');
        document.body.appendChild(cinematicBottom);

        var killer = this.killer = document.createElement('div');
        killer.id = 'killer';
        killer.textContent = 'Killed by hello_world';
        document.body.appendChild(killer);

        this.points = 0;
    };

    Hp.prototype = {
        set: function(hp) {
            if (this.points !== hp) {
                this.points = hp;
                this.hp.style.width = Math.floor((hp / 10) * 100) + '%';
            }
        },
        
        killedBy: function(name) {
            if (name) {
                this.killer.style.display = 'block';
                this.killer.textContent = 'Killed by ' + name;
            } else {
                this.killer.style.display = 'none';
            }
        },
        
        setScore: function(score) {
            this.score.textContent = score;
        },
        
        setCinematic: function(state) {
            if (state) {
                this.elCinematicTop.classList.add('active');
                this.elCinematicBottom.classList.add('active');
            } else {
                this.elCinematicTop.classList.remove('active');
                this.elCinematicBottom.classList.remove('active');
            }
        }
    };

    return Hp;
});