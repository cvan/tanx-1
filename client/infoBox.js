pc.script.create('infoBox', function (context) {
    var InfoBox = function (entity) {
        this.entity = entity;

        var button = this.button = document.createElement('div');
        button.id = 'infoButton';
        button.style.position = 'absolute';
        button.style.width = '0px';
        button.style.height = '0px';
        button.style.top = '16px';
        button.style.right = '16px';
        button.style.zIndex = 1;
        button.style.borderRight = '64px solid #212224';
        button.style.borderBottom = '64px solid transparent';
        button.style.cursor = 'pointer';
        button.style.textAlign = 'right';
        
        var i = document.createElement('div');
        i.style.position = 'absolute';
        i.style.fontSize = '24px';
        i.style.fontFamily = 'Helvetica, sans-serif';
        i.style.color = '#5e7578';
        i.style.top = '0px';
        i.style.right = '0px';
        i.style.width = '0px';
        i.style.lineHeight = '0px';
        i.textContent = 'i';
        button.appendChild(i);
        
        button.script = this;
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
        modal.style.zIndex = 2;
        modal.style.cursor = 'pointer';
        modal.style.textAlign = 'center';
        
        modal.innerHTML = '<img src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/tanx_green.png" style="padding-top:8px;" />';
        modal.innerHTML += '<p>Multiplayer Top-Down Tanks Shooter<p>';
        modal.innerHTML += '<p>made during 12 hours hackathon using <a href="https://playcanvas.com/" target="_blank">PlayCanvas</a> and node.js.</p>';
        modal.innerHTML += '<p>Use WASD &amp; Mouse to control tank or Touch Joystics on mobile platforms.</p>';
        modal.innerHTML += '<p>The game features use of HTML5, WebGL, WebSockets, Canvas, Touch.</p>';
        modal.innerHTML += '<br /><p>design: <a href="https://twitter.com/4Roonio" target="_blank">Roonio</a></p>';
        modal.innerHTML += '<p>code: <a href="https://twitter.com/mrmaxm" target="_blank">moka</a></p>';
        modal.innerHTML += '<br /><p>accounts and leaderboards powered by</p>';
        modal.innerHTML += '<p><a href="https://gameup.io" target="_blank">GameUp</a></p>';
        
        
        document.body.appendChild(modal);
        
        document.body.style.fontWeight = '100';
        
        var logo = document.createElement('img');
        logo.src = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/tanx.png';
        logo.alt = 'logo';
        logo.style.position = 'absolute';
        logo.style.bottom = '16px';
        logo.style.left = '50%';
        logo.style.width = '96px';
        logo.style.opacity = '0.4';
        logo.style.marginLeft = '-48px';
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