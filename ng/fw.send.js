app.run(['$http', function ($http) {

    fw.send = function (data, successCallback, errorCallback) {

        !successCallback && (successCallback = function () { });
        !errorCallback && (errorCallback = function () { });

        $http({
            method: 'post',
            url: '/api',
            headers: { 'x-csrf-token': fw.csrf },
            data: data
        }).success(successCallback).error(errorCallback);

    }

}]);
