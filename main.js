var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    server = express(),
    jade = require('jade'),
    package = require('./package.json');

server.use(bodyParser());

server.get('/', function (req, res, next) {

    var fn = jade.compileFile(__dirname + '/index.jade');

    res.send(fn({
        version: package.version
    }));

    // res.sendFile(__dirname + '/index.html');

});

server.post('/api', function (req, res, next) {
    
    res.send('ti leei1' + req.body.value);

});

server.use(express.static(__dirname + '/'));

http.createServer(server).listen(81, '10.240.203.106');