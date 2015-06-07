var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    server = express(),
    jade = require('jade'),
    package = require('./package.json'),
    bouncer = require('http-bouncer'),
    compression = require('compression');

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
    limit: '5m'
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
server.use(compression());
server.disable('x-powered-by');

// Add server stamp globally
server.use('*', function (req, res, next) {
    res.setHeader('Server', 'ZenX/' + package.version);
    return next();
});

// Get app
server.get('/', function (req, res, next) {

    // Cache
    res.setHeader("Cache-Control", "max-age=31104000");

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

    res.setHeader("Cache-Control", "max-age=31104000");
    return next();

});

// Directly access static content
server.use(express.static(__dirname + '/assets/'));

// Bind to port and start
http.createServer(server).listen(81, '10.240.203.106');

// Immortalize process
process.on('uncaughtException', function (err) {
    console.log(err);
});