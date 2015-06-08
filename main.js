var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    server = express(),
    jade = require('jade'),
    package = require('./package.json'),
    bouncer = require('http-bouncer'),
    compression = require('compression'),
    ws = require('ws'),
    _ = require('lodash'),
    wsClients = [],
    shortid = require('shortid'),
    api = {},
    httpServer = false;

// Add bouncing rules
bouncer.config.JSON_API_CALLS.push({
    MATCH: {
        api: "core",
        request: "login"
    },
    INTERVAL: 10000,
    LIMIT: 10,
    INCLUDE_IP: true,
    INCLUDE_FROM_MATCH: ["username"]
});

// Limiting request size (general upload size)
server.use(bodyParser.raw({
    limit: '5mb'
}));

// Bounce by IP if request is of valid size
server.use('*', function (req, res, next) {
    bouncer({
        connection: {
            remoteAddress: req.connection.remoteAddress
        }
    }, res, next);
});

// Parse json api requests
server.use(bodyParser.json({
    extended: true
}));

// Use compression on all requests
server.use(compression({ filter: function () { return true; } }));
server.disable('x-powered-by');

// Add server stamp globally
server.use('*', function (req, res, next) {
    res.setHeader('Server', 'ZenX/' + package.version);
    return next();
});

// Get app
server.get('/', function (req, res, next) {

    // Cache
    res.setHeader("Cache-Control", "public,max-age=31104000");

    var fn = jade.compileFile(__dirname + '/index.jade');

    res.send(fn({
        version: package.version
    }));

});

// Handle API calls
server.post('/api', function (req, res, next) {
    
    res.send('ti leei1' + req.body.value);

});

// Cache if proceeding to static content
server.use(function (req, res, next) {

    // Cache
    res.setHeader("Cache-Control", "public,max-age=31104000");
    return next();

});

// Directly access static content
server.use(express.static(__dirname + '/assets/'));

// Custom 404
server.get('*', function (req, res, next) {

    res.writeHead(404, 'Not found');
    res.end('404: "It will be there, but it will be as if it isn\'t." - Father Paisios about this page.');

});

// Bind to port and start
httpServer = http.createServer(server).listen(81, '10.240.203.106');

// Immortalize process
process.on('uncaughtException', function (err) {
    console.log(err);
});

// Start and bind websocket server
global.wss = new ws.Server({
    server: httpServer,
    headers: {
        server: 'ZenX/' + package.version
    }
});

// Start listening for websocket connections
global.wss.on('connection', function (socket) {

    if (!bouncer({
        connection: {
        remoteAddress: socket.upgradeReq.client.remoteAddress
    }
    })) return socket.close();

    // Save the new socket
    wsClients.push(socket);

    // Handle messages
    socket.on('message', function (data, flags) {

        try {

            var message = JSON.parse(data);

            if (!bouncer({
                connection: {
                remoteAddress: socket.upgradeReq.client.remoteAddress
            },
                body: message
            }, false, false, true)) return socket.send('{"message":"bad_request_bounced"}');

            if (socket.ZenXAuth || (message.api == "core" && message.request == "ws-auth")) {

                var reqApi = api[message.api][message.request];

                reqApi(message, db, data, socket, {
                    _id: socket.ZenXUser
                });

            }

        } catch (x) { socket.send('{"message":"bad_request"}'); }

    });

    // Remove from memory if closed
    socket.on('close', function () {
        clearTimeout(socket.expiresTimeout);
        _.remove(wsClients, socket);
    });

    // Kill socket if not authenticated within time limit
    socket.expiresTimeout = setTimeout(function () {
        if (!socket.ZenXAuth) socket.close();
    }, 7000);

});