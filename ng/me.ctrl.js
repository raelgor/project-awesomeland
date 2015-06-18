app.controller('me', ['$scope', function ($scope) {

    setTimeout(function () { $('.gui').removeClass('unborn'); }, 100);
   
    fw.connectWebSocket();

    $scope.newMap = fw.me.dialog.newMap;

    $scope.openMap = function () {

        var windowContent = $('<div>');
        windowContent.html("<a>Loading...</a>");

        fw.createWindow({
            content: windowContent
        });

        fw.send({ api: "me", request: "avail-maps" }, true).success(function (response) {

            windowContent.find('a').remove();

            response.files.forEach(function (file) {

                windowContent.append("<div>" + file + "</div>");

            });

        });

    }



}]);

