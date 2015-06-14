var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    server = express(),
    jade = global.jade = require('jade'),
    package = require('./package.json'),
    bouncer = require('http-bouncer'),
    compression = require('compression'),
    ws = require('ws'),
    fs = require('fs'),
    mongodb = require('mongodb').MongoClient,
    _ = require('lodash'),
    prompt = require('prompt'),
    wsClients = [],
    path = require('path'),
    lang = global.lang = {},
    shortid = require('shortid'),
    api = {},
    FB = global.FB = require('fb'),
    httpServer = false,
    GameEngine = null;


bouncer.config.GLOBAL_IP_CHECK_INTERVAL = 10000;
bouncer.config.GLOBAL_IP_PER_INTERVAL = 100;

mongodb.connect('mongodb://10.240.203.106:27017/kotsl-system', init);

fs.readdirSync(path.resolve(__dirname + '/lang')).toString().split(',').forEach(function (f) {
    lang[f.split('.')[0]] = require('./lang/' + f);
});

function init(err, db) {

    var GE = require('./engine/engine.js');

    GameEngine = global.GameEngine = new GE(db);

    global.db = db;

    fs.readdirSync(path.resolve(__dirname + '/api')).toString().split(',').forEach(function (module) {

        api[module.split('api.')[1].split('.')[0]] = require(path.resolve(__dirname + '/api/' + module));

    });

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

    // Debugger CLI
    prompt.start();
    prompt.message = "";
    prompt.delimiter = "";

    (function contPrompt() {
        prompt.get([{ name: "code", message: " " }], function (err, result) {
            try { console.log(eval(result.code)); } catch (x) { console.log(x); }
            result.code != "^C" && contPrompt();
        });
        console.log('..\n');
    })();

    // Limiting request size (general upload size)
    server.use(bodyParser.raw({
        limit: '5mb'
    }));

    // Bounce by IP if request is of valid size
    server.use('*', function (req, res, next) {
        bouncer({
            connection: {
                remoteAddress: req.headers['x-forwarded-for']
            }
        }, res, next);
    });

    // Parse json api requests
    server.use(bodyParser.json({
        extended: true
    }));

    // Place bouncer for JSON API only
    server.use('*', function (req, res, next) { bouncer(req, res, next, true); });

    // Use compression on all requests
    server.use(compression({ filter: function () { return true; } }));
    server.disable('x-powered-by');

    // Add server stamp globally
    server.use('*', function (req, res, next) {
        res.setHeader('Server', 'ZenX/' + package.version);
        return next();
    });

    // Handle API calls
    server.post('/api', function (req, res, next) {

        try {

            var reqApi = api[req.body.api][req.body.request];
            if (reqApi.auth && !reqApi.ws) {

                db.collection('Users').find({
                    tokens: { $elemMatch: { token: String(req.body.token) } }
                }, { _id: 1 }).toArray(function (err, user) {

                    if (err) return res.send('{"message":"bad_request"}');

                    reqApi(req.body, db, req, res, user[0]);

                });

            } else if (!reqApi.ws) reqApi(req.body, db, req, res);
            else res.send('{"message":"bad_request"}');

        } catch (x) { res.send('{"message":"bad_request"}'); }

    });

    // Get app
    server.use('/', function (req, res, next) {

        if (req.path != "/") return next();

        // Cache
        res.setHeader("Cache-Control", "public,max-age=31104000");

        var fn = jade.compileFile(__dirname + '/index.jade');

        res.send(fn({
            version: package.version,
            text: lang.en.site
        }));

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
    server.use('*', function (req, res, next) {

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

}