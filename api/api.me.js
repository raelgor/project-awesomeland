// ZenX Core API
// These are core methods used by the ZenX Manager client.
var shortid = require('shortid'),
    path = require('path'),
    jade = global.jade,
    reqAuth = [
        "avail-maps"
    ],
    reqWs = [
        "avail-maps"
    ],
    jadeTemplates = {},
    fs = require('fs'),
    FB = global.FB,
    GameEngine = global.GameEngine;

module.exports = {

    "avail-maps": function (data, db, req, socket) {

        fs.readdir(path.resolve(__dirname + '/../maps'), function (err, files) {
    
            socket.send(JSON.stringify({
                "files": files,
                "requestID": data.requestID
            }));

        });
        
    }

}

// Set auth flag to declare that only authenticated users can have access
// to this method
reqAuth.forEach(function (request) {
    module.exports[request].auth = true;
});

reqWs.forEach(function (request) {
    module.exports[request].ws = true;
});