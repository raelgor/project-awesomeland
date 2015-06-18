fw.me.dialog.newMap = function () {

    // Create HTML tag
    var element = $('<div>');

    // Add classes etc.
    element.addClass('new-map-wrapper');

    // Fill with HTML
    element.append('<div class="map-name">New map name:</div>');
    element.append('<input id="new-map-name" type="text"/>');
    element.append('<div class="x">x:</div>');
    element.append('<input id="new-map-x" type="text"/>');
    element.append('<div class="y">  /  y:</div>');
    element.append('<input id="new-map-y" type="text"/>');
    element.append('<input id="create-new-map" type="button" value="Create Map"/>');

    fw.createWindow({
        title: "New map",
        content: element
    });

}