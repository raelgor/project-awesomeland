var fw = {},
    app = angular.module('app', []);

app.run(['$http', function ($http) {

    fw.send = function (data, successCallback, errorCallback) {

        $http.post('/api', data).success(successCallback).error(errorCallback);

    }

}]);

app.controller('main', ["$http", function ($http) {


}]);