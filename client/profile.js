pc.script.create('profile', function (app) {
    var Profile = function (entity) {
        this.entity = entity;
        
        var css = function() {/*
            #username {
                position: absolute;
                left: 16px;
                top: 16px;
                z-index: 4;
                cursor: pointer;
                background-color: rgba(33, 34, 36, .75);
            }
            @media all and (max-width: 640px) {
                #username {
                    left: 8px;
                    top: 8px;
                }
            }
            @media all and (max-width: 479px) {
                #username {
                    top: 48px;
                }
            }
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);

        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
    };

    Profile.prototype = {
        initialize: function () {
            this.client = app.root.getChildren()[0].script.client;
            this.overlay = app.root.getChildren()[0].script.overlay;
            
            var canvas = this.canvas = document.createElement('canvas');
            canvas.id = 'username';
            canvas.width = 32;
            canvas.height = 32;
            document.body.appendChild(canvas);
            
            this.value = 'guest';
            
            var self = this;
            // var change = function() {
            //     if (! self.client.connected)
            //         return;
                    
            //     self.canvas.style.display = 'none';
            //     self.overlay.overlay(true);
            //     self.overlay.username(self.value, function(text) {
            //         if (text && /^([a-z0-9\-_]){4,8}$/i.test(text)) {
            //             self.value = text;
            //             self.draw();
            //             self.client.socket.send('user.name', text);
            //         }
            //         self.canvas.style.display = '';
            //         self.overlay.overlay(false);
            //     });
            // };
            // canvas.addEventListener('click', change, false);
            // canvas.addEventListener('touchstart', change, false);

            this.ctx = canvas.getContext('2d');
            this.font = 'normal 20px furore';
            this.ctx.font = this.font;
            this.padding = 8;
            this.draw();
            
            this.renderCanvas = document.createElement('canvas');
            this.renderCanvas.width = 128;
            this.renderCanvas.height = 128;
            this.renderCtx = this.renderCanvas.getContext('2d');
            this.renderCtx.font = 'normal 16px furore';
            this.renderCtx.textBaseline = 'middle';
            this.renderCtx.textAlign = 'center';
        },
        
        set: function(text) {
            this.value = text;
            this.draw();
        },
        
        draw: function() {
            var ctx = this.ctx;
            var size = ctx.measureText(this.value);
            var width = Math.ceil(size.width) + (this.padding * 2);
            
            // resize
            if (width !== this.canvas.width) {
                this.canvas.width = width;
                ctx.font = this.font;
                ctx.textBaseline = 'hanging';
                ctx.fillStyle = '#eee';
            }
            
            // text
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillText(this.value, this.padding, this.padding);
        },
        
        render: function(text) {
            var ctx = this.renderCtx;
            
            // rect
            ctx.beginPath();
            ctx.rect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
            ctx.fillStyle = '#000';
            ctx.fill();
            
            // text
            ctx.fillStyle = '#fff';
            ctx.fillText(text, this.renderCanvas.width / 2, this.renderCanvas.height / 2);
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeText(text, this.renderCanvas.width / 2, this.renderCanvas.height / 2);
            
            return this.renderCanvas;
        }
    };

    return Profile;
});