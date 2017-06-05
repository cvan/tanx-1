pc.script.create('fullscreen', function (context) {
    // Creates a new Fullscreen instance
    var Fullscreen = function (entity) {
        this.entity = entity;
        
        document.body.style.width = '100%';
        document.body.requestFullScreen = document.body.requestFullScreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullScreen;
        document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen;
        
        if (! document.body.requestFullScreen) return;
        
        var css = function() {/*
            #fullscreenButton {
               position: absolute;
               width: 32px;
               height: 32px;
               top: 16px;
               right: 16px;
               z-index: 1;
               cursor: pointer;
               background-color: rgba(33, 34, 36, .75);
               background-image: url("https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/button-fs.png");
               background-size: 16px 16px;
               background-repeat: no-repeat;
               background-position: center center;
            }
            @media all and (max-width: 640px) {
                #fullscreenButton {
                    top: 8px;
                    right: 8px;
                }
            }
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);

        var button = this.button = document.createElement('div');
        button.id = 'fullscreenButton';
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

    return Fullscreen;
});