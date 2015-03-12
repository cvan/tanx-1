pc.script.create('infoBox', function (context) {
    var InfoBox = function (entity) {
        this.entity = entity;
        
        var css = function() {/*
            #infoButton {
               position: absolute;
               width: 32px;
               height: 32px;
               line-height: 32px;
               top: 16px;
               right: 56px;
               z-index: 1;
               cursor: pointer;
               color: #eee;
               text-align: center;
               background-color: rgba(33, 34, 36, .75);
            }
            @media all and (max-width: 640px) {
                #infoButton {
                    top: 8px;
                    right: -48px;
                }
            }
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);

        var button = this.button = document.createElement('div');
        button.id = 'infoButton';
        button.textContent = '?';
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
        modal.style.zIndex = 20;
        modal.style.cursor = 'pointer';
        modal.style.textAlign = 'center';
        
        modal.innerHTML = '<img src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/tanx_green.png" style="padding-top:8px;" />';
        modal.innerHTML += '<p>Multiplayer Top-Down Tanks Shooter<p>';
        modal.innerHTML += '<p>made during 12 hours hackathon using <a href="https://playcanvas.com/" target="_blank">PlayCanvas</a> and node.js.</p>';
        modal.innerHTML += '<p>Use WASD &amp; Mouse to control tank or Touch Joystics on mobile platforms.</p>';
        modal.innerHTML += '<p>The game features use of HTML5, WebGL, WebSockets, Canvas, Touch.</p>';
        modal.innerHTML += '<br /><p>code: <a href="https://twitter.com/mrmaxm" target="_blank">moka</a></p>';
        modal.innerHTML += '<br /><p>art: SashaRX</p>';
        modal.innerHTML += '<br /><p>ui: <a href="https://twitter.com/4Roonio" target="_blank">Roonio</a></p>';
        modal.innerHTML += '<br /><p>sound: <a href="mailto:toxin136+tanx@gmail.com" target="_blank">ToXa</a></p>';
        modal.innerHTML += '<br /><p>nicknames and leaderboards: <a href="https://gameup.io" target="_blank">GameUp</a></p>';
        
        document.body.appendChild(modal);
        
        document.body.style.fontWeight = '100';
        
        var logo = document.createElement('img');
        logo.id = 'logo';
        logo.src = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/tanx-logo-black.png';
        logo.alt = 'logo';
        document.body.appendChild(logo);
        
        modal.addEventListener('click', function() {
            this.modal.style.display = 'none';
        }.bind(this), false);
        
        modal.addEventListener('touchstart', function() {
            this.modal.style.display = 'none';
        }.bind(this), false);
        

        button.addEventListener('click', function() {
            this.modal.style.display = 'block';
        }.bind(this), false);
        
        button.addEventListener('touchstart', function() {
            this.modal.style.display = 'block';
        }.bind(this), false);
    };
    
    InfoBox.prototype.setSize = function(size) {
        this.button.style.borderRightWidth = size + 'px';
        this.button.style.borderBottomWidth = size + 'px';
        
        this.button.childNodes[0].style.top = (size * .33) + 'px';
        this.button.childNodes[0].style.right = -Math.floor(size * .66) + 'px';
        this.button.childNodes[0].style.fontSize = Math.floor(size / 3) + 'px';
    };

    return InfoBox;
});