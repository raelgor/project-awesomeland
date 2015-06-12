/* 
** SwiftBalancer 0.1.0
** Copyright (c) 2015 Kosmas Papadatos
** License: MIT
*/

// Dependencies
var https = require('https'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs'),
    express = require('express'),
    config = require('./config'),
    prompt = require('prompt'),
    index = 0;

var nodegc = require('node-gc');

nodegc.on('scavenge', function (info) {
    console.log('scavenge');
    console.log(info);
});
nodegc.on('marksweep', function (info) {
    console.log('marksweep');
    console.log(info);
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

var HttpServer = express();

// Configure servers
var servers = config.servers || [];

// Proxy server
var proxy = httpProxy.createProxyServer({ ws: true });

proxy.on('proxyReq', function (preq, req) {

    preq.setHeader('x-forwarded-for', req.connection.remoteAddress);

});

// Load splitter
function getProxyTarget() {
    if (++index > (servers.length - 1)) index = 0;
    return servers[index];
}

// Request handler
function requestHandler(req, res) {

    // Proxy the request unless ::hlb:: is in the
    // request URL. In that case return system info
    if (req.url.split('::hlb::').length > 1 && config.benchmark) {
        res.end(
            '[LB2]' +
            config.bind +
            '::' +
            process.pid +
            '::' +
            Math.floor(process.memoryUsage().rss / 1024 / 1024) + ' MB'
        );
    } else proxy.web(req, res, { target: 'http://' + getProxyTarget() });

}

// If SSL is on, start HTTPS server
if (config.https) {
    var HttpsServer = https.createServer({
        key: fs.readFileSync(config.https.key),
        cert: fs.readFileSync(config.https.crt),
	passphrase: config.https.passphrase
    }, requestHandler).listen(443, config.bind);
}

// Redirect to HTTPS
function redirect(req, res) {
    res.redirect(config.httpRedirectUrl + req.url);
}

HttpServer.get('*', config.httpRedirectUrl ? redirect : requestHandler);

HttpServer.listen(80, config.bind);

// Enable websocket support
if(config.ws){

    config.https && HttpsServer.on('upgrade', function (req, socket, head) {
        proxy.ws(req, socket, head, { target: 'ws://' + getProxyTarget() });
    });

    HttpServer.on('upgrade', function (req, socket, head) {
        proxy.ws(req, socket, head, { target: 'ws://' + getProxyTarget() });
    });

}

// Make the process immortal
if(config.unhangable){
    process.on('uncaughtException', function (err) {
        console.log(err);
    });
}

console.log('SwiftBalancer is up. PID: ', process.pid);