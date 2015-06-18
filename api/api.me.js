// ZenX Core API
// These are core methods used by the ZenX Manager client.
var shortid = require('shortid'),
    path = require('path'),
    jade = global.jade,
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
        
    },

    "load-map": function (data, db, req, socket) {

        fs.readFile(path.resolve(__dirname + '/../maps/' + data.file), function (err, file) {

            socket.send(JSON.stringify({
                "requestID": data.requestID,
                "mapData": String(file)
            }));

        });

    },

    "create-map": function (data, db, req, socket) {

        var mapskel = require(path.resolve(__dirname + '/../mapskel.json')),
            mapFile = mapskel;

        if (data.file) {

            fs.readFile(path.resolve(__dirname + '/../maps/' + data.file), function (err, file) {

                mapFile = JSON.parse(String(file));
                mapFile.name = data.name;

                save(mapFile);

                socket.send(JSON.stringify({
                    "requestID": data.requestID,
                    "mapData": JSON.strigify(mapFile)
                }));

            });

        } else {

            mapFile.name = data.name;
            mapFile.map.x = data.x;
            mapFile.map.y = data.y;

            save(mapFile);

            socket.send(JSON.stringify({
                "requestID": data.requestID,
                "mapData": JSON.stringify(mapFile)
            }));

        }

        function save(jsonObj) {

            fs.writeFile(path.resolve(__dirname + '/../maps/' + jsonObj.name + '.kotsl'), JSON.stringify(jsonObj));

        }

    }

}

// Set auth flag to declare that only authenticated users can have access
// to this method
Object.keys(module.exports).forEach(function (request) {
    module.exports[request].auth = true;
    module.exports[request].ws = true;
    module.exports[request].admin = true;
});
