var fw = {},
    app = angular.module('app', []);

app.controller('main', ["$http", function ($http) {

    fw.send = function () {

        $http.post('/api', {api:"core",request:"login",username:"raelgor"}).success( function (r) { console.log(r); })

    };

}]);