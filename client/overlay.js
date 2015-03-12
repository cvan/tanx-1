pc.script.create('overlay', function (app) {
    
    // var keen = null;
    
    var Overlay = function (entity) {
        this.entity = entity;
        var self = this;
    
        // keen = new Keen({
        //     projectId: "54eb156f90e4bd1959288d85",
        //     writeKey: "57990cb4ec3c12d7bf8eeb7917601c0ecea42d635b0231cca3ba627a1c03c70c915ef4c8e96d7b9d3e6fb1489d7bd1894807ed502744136d3f83b5300eb3a5047565bf120b767c2b2798164fa7802a2fd420510b1e446172ddebc94a45aa007b0dae86701ee616280fff987d8f95f7f9"
        // });
    
        var css = [
            // cinematic
            ".cinematic-top,",
            ".cinematic-bottom {",
            // "   display: none;",
            "   position: absolute;",
            "   left: 0;",
            "   right: 0;",
            "   width: auto;",
            "   height: 0%;",
            "   visibility: hidden;",
            "   background-color: #000;",
            "   z-index: 2;",
            "   transition: visibility 200ms, height 200ms;",
            "   cursor: default;",
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
            "}",
            "#powered {",
            "   position: absolute;",
            "   bottom: 16px;",
            "   left: 16px;",
            "   z-index: 4;",
            "}",
            "#powered > img {",
            "   width: 100px;",
            "}",
            "#powered2 {",
            "   position: absolute;",
            "   bottom: 16px;",
            "   left: 132px;",
            "   z-index: 4;",
            "}",
            "#powered2 > img {",
            "   width: 100px;",
            "}",
            // overlay
            "#overlay {",
            "   position: absolute;",
            "   top: 0;",
            "   right: 0;",
            "   left: 0;",
            "   bottom: 0;",
            "   width: auto;",
            "   height: auto;",
            "   opacity: 0;",
            "   z-index: 3;",
            "   visibility: hidden;",
            "   background-color: rgba(0, 0, 0, .7);",
            "   transition: opacity 200ms, visibility 200ms, background-color 200ms;",
            "   cursor: default;",
            "}",
            "#overlay.active {",
            "   opacity: 1;",
            "   visibility: visible;",
            "}",
            // logo
            "#overlay > .logo {",
            "   position: absolute;",
            "   top: calc(50% - 76px);",
            "   left: calc(50% - 246px);",
            "   opacity: 0;",
            "   visibility: hidden;",
            "   transition: opacity 200ms, visibility 200ms;",
            "}",
            "#overlay > .logo.active {",
            "   opacity: 1;",
            "   visibility: visible;",
            "}",
            // winner
            "#overlay > .winner {",
            "   position: absolute;",
            "   top: calc(50% - 116px);",
            "   left: 0;",
            "   right: 0;",
            "   width: auto;",
            "   height: 232px;",
            "   color: #fff;",
            "   opacity: 0;",
            "   visibility: hidden;",
            "   transition: opacity 200ms, visibility 200ms;",
            "}",
            "#overlay > .winner.active {",
            "   opacity: 1;",
            "   visibility: visible;",
            "}",
            "#overlay > .winner > .icon {",
            "   width: 128px;",
            "   height: 128px;",
            "   margin: 0 auto 8px;",
            "   background-size: contain;",
            "   background-position: center center;",
            "   background-repeat: no-repeat;",
            "}",
            "#overlay > .winner > .text {",
            "   text-align: center;",
            "   font-size: 18px;",
            "   line-height: 20px;",
            "   color: #c4d9e6;",
            "}",
            "#overlay > .winner > .team {",
            "   text-align: center;",
            "   font-size: 64px;",
            "   line-height: 72px;",
            "}",
            // killer
            "#overlay > .killer {",
            "   position: absolute;",
            "   top: calc(50% - 116px);",
            "   left: calc(50% - 160px);",
            "   width: 320px;",
            "   height: 232px;",
            "   color: #fff;",
            "   opacity: 0;",
            "   visibility: hidden;",
            "   transition: opacity 200ms, visibility 200ms;",
            "}",
            "#overlay > .killer.active {",
            "   opacity: 1;",
            "   visibility: visible;",
            "}",
            "#overlay > .killer > .icon {",
            "   width: 112px;",
            "   height: 128px;",
            "   margin: 0 auto 8px;",
            "   background-size: contain;",
            "   background-position: center center;",
            "   background-repeat: no-repeat;",
            "}",
            "#overlay > .killer > .by {",
            "   text-align: center;",
            "   font-size: 18px;",
            "   line-height: 20px;",
            "   color: #c4d9e6;",
            "}",
            "#overlay > .killer > .name {",
            "   text-align: center;",
            "   font-size: 42px;",
            "   line-height: 72px;",
            "}",
            "#overlay > #timer {",
            "   position: absolute;",
            "   left: calc(50% - 32px);",
            "   bottom: 15%;",
            "   color: #c4d9e6;",
            "   width: 64px;",
            "   text-align: center;",
            "   font-size: 24px;",
            "   line-height: 30px;",
            "   margin-bottom: 8px;",
            "   opacity: 0;",
            "   visibility: hidden;",
            "   transition: opacity 200ms, visibility 200ms;",
            "}",
            "#overlay > #timer.active {",
            "   opacity: 1;",
            "   visibility: visible;",
            "}",
            // "#usernamePopup {",
            // "   width: 256px;",
            // "   height: 58px;",
            // "   background-color: #212224;",
            // "   position: absolute;",
            // "   top: calc(50% - 61px);",
            // "   left: calc(50% - 160px);",
            // "   color: #fff;",
            // "   text-align: center;",
            // "   cursor: default;",
            // "   padding: 32px;",
            // "   z-index: 3;",
            // "   opacity: 0;",
            // "   visibility: hidden;",
            // "   transition: opacity 200ms, visibility 200ms;",
            // "}",
            // "#usernamePopup.active {",
            // "   opacity: 1;",
            // "   visibility: visible;",
            // "}",
            // "#usernamePopup > input {",
            // "   display: none;",
            // "   margin: 0;",
            // "   outline: 0;",
            // "   width: calc(100% - 16px - 2px);",
            // "   line-height: 32px;",
            // "   padding: 0 8px;",
            // "   font-size: 18px;",
            // "   font-family: furore;",
            // "   background-color: #000;",
            // "   color: #fff;",
            // "   border: 1px solid #333;",
            // "   text-align: center;",
            // "}",
            // "#usernamePopup.active > input {",
            // "   display: block;",
            // "}",
            // "#usernamePopup > #usernameCancel {",
            // "   float: left;",
            // "   margin: 8px 0 0 1px;",
            // "}",
            // "#usernamePopup > #usernameOk {",
            // "   float: right;",
            // "   margin: 8px 1px 0 0;",
            // "}",
            // "#popup {",
            // "   width: 256px;",
            // "   height: 376px;",
            // "   background-color: #212224;",
            // "   position: absolute;",
            // "   top: calc(50% - 220px);",
            // "   left: calc(50% - 160px);",
            // "   color: #fff;",
            // "   text-align: center;",
            // "   cursor: default;",
            // "   padding: 32px;",
            // "   z-index: 3;",
            // "   opacity: 0;",
            // "   visibility: hidden;",
            // "   transition: opacity 200ms, visibility 200ms;",
            // "}",
            // "#popup.active {",
            // "   opacity: 1;",
            // "   visibility: visible;",
            // "}",
            // "#popup > .free {",
            // "   margin: 0;",
            // "}",
            // "#popup > .upgrade {",
            // "   font-size: 48px;",
            // "   margin: 0;",
            // "   color: #2ECC71;",
            // "}",
            // "#popup > .image {",
            // "   width: 128px;",
            // "   height: 128px;",
            // "   display: block;",
            // "   margin: 16px auto;",
            // "}",
            // "#popup > .description {",
            // "   font-size: 18px;",
            // "   color: #999;",
            // "}",
            // "#popup > #popupInstall {",
            // "   display: block;",
            // "   margin: 8px auto;",
            // "   cursor: pointer;",
            // "}",
            // "#popup > #popupClose {",
            // "   margin-top: 16px;",
            // "   font-size: 12px;",
            // "   color: #999;",
            // "   cursor: pointer;",
            // "}",
            // "#popupThanks {",
            // "   width: 256px;",
            // "   height: 206px;",
            // "   background-color: #212224;",
            // "   position: absolute;",
            // "   top: calc(50% - 135px);",
            // "   left: calc(50% - 160px);",
            // "   color: #fff;",
            // "   text-align: center;",
            // "   cursor: default;",
            // "   padding: 32px;",
            // "   z-index: 3;",
            // "   opacity: 0;",
            // "   visibility: hidden;",
            // "   transition: opacity 200ms, visibility 200ms;",
            // "}",
            // "#popupThanks.active {",
            // "   opacity: 1;",
            // "   visibility: visible;",
            // "}",
            // "#popupThanks > .thanks {",
            // "   font-size: 48px;",
            // "   color: #2ECC71;",
            // "   margin: 0;",
            // "}",
            // "#popupThanks > .mobile {",
            // "   font-size: 24px;",
            // "}",
            // "#popupThanks > #popupThanksClose {",
            // "   width: 160px;",
            // "   background-color: #2ECC71;",
            // "   line-height: 48px;",
            // "   margin: 0 auto;",
            // "   cursor: pointer;",
            // "}",
            "@media all and (max-width: 640px) {",
            "   .cinematic-top,",
            "   .cinematic-bottom {",
            "       display: none;",
            "   }",
            "   #powered {",
            "       top: auto;",
            "       bottom: 8px;",
            "       left: 8px;",
            "   }",
            "   #powered.initial {",
            "       bottom: calc(50% + 38px + 4px);",
            "       left: calc(50% - 122px);",
            "   }",
            "   #powered > img {",
            "       width: 100px;",
            "   }",
            "   #powered2 {",
            "       top: auto;",
            "       bottom: 8px;",
            "       left: 116px;",
            "   }",
            "   #powered2.initial {",
            "       bottom: calc(50% + 38px + 4px);",
            "       left: calc(50% - 6px);",
            "   }",
            "   #powered2 > img {",
            "       width: 100px;",
            "   }",
            "   #overlay > .logo {",
            "       width: 246px;",
            "       left: calc(50% - 123px);",
            "       top: calc(50% - 38px);",
            "   }",
            "   #overlay > .winner {",
            "       top: calc(50% - 83px);",
            "       height: 166px;",
            "   }",
            "   #overlay > .winner > .icon {",
            "       width: 72px;",
            "       height: 88px;",
            "       margin-bottom: 0;",
            "   }",
            "   #overlay > .winner > .text {",
            "       font-size: 14px;",
            "       line-height: 16px;",
            "   }",
            "   #overlay > .winner > .team {",
            "      font-size: 48px;",
            "      line-height: 54px;",
            "   }",
            "   #overlay > .killer {",
            "       top: calc(50% - 83px);",
            "       height: 166px;",
            "   }",
            "   #overlay > .killer > .icon {",
            "       width: 72px;",
            "       height: 88px;",
            "       margin-bottom: 0;",
            "   }",
            "   #overlay > .killer > .by {",
            "       font-size: 14px;",
            "       line-height: 16px;",
            "   }",
            "   #overlay > .killer > .name {",
            "      font-size: 48px;",
            "      line-height: 54px;",
            "   }",
            "   #overlay > #timer {",
            "       bottom: 0;",
            "   }",
            // "   #popup {",
            // "       width: auto;",
            // "       height: auto;",
            // "       left: 0;",
            // "       top: 0;",
            // "       right: 0;",
            // "       bottom: 0;",
            // "       padding: 8px;",
            // "   }",
            // "   #popupThanks {",
            // "       width: auto;",
            // "       height: auto;",
            // "       left: 0;",
            // "       top: 0;",
            // "       right: 0;",
            // "       bottom: 0;",
            // "       padding: 8px;",
            // "   }",
            "}"//,
            // "@media all and (max-width: 640px) and (max-height: 480px) and (min-width: 480px) {",
            // "   #popup > .image {",
            // "       padding-bottom: 0;",
            // "   }",
            // "   #popup > .image {",
            // "       float: left;",
            // "       margin: 16px 16px 0 16px;",
            // "   }",
            // "   #popup > .description {",
            // "       text-align: left;",
            // "   }",
            // "   #popup > #popupInstall {",
            // "       margin: 0;",
            // "       float: left;",
            // "   }",
            // "   #popup > #popupClose {",
            // "       float: right;",
            // "       margin: 26px 16px 0 0;",
            // "   }",
            // "}"
        ].join('\n');
        
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
        
        // overlay
        var overlay = this.elOverlay = document.createElement('div');
        overlay.classList.add('active');
        overlay.id = 'overlay';
        document.body.appendChild(overlay);
        
        // logo
        var logo = this.elLogo = new Image();
        logo.classList.add('logo', 'active');
        logo.src = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/tanx-logo.png';
        overlay.appendChild(logo);

        // cinematic top
        var cinematicTop = this.elCinematicTop = document.createElement('div');
        cinematicTop.classList.add('cinematic-top', 'active');
        document.body.appendChild(cinematicTop);
        
        this.elLogoSmall = document.getElementById('logo');
        
        // powered by
        var powered = this.elPowered = document.createElement('a');
        powered.id = 'powered';
        powered.target = '_blank';
        powered.href = 'https://playcanvas.com/';
        powered.classList.add('powered', 'initial');
        powered.addEventListener('touchstart', function() {
            window.open(this.href);
        }, false);
        overlay.appendChild(powered);
        
        // powered by img
        var img = new Image();
        img.src = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/powered.png';
        powered.appendChild(img);
        
        // powered by 2
        var powered2 = this.elPowered2 = document.createElement('a');
        powered2.id = 'powered2';
        powered2.target = '_blank';
        powered2.href = 'https://gameup.io/';
        powered2.classList.add('powered2', 'initial');
        powered2.addEventListener('touchstart', function() {
            window.open(this.href);
        }, false);
        overlay.appendChild(powered2);
        
        // powered by 2 img
        var img2 = new Image();
        img2.src = 'https://gameup.io/img/header_logo-95719c75.png';
        powered2.appendChild(img2);

        // cinematic bottom
        var cinematicBottom = this.elCinematicBottom = document.createElement('div');
        cinematicBottom.classList.add('cinematic-bottom', 'active');
        document.body.appendChild(cinematicBottom);
        
        // winner
        var winner = this.elWinner = document.createElement('div');
        winner.classList.add('winner');
        overlay.appendChild(winner);
        
        // winner icon
        var winnerIcon = this.elWinnerIcon = document.createElement('div');
        winnerIcon.classList.add('icon');
        winner.appendChild(winnerIcon);
        
        // winner message
        var winnerText = document.createElement('div');
        winnerText.classList.add('text');
        winnerText.textContent = 'winner';
        winner.appendChild(winnerText);
        
        // winner team
        var winnerTeam = this.elWinnerTeam = document.createElement('div');
        winnerTeam.classList.add('team');
        winnerTeam.textContent = '';
        winner.appendChild(winnerTeam);

        // killer
        var killer = this.elKiller = document.createElement('div');
        killer.classList.add('killer');
        overlay.appendChild(killer);
        
        // killer icon
        var killerIcon = this.elKillerIcon = document.createElement('div');
        killerIcon.classList.add('icon');
        killer.appendChild(killerIcon);
        
        // killer name
        var killerBy = document.createElement('div');
        killerBy.classList.add('by');
        killerBy.textContent = 'killed by';
        killer.appendChild(killerBy);
        
        // killer name
        var killerName = this.elKillerName = document.createElement('div');
        killerName.classList.add('name');
        killer.appendChild(killerName);
        
        // killer timer
        var timer = this.elTimer = document.createElement('div');
        timer.id = 'timer';
        overlay.appendChild(timer);
        
        // username
        // var username = this.elUsername = document.createElement('div');
        // username.id = 'usernamePopup';
        // username.innerHTML = "<input id='usernameInput' type='text' value='guest'><div id='usernameCancel'>Cancel</div><div id='usernameOk'>OK</div>";
        // document.body.appendChild(username);
        
        // this.elUsernameInput = document.getElementById('usernameInput');
        // this.elUsernameInput.addEventListener('keydown', function(evt) {
        //     if (evt.keyCode === 13)
        //         document.getElementById('usernameOk').click();
                
        //     if (evt.keyCode === 27)
        //         document.getElementById('usernameCancel').click();
        // }, false);
        
        // document.getElementById('usernameOk').addEventListener('click', function() {
        //     self.username(true);
        //     self.elUsernameInput.blur();
        // });
        // document.getElementById('usernameOk').addEventListener('touchstart', function() {
        //     self.username(true);
        //     self.elUsernameInput.blur();
        // });
        // document.getElementById('usernameCancel').addEventListener('click', function() {
        //     self.username(false);
        //     self.elUsernameInput.blur();
        // });
        // document.getElementById('usernameCancel').addEventListener('touchstart', function() {
        //     self.username(false);
        //     self.elUsernameInput.blur();
        // });
        
        // this.usernameFn = null;
        
        // // popup
        // var popup = this.elPopup = document.createElement('div');
        // popup.id = 'popup';
        // popup.innerHTML = '<p class="free">Free</p><p class="upgrade">Upgrade</p><img class="image" src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/tanx-upgrade.png" /><p class="description">Install Mobile Version to Upgrade Your Tank</p><img id="popupInstall" src="https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/download-app-store.png" /><div id="popupClose">Close</div>';
        // document.body.appendChild(popup);
        
        // var closePopup = function() {
        //     popup.classList.remove('active');
        //     setTimeout(function() {
        //         if (popup.parentNode) {
        //             popup.parentNode.removeChild(popup);    
        //         }
        //     }, 500);
        // };
    
        // this.sent = false;
        // var sendEvent = function (collection, data) {
        //     if (keen) {
        //         // basic event data
        //         var event = {
        //             referrer: document.referrer,
        //             keen: {
        //                 addons : [
        //                     {
        //                         name : "keen:ua_parser",
        //                         input : {
        //                             ua_string : "user_agent"
        //                         },
        //                         output : "user_agent_info"
        //                     }, {
        //                         name : "keen:ip_to_geo",
        //                         input : {
        //                             ip : "ip_address"
        //                         },
        //                         output : "ip_geo_info"
        //                     }
        //                 ],
        //             },
        //             ip_address : "${keen.ip}",
        //             user_agent : "${keen.user_agent}"
        //         };
                
        //         // add extra data
        //         for (var key in data) {
        //             if (!event[key]) {
        //                 event[key] = data[key];
        //             }
        //         }
            
        //         keen.addEvent(collection, event, function (err, res) {
        //             if (err) {
        //                 console.error(err);
        //             } else {
                        
        //             }
        //         });
        //     }
        // }
        
        // popup.querySelector('#popupInstall').addEventListener('click', function() {
        //     closePopup();
        //     popupThanks.classList.add('active');
        //     if (!self.sent) {
        //         sendEvent("impressions", {
        //             install: 1
        //         });
        //         self.sent = true;
        //     }
        // }, false);
        // popup.querySelector('#popupInstall').addEventListener('touchstart', function() {
        //     closePopup();
        //     popupThanks.classList.add('active');
        //     if (!self.sent) {
        //         sendEvent("impressions", {
        //             install: 1
        //         });
        //         self.sent = true;
        //     }
        // }, false);
        
        // popup.querySelector('#popupClose').addEventListener('click', function () {
        //     closePopup();
        //     if (!self.sent) {
        //         sendEvent("impressions", {
        //             install: 0
        //         });
        //         self.sent = true;
        //     }
        // }, false);
        // popup.querySelector('#popupClose').addEventListener('touchstart', function () {
        //     closePopup();
        //     if (!self.sent) {
        //         sendEvent("impressions", {
        //             install: 0
        //         });
        //         self.sent = true;
        //     }
        // }, false);
        
        // // popup thanks
        // var popupThanks = this.elPopupThanks = document.createElement('div');
        // popupThanks.id = 'popupThanks';
        // popupThanks.innerHTML = '<p class="thanks">Thanks</p><p class="mobile">Mobile Version Coming Soon.</p><div id="popupThanksClose">Close</div>';
        // document.body.appendChild(popupThanks);
        
        // var closePopupThanks = function() {
        //     popupThanks.classList.remove('active');
        //     setTimeout(function() {
        //         if (popupThanks.parentNode) {
        //             popupThanks.parentNode.removeChild(popupThanks);    
        //         }
        //     }, 500);
        // };
        
        // popupThanks.querySelector('#popupThanksClose').addEventListener('click', closePopupThanks, false);
        // popupThanks.querySelector('#popupThanksClose').addEventListener('touchstart', closePopupThanks, false);

        this.timerStart = 0;
        this.timerElapse = 1;
        this.timerSecond = 0;
        
        this.imagesStore = 'https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/';
        // this.popupDelay = -1;
        
        // if (! /(ipad|iphone|ipod)/gi.test(navigator.userAgent)) {
        //     popup.parentNode.removeChild(popup);
        //     this.elPopup = null;
        // }
        
        this.volume = .5;
        this.volumeTarget = .5;
        
        var self = this;
        setTimeout(function() {
            var audio = self.audio = new Audio('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/tanx/music.mp3');
            // audio.autoplay = true;
            audio.controls = false;
            audio.loop = true;
            audio.volume = self.volume;
            // audio.play();
            
            var evtPlay = function() {
                audio.play();
                window.removeEventListener('touchstart', evtPlay);
            };
            window.addEventListener('touchstart', evtPlay, false);
        }, 500);
    };

    Overlay.prototype = {
        initialize: function () {
            this.touch = app.root.getChildren()[0].script.touch;
            this.minimap = app.root.getChildren()[0].script.minimap;
            
            this.overlay(.2);
            this.cinematic(true);
            this.timer(5);
        },
        
        update: function() {
            if (this.timerStart) {
                var s = this.timerElapse - Math.round((Date.now() - this.timerStart) / 1000);
                if (s >= 0) {
                    if (this.timerSecond !== s) {
                        this.timerSecond = s;
                        this.elTimer.textContent = s;
                    }
                } else {
                    this.timerStart = 0;
                    this.elTimer.classList.remove('active');
                }
            }
            
            if (this.audio && this.volume !== this.volumeTarget) {
                this.volume += (this.volumeTarget - this.volume) * .1;
                
                if (Math.abs(this.volume - this.volumeTarget) < 0.01)
                    this.volume = this.volumeTarget;
                    
                this.audio.volume = this.volume;
            }
        },

        overlay: function(state) {
            if (state) {
                this.volumeTarget = .5;
                this.elOverlay.style.backgroundColor = 'rgba(0, 0, 0, ' + (isNaN(state) ? .7 : state) + ')'
                this.elOverlay.classList.add('active');
                this.elLogoSmall.style.display = 'none';
                this.touch.hidden(true);
                this.minimap.state(false);

                if (--this.popupDelay === 0 && this.elPopup)
                    this.popupDownload();
            } else {
                this.volumeTarget = .2;
                this.elLogoSmall.style.display = '';
                this.elOverlay.style.backgroundColor = '';
                this.elOverlay.classList.remove('active');
                this.elLogo.classList.remove('active');
                this.elPowered.classList.remove('initial');
                this.elPowered2.classList.remove('initial');
                this.touch.hidden(false);
                this.minimap.state(true);
                this.timer(false);
            }
        },
        
        popupDownload: function() {
            this.elPopup.classList.add('active');
        },
        
        cinematic: function(state) {
            if (state) {
                this.elCinematicTop.classList.add('active');
                this.elCinematicBottom.classList.add('active');
            } else {
                this.elCinematicTop.classList.remove('active');
                this.elCinematicBottom.classList.remove('active');
            }
        },
        
        // username: function(text, fn) {
        //     if (text === true) {
        //         this.elUsername.classList.remove('active');
        //         if (this.usernameFn)
        //             this.usernameFn(this.elUsernameInput.value);
                    
        //     } else if (text) {
        //         this.usernameFn = fn;
        //         this.elUsername.classList.add('active');
        //         this.elUsernameInput.value = text;
                
        //         var self = this;
        //         setTimeout(function() {
        //             self.elUsernameInput.focus();
        //             self.elUsernameInput.select();
        //         }, 200);
        //     } else {
        //         this.elUsername.classList.remove('active');
                
        //         if (this.usernameFn)
        //             this.usernameFn();
        //     }
        // },
        
        winner: function(team) {
            if (! team) {
                this.elWinner.classList.remove('active');
            } else {
                this.killer(false);
                this.elWinnerTeam.textContent = team;
                this.elWinnerIcon.style.backgroundImage = 'url("' + this.imagesStore + 'winner-' + team + '.png")';
                this.elWinner.classList.add('active');
            }
        },
        
        timer: function(elapse) {
            if (elapse) {
                this.timerStart = Date.now();
                this.timerElapse = elapse;
                this.timerSecond = -1;
                this.elTimer.classList.add('active');
            } else {
                this.timerStart = 0;
                this.elTimer.classList.remove('active');
            }
        },
        
        killer: function(name, color) {
            if (! name) {
                this.timerStart = null;
                this.elKiller.classList.remove('active');
            } else {
                this.timerStart = Date.now();
                this.elKillerIcon.style.backgroundImage = 'url("' + this.imagesStore + 'killer-' + color + '.png")';
                this.elKillerName.textContent = name;
                this.elKiller.classList.add('active');
            }
        },
        

    };

    return Overlay;
});