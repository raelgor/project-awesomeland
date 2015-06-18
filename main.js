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
    wsClients = global.wsClients = [],
    path = require('path'),
    lang = global.lang = {},
    shortid = require('shortid'),
    api = {},
    FB = global.FB = require('fb'),
    httpServer = false,
    GameEngine = null,
    helmet = require('helmet'),
    cookieParser = require('cookie-parser');

var nodegc = require('node-gc');

nodegc.on('scavenge', function (info) {
    console.log('scavenge');
    console.log(info);
});
nodegc.on('marksweep', function (info) {
    console.log('marksweep');
    console.log(info);
});

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

    server.post('/api', function (req, res, next) {

        if (!(req.headers['x-csrf-token'] in GameEngine.auth.sessions)) return res.end('invalid-csrf');
        next();

    });

    // Parse json api requests
    server.use(bodyParser.json({
        extended: true
    }));

    // Place bouncer for JSON API only
    server.use('*', function (req, res, next) { bouncer(req, res, next, true); });

    // Add server stamp globally
    server.use('*', function (req, res, next) {
        res.setHeader('Server', 'ZenX/' + package.version);
        res.setHeader('Connection', 'Keep-Alive');
        res.setHeader('Keep-Alive', 'timeout=15, max=100');
        return next();
    });

    server.use(helmet.xssFilter());
    server.use(cookieParser());

    // Use compression on all requests
    server.use(compression({ filter: function () { return true; } }));
    server.disable('x-powered-by');
    
    // Handle API calls
    server.post('/api', function (req, res, next) {

        try {

            var reqApi = api[req.body.api][req.body.request];
            if (reqApi.auth && !reqApi.ws) {

                db.collection('Users').find({
                    tokens: { $elemMatch: { token: String(req.cookies.authtoken) } }
                }, { _id: 1 }).toArray(function (err, user) {

                    if (err) return res.send('{"message":"bad_request","error_code":"1"}');

                    reqApi(req.body, db, req, res, user[0]);

                });

            } else if (!reqApi.ws) reqApi(req.body, db, req, res);
            else res.send('{"message":"bad_request","error_code":"2"}');

        } catch (x) { res.send('{"message":"bad_request","error_code":"3"}'); }

    });

    server.use('/me', function (req, res, next) {

        res.setHeader("Cache-Control", "public,max-age=31104000");

        var fn = jade.compileFile(__dirname + '/me.jade');

        res.send(fn({}));

    });

    server.use('/game', function (req, res, next) {

        res.setHeader("Cache-Control", "public,max-age=31104000");

        var fn = jade.compileFile(__dirname + '/game.jade');

        res.send(fn({}));

    });

    // Get app
    server.use('/', function (req, res, next) {

        if (req.path != "/") return next();

        // The sole initial provider of a csrf token should not be cached
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Security-Policy", "default-src 'self' kingdomsoftheshatteredlands.com;script-src 'unsafe-inline' kingdomsoftheshatteredlands.com ajax.googleapis.com crypto-js.googlecode.com connect.facebook.net;object-src kingdomsoftheshatteredlands.com;img-src *.akamaihd.net graph.facebook.com www.facebook.com kingdomsoftheshatteredlands.com www.paypalobjects.com;media-src kingdomsoftheshatteredlands.com;frame-src kingdomsoftheshatteredlands.com *.facebook.com;font-src kingdomsoftheshatteredlands.com fonts.gstatic.com;connect-src wss://kingdomsoftheshatteredlands.com kingdomsoftheshatteredlands.com;style-src 'unsafe-inline' kingdomsoftheshatteredlands.com ajax.googleapis.com fonts.googleapis.com; frame-ancestors apps.facebook.com");

        var fn = jade.compileFile(__dirname + '/index.jade');

        res.send(fn({
            version: package.version,
            text: lang.en.site,
            csrf: GameEngine.auth.newSession()
        }));

    });

    // Cache if proceeding to static content
    server.get('*', function (req, res, next) {

        // Cache
        res.setHeader("Cache-Control", "public,max-age=31104000");
        return next();

    });

    // Directly access static content
    server.get('*', express.static(__dirname + '/assets/'));

    // Custom 404
    server.use('*', function (req, res, next) {

        res.writeHead(404, 'Not found');
        res.end('404: "It will be there, but it will be as if it isn\'t." - Father Paisios about this page.');

    });

    // Bind to port and start
    httpServer = http.createServer(server).listen(81, '10.240.203.106');

    httpServer.on('connection', function (socket) {
        socket.setTimeout(15 * 1000);
    });

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

        var token;

        if (!bouncer({
            connection: {
            remoteAddress: socket.upgradeReq.client.remoteAddress
        }
        })) return socket.close();

        token = socket.upgradeReq.headers.cookie.split('authtoken=')[1].split(';')[0];

        if (!token) return socket.close();

        // Find user
        db.collection('Users').find({
            tokens: {
                $elemMatch: {
                    token: String(token),
                    expires: { $gt: new Date().getTime() }
                }
            }
        }).toArray(function (err, users) {

            var user = users[0];

            // If found, return data
            if (user) initSocket(user); else {

                socket.send('{"message":"bad_request"}');
                socket.close();

            }

        });

        function initSocket(user) {

            socket.user = user;

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

                    var reqApi = api[message.api][message.request];

                    if (reqApi.admin && user.admin != "1") throw "admin_permission_required";

                    reqApi.ws && reqApi(message, db, data, socket, {
                        _id: socket.user._id
                    });

                } catch (x) {
                    socket.send('{"message":"bad_request", "err": "' + String(x) + '"}');
                }

            });

            // Remove from memory if closed
            socket.on('close', function () {
                _.remove(wsClients, socket);
            });

        }

    });

}