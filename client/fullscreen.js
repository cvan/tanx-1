pc.script.create('fullscreen', function (context) {
    // Creates a new Fullscreen instance
    var Fullscreen = function (entity) {
        this.entity = entity;
        
        document.body.style.width = '100%';
        document.body.requestFullScreen = document.body.requestFullScreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullScreen;
        document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen;
        
        if (! document.body.requestFullScreen) return;
        
        var button = this.button = document.createElement('div');
        button.id = 'fullscreenButton';
        button.style.position = 'absolute';
        button.style.width = '0px';
        button.style.height = '0px';
        button.style.top = '16px';
        button.style.left = '16px';
        button.style.zIndex = 1;
        button.style.borderLeft = '64px solid #212224';
        button.style.borderBottom = '64px solid transparent';
        button.style.cursor = 'pointer';
        button.style.textAlign = 'right';
        
        var i = document.createElement('img');
        i.src = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/images/fs.png';
        i.style.position = 'absolute';
        i.style.color = '#2ecc71';
        i.style.top = '0px';
        i.style.right = '20px';
        i.style.lineHeight = '0px';
        button.appendChild(i);
        
        button.script = this;
        document.body.appendChild(button);
        
        var changeState = function() {
            if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
                document.exitFullscreen();
            } else {
                document.body.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }.bind(this);

        button.addEventListener('click', changeState, false);
        button.addEventListener('touchstart', changeState, false);
    };
    
    Fullscreen.prototype.setSize = function(size) {
        this.button.style.borderLeftWidth = size + 'px';
        this.button.style.borderBottomWidth = size + 'px';
        
        this.button.childNodes[0].style.top = (size * .08) + 'px';
        this.button.childNodes[0].style.left = -Math.floor(size * .92) + 'px';
        
        this.button.childNodes[0].style.width = (size * .4) + 'px';
    };

    return Fullscreen;
});