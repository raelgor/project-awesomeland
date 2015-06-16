app.controller('main', ["$scope", "$window", "$http", "$timeout", function ($scope, $window, $http, $timeout) {

    if (localStorage.getItem('session_token')) $('#side-box > *').addClass('disabled');

    $('#logout-button').click(function () { $(this).toggleClass('on') });

    $(window).click(fw.click);

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

    $window.fbAsyncInit = function () {

        FB.init({

            appId: '447178132134523',
            status: true,
            cookies: true,
            xfbml: true,
            version: 'v2.3'

        });

        FB.getLoginStatus(function (response) {

            fw.send({
                "api": "core",
                "request": "auth-token"
            }, function (response) {

                $('#side-box > *').removeClass('disabled');
                response.status == "success" && fw.initUILogin(response.userData);

            }, function () { });

        });

    };

    $scope.fw = fw;

}]);