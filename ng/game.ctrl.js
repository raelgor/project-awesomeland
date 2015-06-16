app.controller('game', ['$scope', function ($scope) {

    setTimeout(function () {
        $('.gui').removeClass('unborn');
    }, 100);

    var bgMusic = new Audio();

    bgMusic.src = '/audio/heaven-ish.ogg';
    bgMusic.play();

}]);