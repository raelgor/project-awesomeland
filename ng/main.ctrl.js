app.controller('main', ["$scope", "$window", "$http", "$timeout", function ($scope, $window, $http, $timeout) {

    var preload = [
        { src: "/images/logo.png", update: "#logo-box" },
        { src: "/images/buttons/fb.png", update: "#fblogin, #fbregister" },
        { src: "/images/buttons/googleplay.png", update: "#google" },
        { src: "/images/buttons/appstore.png", update: "#appstore" }
    ];

    preload.forEach(function (loadData) {

        var img = new Image();

        img.src = loadData.src;

        img.onload = function () {
            $(loadData.update).removeClass('unborn');
        }

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
                "request": "fb-auth",
                "fb-access-token": response.authResponse.accessToken

            }, function (response) {

                console.log(response);

            }, function (error) {

            });

        });

        $('#fblogin, #fbregister').removeClass('disabled');

    };

    $scope.fw = fw;

}]);