var psilos = {
    ipsos: 190,
    poutsa: 190,
    greet: function () { return 'hi' },
    log: function (message) {
        $('#p-output').append('<div>' + message + '</div>');
    },
    send: function () {

        var data = {
            value: $('#p-input').val()
        };

        function callback(response) {

            psilos.log(response);

        }

        $.post('http://swiftfinger.com/api', data, callback);

    },

    findImage: function () {

        $('#p-output').html('');

        var id = String(Math.random()).split('.')[1],
            path = "/assets/images/buildings/" + $('#p-input').val() + '.png',
            html = '<img id="' + id + '" src="' + path + '" />';

        psilos.log(html);

        function callback() {

            $('#' + id).remove();
            psilos.log("404 not found");

        }

        $('#' + id).error(callback);

    }
}

$('#p-send').click(psilos.findImage);

//-----------------------------------------------------------------------------------------
var swordsman = {

    attack: 3,
    health: 8,
    maxHealth: 8,
    defense: 1,
    speed: 5,
    stack: 10,
    name: "Swordsman"

}

var barbarian = {

    attack: 2,
    health: 10,
    maxHealth: 10,
    defense: 1,
    speed: 10,
    stack: 15,
    name: "Barbarian"

}

function strengthen(unit) {

    unit.attack += 2;
    unit.health += 2;
    unit.defense += 2;

}

function battle(attacker, defender) {

    var attDead, defDead;
    var attStackSizeBefore = attacker.stack;
    var defStackSizeBefore = defender.stack;

    var attMultiplier = attacker.speed > defender.speed ? 1.1 : 1;
    var defMultiplier = defender.speed > attacker.speed ? 1.1 : 1;
    var attDamage = calcDamage(attacker.attack, defender.defense, attMultiplier) * attacker.stack;
    var defDamage = calcDamage(defender.attack, attacker.defense, defMultiplier) * defender.stack;

    var attStackHealth = attacker.maxHealth * (attacker.stack - 1) + attacker.health;
    var defStackHealth = defender.maxHealth * (defender.stack - 1) + defender.health;

    attStackHealth -= defDamage;
    defStackHealth -= attDamage;

    attacker.stack = Math.floor(attStackHealth / attacker.maxHealth) + (attStackHealth % attacker.maxHealth ? 1 : 0);
    defender.stack = Math.floor(defStackHealth / defender.maxHealth) + (defStackHealth % defender.maxHealth ? 1 : 0);

    attDead = attStackSizeBefore - attacker.stack;
    defDead = defStackSizeBefore - defender.stack;

    attacker.health = (attStackHealth % attacker.maxHealth) || attacker.maxHealth;
    defender.health = (defStackHealth % defender.maxHealth) || defender.maxHealth;

    console.log(attacker.name + " attacks " + defender.name + ".");
    console.log(attacker.name + " dealt " + attDamage + " damage to " + defender.name + ". " + defender.health + "/" + defender.maxHealth + " health left. " + defDead + " " + defender.name + "(s) died. " + defender.stack + " " + defender.name + "(s) remaining.");
    console.log(defender.name + " dealt " + defDamage + " damage to " + attacker.name + ". " + attacker.health + "/" + attacker.maxHealth + " health left. " + attDead + " " + attacker.name + "(s) died. " + attacker.stack + " " + attacker.name + "(s) remaining.");

}

function calcDamage(attack, defense, multiplier) {

    var damage = attack * multiplier - defense;

    damage = Math.round(damage);

    return damage;

}

