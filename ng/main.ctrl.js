app.controller('main', ["$scope", "$window", "$http", function ($scope, $window, $http) {

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