pc.script.create('leaderboardBox', function (context) {
    var loading = false;

    // Creates a new LeaderboardBox instance
    var LeaderboardBox = function (entity) {
        this.entity = entity;

        var css = function() {/*
            #leaderboardButton {
               position: absolute;
               width: 32px;
               height: 32px;
               line-height: 32px;
               top: 16px;
               right: 96px;
               z-index: 1;
               cursor: pointer;
               color: #eee;
               text-align: center;
               background-color: rgba(33, 34, 36, .75);
            }
            @media all and (max-width: 640px) {
                #leaderboardButton {
                    top: 8px;
                    right: 48px;
                }
            }
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);

        var button = this.button = document.createElement('div');
        button.id = 'leaderboardButton';
        button.textContent = 'L';
        document.body.appendChild(button);
        
        var modal = this.modal = document.createElement('div');
        modal.id = 'modal';
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.width = 'auto';
        modal.style.height = 'auto';
        modal.style.padding = '0 16px 4px 16px';
        modal.style.backgroundColor = '#212224';
        // modal.style.color = '#2ecc71';
        modal.style.display = 'none';
        modal.style.zIndex = 21;
        modal.style.cursor = 'pointer';
        modal.style.textAlign = 'center';
        
        modal.innerHTML = '<p>Login to GameUp to see leaderboard</p>';
        
        document.body.appendChild(modal);
        
        document.body.style.fontWeight = '100';
        
        modal.addEventListener('click', function() {
            this.modal.style.display = 'none';
        }.bind(this), false);
        
        modal.addEventListener('touchstart', function() {
            this.modal.style.display = 'none';
        }.bind(this), false);
        

        button.addEventListener('click', function() {
            refreshLeaderboard(this.modal, this.entity);
            this.modal.style.display = 'block';
        }.bind(this), false);
        
        button.addEventListener('touchstart', function() {
            refreshLeaderboard(this.modal, this.entity);
            this.modal.style.display = 'block';
        }.bind(this), false);
    };
    
    function refreshLeaderboard(modal, entity) {
        if (!loading && entity && entity.c && entity.c.script && entity.c.script.client && entity.c.script.client.guclient && entity.c.script.client.gamertoken) {
            loading = true;
            modal.innerHTML = '<p>Loading</p>';
            var guclient = entity.c.script.client.guclient;
            var gamertoken = entity.c.script.client.gamertoken;
            guclient.getLeaderboardWithRank(gamertoken, '70cfd64e2a6f4434be39fb71e952f0ff', {
                success: function(status, response) {
                    var html = '<p>' + response.leaderboard.name + '</p><br />';
                    html += '<p>Top 10</p>';
                    html += '<table style="margin-left:auto;margin-right:auto;color:#AAA;border:1px solid #AAA"><tr><th>Rank</th><th>Name</th><th>Points</th></tr>';
                    for (var i = 0; i < response.leaderboard.entries.length && i < 10; i++) {
                        var entry = response.leaderboard.entries[i];
                        html += '<tr><td>' + (i+1) + '</td><td>' + entry.name + '</td><td>' + entry.score + '</td></tr>';
                    }
                    html += '</table><br />';
                    html += '<p>Your Rank</p>';
                    html += '<table style="margin-left:auto;margin-right:auto;color:#AAA;border:1px solid #AAA"><tr><th>Rank</th><th>Name</th><th>Points</th></tr>';
                    html += '<tr><td>' + (response.rank.rank < 1 ? '-' : response.rank.rank) + '</td><td>' + response.rank.name + '</td><td>' + response.rank.score + '</td></tr>';
                    modal.innerHTML = html;
                    loading = false;
                },
                error: function(status, response) {
                    modal.innerHTML = '<p>Leaderboard refresh failed, close to retry</p>';
                    loading = false;
                    console.log(response);
                }
            });
        }
    }

    LeaderboardBox.prototype.setSize = function(size) {
        this.button.style.borderRightWidth = size + 'px';
        this.button.style.borderBottomWidth = size + 'px';
        
        this.button.childNodes[0].style.top = (size * .33) + 'px';
        this.button.childNodes[0].style.right = -Math.floor(size * .66) + 'px';
        this.button.childNodes[0].style.fontSize = Math.floor(size / 3) + 'px';

        // this.button.style.borderRightWidth = size + 'px';
        // this.button.style.borderTopWidth = size + 'px';
        
        // this.button.style.top = (16 * 4 + size) + 'px';
        
        // this.button.childNodes[0].style.bottom = (size * .33) + 'px';
        // this.button.childNodes[0].style.right = -Math.floor(size * .66) + 'px';
        // this.button.childNodes[0].style.fontSize = Math.floor(size / 3) + 'px';
    };

    return LeaderboardBox;
});
