app.controller('main', ["$scope", "$http", "$timeout", function ($scope, $window, $http, $timeout) {

    $('#logout-button').click(function () { $(this).toggleClass('on') });

    $(window).click(fw.click);

    $scope.gui = {
        gameTemplate: ''
    };

    $scope.playNow = function () {

        $scope.gui.gameTemplate = '/game';

    }

    // Keep session valid
    setInterval(function () {
        fw.send({
            api: "core",
            request: "refresh-session"
        }).success(function (r) {
            fw.csrf = r.session_token;
        });
    }, 50 * 1000);

    // Preload images
    var preload = [
        { src: "/images/logo-beta.png", update: "#logo-box" },
        { src: "/images/buttons/fb.png", update: "#fblogin, #fbregister" },
        { src: "/images/buttons/googleplay.png", update: "#google" },
        { src: "/images/buttons/appstore.png", update: "#appstore" },
        { src: "/images/bigboard.png", update: "#main-box" },
        { src: "/images/bg.jpg", update: "#viewport" },
        { src: "/images/board.png", update: "#side-box" }
    ];

    preload.forEach(function (loadData) {

        var img = new Image();

        img.src = loadData.src;

        img.onload = handler;

        // Images will show even if loading was unsuccessful
        img.onerror = handler;

        function handler() { $(loadData.update).removeClass('unborn');  }

    });

    $('#fblogin, #fbregister').addClass('disabled');

    $scope.fw = fw;

}]);