var GameUp;
(function (GameUp) {
    ;
    var Client = (function () {
        function Client(apikey) {
            this.apikey = apikey;
            this.ACCOUNTS_URL = "https://accounts.gameup.io/v0";
            this.API_URL = "https://api.gameup.io/v0";
        }
        Client.prototype.loginThroughBrowser = function (provider, callback, tokenToLink) {
            if (!tokenToLink) {
                tokenToLink = "";
            }
            var w = 1000;
            var h = 500;
            var l = (window.outerWidth / 2) - (w / 2);
            var t = (window.outerHeight / 2) - (h / 2);
            var settings = 'toolbar=no,location=no,directories=no,status=no,menubar=no,resizable=no' + ',copyhistory=no,scrollbars=yes' + ',width=' + w + ',height=' + h + ',top=' + t + ',left=' + l;
            var url = this.ACCOUNTS_URL + "/gamer/login/" + provider + "/?apiKey=" + this.apikey + "&token=" + tokenToLink;
            var popup = window.open(url, 'GameUp Social Login', settings);
            var interval = window.setInterval(function () {
                try {
                    if (!popup || popup.closed) {
                        window.clearInterval(interval);
                        callback.error(400, 'Window popup was closed.');
                    }
                }
                catch (e) {
                }
            }, 1000);
            window.addEventListener('message', function (event) {
                var gamerToken = event.data;
                if (typeof callback.success == 'function') {
                    callback.success(200, gamerToken);
                }
            });
        };
        Client.prototype.sendRequest = function (callback, to, method, gamerToken, payload) {
            if (!gamerToken) {
                gamerToken = "";
            }
            var ajaxSettings = {
                contentType: 'application/json',
                crossDomain: true,
                timeout: 3000,
                data: payload,
                type: method,
                url: to,
                xhrFields: {
                    mozSystem: true,
                },
                headers: {
                    "Authorization": "Basic " + btoa(this.apikey + ":" + gamerToken)
                },
                success: function (data, status, jqXHR) {
                    if (typeof callback.success == 'function') {
                        callback.success(jqXHR.status, data);
                    }
                },
                error: function (jqXHR, status, errorThrown) {
                    if (typeof callback.error == 'function') {
                        callback.error(jqXHR.status, jqXHR.responseJSON);
                    }
                }
            };
            $.ajax(ajaxSettings);
        };
        Client.prototype.sendApiRequest = function (callback, to, method, gamerToken, payload) {
            this.sendRequest(callback, this.API_URL + to, method, gamerToken, payload);
        };
        Client.prototype.sendLoginRequest = function (callback, to, payload, token) {
            this.sendRequest(callback, this.ACCOUNTS_URL + "/gamer/login/" + to, "POST", token, payload);
        };
        Client.prototype.ping = function (callback, token) {
            this.sendApiRequest(callback, "/", "HEAD");
        };
        Client.prototype.getServerInfo = function (callback) {
            this.sendApiRequest(callback, "/server/", "GET");
        };
        Client.prototype.getGame = function (callback) {
            this.sendApiRequest(callback, "/game/", "GET");
        };
        Client.prototype.loginAnonymous = function (uniqueId, callback) {
            this.sendLoginRequest(callback, "anonymous", JSON.stringify({ id: uniqueId }));
        };
        Client.prototype.loginTwitter = function (callback, tokenToLink) {
            this.loginThroughBrowser("twitter", callback, tokenToLink);
        };
        Client.prototype.loginGoogle = function (callback, tokenToLink) {
            this.loginThroughBrowser("google", callback, tokenToLink);
        };
        Client.prototype.loginFacebook = function (callback, tokenToLink) {
            this.loginThroughBrowser("facebook", callback, tokenToLink);
        };
        Client.prototype.loginGameUp = function (callback, tokenToLink) {
            this.loginThroughBrowser("gameup", callback, tokenToLink);
        };
        Client.prototype.loginOAuthFacebook = function (accessToken, callback, tokenToLink) {
            var payload = JSON.stringify({
                'type': "facebook",
                'access_token': accessToken
            });
            this.sendLoginRequest(callback, "oauth2", payload, tokenToLink);
        };
        Client.prototype.loginOAuthGoogle = function (accessToken, callback, tokenToLink) {
            var payload = JSON.stringify({
                'type': "google",
                'access_token': accessToken
            });
            this.sendLoginRequest(callback, "oauth2", payload, tokenToLink);
        };
        Client.prototype.getGamer = function (token, callback) {
            this.sendApiRequest(callback, "/gamer/", "GET", token);
        };
        Client.prototype.storageGet = function (token, storageKey, callback) {
            var encodedKey = encodeURIComponent(storageKey);
            this.sendApiRequest(callback, "/gamer/storage/" + encodedKey, "GET", token);
        };
        Client.prototype.storagePut = function (token, storageKey, payload, callback) {
            var encodedKey = encodeURIComponent(storageKey);
            this.sendApiRequest(callback, "/gamer/storage/" + encodedKey, "PUT", token, payload);
        };
        Client.prototype.storageDelete = function (token, storageKey, callback) {
            var encodedKey = encodeURIComponent(storageKey);
            this.sendApiRequest(callback, "/gamer/storage/" + encodedKey, "DELETE", token);
        };
        Client.prototype.getAchievements = function (callback) {
            this.sendApiRequest(callback, "/game/achievement", "GET");
        };
        Client.prototype.getGamerAchievements = function (token, callback) {
            this.sendApiRequest(callback, "/gamer/achievement", "GET", token);
        };
        Client.prototype.updateAchievement = function (token, achievementId, achievementCount, callback) {
            this.sendApiRequest(callback, "/gamer/achievement/" + achievementId, "POST", token, JSON.stringify({ 'count': achievementCount }));
        };
        Client.prototype.getLeaderboard = function (leadeboardId, callback) {
            this.sendApiRequest(callback, "/game/leaderboard/" + leadeboardId, "GET");
        };
        Client.prototype.getLeaderboardWithRank = function (token, leadeboardId, callback) {
            this.sendApiRequest(callback, "/gamer/leaderboard/" + leadeboardId, "GET", token);
        };
        Client.prototype.updateLeaderboardRank = function (token, leadeboardId, score, callback) {
            this.sendApiRequest(callback, "/gamer/leaderboard/" + leadeboardId, "POST", token, JSON.stringify({ 'score': score }));
        };
        return Client;
    })();
    GameUp.Client = Client;
    ;
})(GameUp || (GameUp = {}));
;