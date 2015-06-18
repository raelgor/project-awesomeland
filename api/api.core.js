// ZenX Core API
// These are core methods used by the ZenX Manager client.
var shortid = require('shortid'),
    path = require('path'),
    jade = global.jade,
    reqAuth = [
    ],
    reqWs = [
        "talk"
    ],
    jadeTemplates = {},
    fs = require('fs'),
    FB = global.FB,
    GameEngine = global.GameEngine;

module.exports = {

    "auth-token": function (data, db, req, res) {

        // Target database
        var Users = db.collection('Users');

        // Find user
        Users.find({
            tokens: {
                $elemMatch: {
                    token: String(req.cookies.authtoken),
                    expires: { $gt: new Date().getTime() }
                }
            }
        }).toArray(function (err, users) {

            var user = users[0];

            // If found, return data
            if (user) {

                res.cookie('authtoken', req.cookies.authtoken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
                res.send(JSON.stringify({

                    "status": "success",
                    "userData": {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        nickname: user.nickname,
                        fbid: user.fbdata.id,
                        servers: GameEngine.getAvailableServersSync(),
                        admin: user.admin
                        
                    }

                }));

                // Otherwise complain
            } else {

                res.clearCookie('authtoken');
                res.send('{"message":"bad_request"}');

            }
        });

    },

    "fb-auth": function (data, db, req, res) {
        
        var Users = db.collection('Users');

        // TODO: Test security
        FB.setAccessToken(req.body['fb-access-token']);

        FB.api('/me', function (response) {

            if (response.id) {

                Users.find({

                    "fbdata.id": response.id

                }).toArray(function (err, users) {

                    var user = users[0],
                        session_token = GameEngine.uuid();

                    if (user) {

                        // Clean expired or invalid tokens
                        Users.update({ _id: user._id }, {
                            $pull: {
                                tokens: {
                                    $or: [
                                        { expires: { $lte: new Date().getTime() } }
                                    ]
                                }
                            }
                        }, function () {

                            // If more than 10 tokens, delete until 10
                            Users.aggregate([
                                { $match: { _id: user._id } },
                                { $project: { count: { $size: "$tokens" } } }
                            ], function (err, data) {

                                var data = data[0];

                                if (data.count - 10 > 0) {

                                    for (var i = 0; i < data.count - 10; i++) {
                                        Users.update({ _id: user._id }, { $unset: JSON.parse('{"tokens.' + i + '":1}') });
                                    }

                                    Users.update({ _id: user._id }, { $pull: { tokens: null } });

                                }

                            });

                        });

                        // Push session token in document's tokens
                        Users.update({ _id: user._id }, { $push: { tokens: { token: session_token, expires: new Date().getTime() + 24 * 60 * 60 * 1000 } } });

                        res.cookie('authtoken', session_token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
                        res.send(JSON.stringify({

                            "status": "success",
                            "userData": {
                                first_name: user.first_name,
                                last_name: user.last_name,
                                nickname: user.nickname,
                                fbid: user.fbdata.id,
                                servers: GameEngine.getAvailableServersSync(),
                                admin: user.admin
                            }

                        }));

                    } else {

                        res.cookie('authtoken', session_token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
                        var uData = {
                            "first_name": String(response.first_name || "Anonymous"),
                            "last_name": String(response.last_name || ""),
                            "nickname": "",
                            "fbid": response.id,
                            "admin": "0",
                            servers: GameEngine.getAvailableServersSync()
                        }

                        Users.insert({

                            "first_name": uData.first_name,
                            "last_name": uData.last_name,
                            "nickname": "",
                            "fbdata": response,
                            "tokens": [
                                {
                                    "token": session_token,
                                    "expires": new Date().getTime() + 24 * 60 * 60 * 1000
                                }
                            ]

                        });

                        res.send(JSON.stringify({

                            "status": "success",
                            "userData": uData

                        }));

                    }

                });

            } else res.send('{"message":"bad_request"}');

        });
        
    },

    "logout": function (data, db, req, res) {

        var collection = db.collection('Users');

        if (!req.cookies.authtoken) return res.end();

        collection.update({ tokens: { $elemMatch: { token: req.cookies.authtoken } } }, {
            $pull: {
                tokens: {
                    token: String(req.cookies.authtoken)
                }
            }
        });

        global.wsClients.forEach(function (socket) {
            socket.token == req.cookies.authtoken && socket.close();
        });

        res.clearCookie('authtoken');
        res.end();

    },

    "refresh-session": function (data, db, req, res) {

        var token = GameEngine.auth.newSession();
        res.send('{"session_token":"' + token + '"}');

    },

    "talk": function (data, db, req, socket) {

        socket.send(JSON.stringify({
            "message": "sup",
            "requestID": data.requestID
        }));

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