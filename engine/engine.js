/*
// Game engine class
var ShatteredEngine = SE = function () {

    // The engines state STARTING|RUNNING|STOPPING|STOPPED
    this.state = 'STARTING';

    // Game connections stored in the object
    this.connections = [];

    // Timeouts split by category
    this.timeouts = {}

    // Data will be stored here as loaded from the database
    window.rawMapInfo = {

        units: {

            'archer': {},
            'zealot': {}

        }

    };
    window.rawMapData = null;

    // State event subscribers will be stored here
    this.onEngineStateChange = [];

}

// The battle factory object
SE.prototype.battle = {}

// The combat object
SE.prototype.battle.Combat = function (state) {

    // Contains the combat state
    this.state = state;

    // Contains combat result info
    this.result = {}

}

// A combatant object that can describe a hero, city etc.
SE.prototype.battle.Combatant = function (options) {

    this.slots = options.slots;
    this.companion = options.companion;

}

// Gets combat necessary variables from the companion of the army
SE.prototype.battle.ArmyCompanion = function (companion) {

    // .getCombatStats()
    companion;

}

// The battle factory object
SE.prototype.units = {}

// Stack constructor
SE.prototype.units.Stack = function (unitID, stackInfo) {

    return {
        stats: window.rawMapData.units[unitID],
        stack: stackInfo.stack,
        level: stackInfo.level,
        buffs: []
    }

}

// Combat necessary flags
SE.prototype.battle.Flags = function (flags) {

    this.SEASON = flags.SEASON || 1;

}

// Start the engine
var Game = new ShatteredEngine();

var archers = new Game.units.Stack('archer', {

    level: 2,
    stack: 18

});

var zealots = new Game.units.Stack('zealots', {
    
    level: 3,
    stack: 10

});

var attackers = [];
var defender = new Game.battle.Combatant({

    slots: [archers],
    companion: new Game.battle.ArmyCompanion({})

});

attackers.push(new Game.battle.Combatant({

    slots: [zealots],
    companion: new Game.battle.ArmyCompanion({})

}));

var battle = new Game.battle.Combat({

    attackers: attackers,
    defender: defender,
    flags: new Game.battle.Flags({
        SEASON: 1
    })

});
*/

function GameEngine(db) {

    var classScope = this;

    this.availableServersCached = [];

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

}

module.exports = GameEngine;