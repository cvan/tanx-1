# tanx

tanx multiplayer WebGL game

[__online demo__](http://playcanv.as/p/aP0oxhUr "tanx game")


## installation & running

1. Install the Node dependencies:

        npm install

2. Run the server:

        npm start

    Or:

        node app.js

    WebSocket and HTTP servers will be started on port `30043` by default. You can change the port or host via environment variables:

    * `TANX_PORT=30043`
    * `TANX_HOST='0.0.0.0'`

## usage

1. Fork the [tanx client](https://playcanvas.com/project/45093/overview/tanx) project.
2. From your fork's page, click the __Code__ nav link to open `client.js` in the PlayCanvas code editor (you should be at `https://playcanvas.com/editor/code/<id-of-your-fork>/client.js`).
3. Find the line that reads `var socket = … = new Socket` and change the `url` like so:

        http://localhost:30043/socket

4. Play your fork!
