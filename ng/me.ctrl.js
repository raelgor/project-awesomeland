﻿app.controller('me', ['$scope', function ($scope) {

   
    setTimeout(function () { $('.gui').removeClass('unborn'); }, 100);
   
    fw.connectWebSocket();

    $scope.newMap = function () {

        fw.createWindow({ content: "<a>Hi</a>" })

    }

}]);

