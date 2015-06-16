var shortid = require('shortid');

function GameEngine(db) {

    var classScope = this;

    this.availableServersCached = [];

    this.uuid = function () {
        return function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b) }();
    }

    this.getAvailableServers = function (callback) {

        db.collection('Games').find({ "public": "1" }).toArray(function (err, result) {

            classScope.availableServersCached = result;
            callback && callback(err, result);

        });

    }

    this.getAvailableServersSync = function () {
        return classScope.availableServersCached;
    }

    this.timers = {};

    this.timers.runtimeIntervals = [];

    this.timers.runtimeIntervals.push(setInterval(this.getAvailableServers, 1000 * 60 * 60 * 1));

    this.getAvailableServers();

    this.auth = {

        sessions: []

    }

    this.auth.newSession = function () {

        var token = classScope.uuid();

        classScope.auth.sessions[token] = 1;

        setTimeout(function () {

            delete classScope.auth.sessions[token];

        }, 1000 * 60);

        return token;

    }

}

module.exports = GameEngine;