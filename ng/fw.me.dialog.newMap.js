fw.me.dialog.newMap = function () {

    // Create HTML tag
    var element = $('<div>');

    // Add classes etc.
    element.addClass('new-map-wrapper');

    // Fill with HTML
    element.append('<input id="new-map-name" type="text"/>');
    element.append('<input id="create-new-map" type="button" value="Create"/>');

    fw.createWindow({
        title: "New map",
        content: element
    });

}