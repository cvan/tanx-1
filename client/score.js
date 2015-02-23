pc.script.create('score', function (context) {
    var Score = function (entity) {
        this.entity = entity;
        this.points = 0;
        
        this.sizeInc = 48;
        this.size = 4;
        
        this.element = document.createElement('div');
        this.element.id = 'points';
        
        this.element.style.display = 'none';
        this.element.style.position = 'absolute';
        this.element.style.top = (10 * this.size + 16) + 'px';
        this.element.style.right = (10 * this.size + 16) + 'px';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, .7)';
        this.element.style.border = '4px solid #212224';
        this.element.style.fontSize = '0';
        this.element.style.lineHeight = '0';
        this.element.style.webkitTransform = 'rotate(45deg)';
        this.element.style.mozTransform = 'rotate(45deg)';
        this.element.style.msTransform = 'rotate(45deg)';
        this.element.style.transform = 'rotate(45deg)';
        
        document.body.appendChild(this.element);

        var inner = document.createElement('div');
        inner.style.position = 'absolute';
        inner.style.width = 'auto';
        inner.style.height = 'auto';
        inner.style.top = '12px';
        inner.style.right = '12px';
        inner.style.bottom = '12px';
        inner.style.left = '12px';
        inner.style.border = '4px solid #212224';
        inner.style.textAlign = 'center';
        this.element.appendChild(inner);
        
        // text block
        var text = this.text = document.createElement('div');
        text.id = 'pointsText';
        text.style.display = 'none';
        text.style.position = 'absolute';
        text.style.width = '200px';
        text.style.height = '200px';
        text.style.textAlign = 'center';
        text.style.fontWeight = 'normal';
        document.body.appendChild(text);
        
        // title
        var title = this.title = document.createElement('span');
        title.style.display = 'block';
        title.style.marginTop = '37%';
        title.style.fontSize = '18px';
        title.style.color = 'rgba(255, 255, 255, .3)';
        title.textContent = 'score';
        text.appendChild(title);
        
        // score
        var score = this.score = document.createElement('span');
        score.style.display = 'block';
        score.style.marginTop = '3%';
        score.style.fontSize = '20px';
        score.style.color = 'rgba(255, 255, 255, .7)';
        score.textContent = '0';
        text.appendChild(score);
    };
    
    function submit_score(client, score) {
        if (client.guclient && client.gamertoken) {
            var guclient = client.guclient;
            var gamertoken = client.gamertoken;
            guclient.updateLeaderboardRank(gamertoken, '70cfd64e2a6f4434be39fb71e952f0ff', score, {
                success: function(status, response) {},
                error: function(status, response) {
                    console.log(response);
                }
            });
        }
    }

    Score.prototype = {
        initialize: function () {
            this.client = context.root.getChildren()[0].script.client;
            
            this.client.socket.on('point', function(point) {
                this.points += point;
                this.score.textContent = this.points * 8;

                submit_score(this.client, this.points);
            }.bind(this));
            
            this.resize(true);
        },
        
        resize: function(force) {
            var size = Math.max(2, Math.min(4, Math.floor(window.innerWidth / 240)));
            if (size !== this.size || force) {
                this.size = size;
                
                this.element.style.width = (this.sizeInc * this.size) + 'px';
                this.element.style.height = (this.sizeInc * this.size) + 'px';
                this.element.style.top = (10 * this.size + 16) + 'px';
                this.element.style.left = (10 * this.size + 16) + 'px';
                
                this.text.style.width = (67 * this.size + 12) + 'px';
                this.text.style.height = (67 * this.size + 12) + 'px';
                this.text.style.top = '16px';
                this.text.style.left = '16px';
                
                this.title.style.fontSize = (this.size * 5) + 'px';
                this.score.style.fontSize = (this.size * 10) + 'px';
            }
        },
        
        update: function(dt) {
            this.resize();
        }
    };

    return Score;
});