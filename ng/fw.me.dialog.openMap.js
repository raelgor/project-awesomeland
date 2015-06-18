fw.me.dialog.openMap = function () {

    var windowContent = $('<div>');
    var filename;
    windowContent.addClass('map-list-wrapper');
    windowContent.append('<div class="pool"></div>');
    
    fw.createWindow({
        title: "Open Map",
        content: windowContent
    });

    fw.send({ api: "me", request: "avail-maps" }, true).success(function (response) {

        windowContent.find('a').remove();

        response.files.forEach(function (file) {

            windowContent.find('.pool').append("<div>" + file + "</div>");

        });

        windowContent.find('.pool').append('<input id="search" type"text"/>');
        windowContent.append('<input id="search-map" type="button" value="Search"/>');
        windowContent.append('<input id="open-map" type="button" value="Open"/>');

        windowContent.find('.pool > div').click(function (e) {

            filename = $(e.target).html();

        });

        windowContent.find('#open-map').click(function () {

            fw.send({ api: "me", request: "load-map", file: filename }, true).success(function (response) {

                fw.loadMap(response.mapData);

            });

        });

    });
    
};