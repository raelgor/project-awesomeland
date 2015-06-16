app.controller('game', ['$scope', function ($scope) {

    var audio = [
        '/audio/heaven-ish.ogg',
        '/audio/ambient-1.ogg',
        '/audio/mystery.ogg',
        '/audio/zone_theme.ogg'
    ], _audio = {};

    setTimeout(function () { $('.gui').removeClass('unborn'); }, 100);

    audio.forEach(function (path) {

        var key = path.split('/').pop().split('.')[0],
            audio = new Audio();

        audio.src = path;

        audio.onended = function () {

            var next = Object.keys(_audio)[Object.keys(_audio).indexOf(key) + 1];
            _audio[next].play();

        }

        _audio[key] = audio;

    });

    audio = _audio;

    audio[Object.keys(audio)[0]].play();

    fw.connectWebSocket();

}]);