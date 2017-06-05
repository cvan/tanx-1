pc.script.create('font', function (context) {
    var Font = function () {
        var css = [
            "@font-face {",
            "    font-family: 'furore';",
            "    src: url('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/fonts/Furore-webfont.eot');",
            "    src: url('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/fonts/Furore-webfont.eot?#iefix') format('embedded-opentype'),",
            "         url('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/fonts/Furore-webfont.woff2') format('woff2'),",
            "         url('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/fonts/Furore-webfont.woff') format('woff'),",
            "         url('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/fonts/Furore-webfont.ttf') format('truetype'),",
            "         url('https://s3-eu-west-1.amazonaws.com/static.playcanvas.com/fonts/Furore-webfont.svg#furoreregular') format('svg');",
            "    font-weight: normal;",
            "    font-style: normal;",
            "}",
            "body {",
                "font-family: 'furore';",
                "font-weight: 100;",
            "}",
            "a {",
                "color: #2ecc71;",
                "font-weight: normal",
            "}",
            "#modal > img {",
                "margin-top: 32px;",
                "margin-bottom: 32px;",
            "}",
            "#modal > p {",
                "max-width: 480px;",
                "margin: 0 auto;",
                "padding: 4px 8px;",
                "font-size: 18px;",
                "line-height: 1.5em;",
                "color: #aaa;",
            "}",
            "canvas, #infoButton, #hpBar, #points, #pointsText, #modal > img {",
                "-webkit-transform: translateZ(0);",
            "}",
            "@media all and (max-width: 640px) {",
            "   #modal {",
            "       padding: 0 !important;",
            "   }",
            "   #modal > img {",
            "       margin-top: 16px;",
            "       margin-bottom: 16px",
            "   }",
            "   #modal > p {",
            "       font-size: 12px;",
            "   }",
            "}"
        ].join('\n');
        
        var style = document.createElement('style');
        style.innerHTML = css;
        document.querySelector('head').appendChild(style);
    };
    return Font;
});