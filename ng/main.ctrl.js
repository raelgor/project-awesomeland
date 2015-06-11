app.controller('main', ["$scope", "$window", "$http", function ($scope, $window, $http) {

    $window.fbAsyncInit = function () {

        FB.init({

            appId: '447178132134523',
            status: true,
            cookies: true,
            xfbml: true,
            version: 'v2.3'

        });

    };

    $scope.fw = fw;

}]);