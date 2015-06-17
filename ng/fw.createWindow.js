fw.createWindow = function (options) {

    var win = $('<div>');
    win.html('<div class="window-x">x</div>');
    win.addClass("fw-window");
    win.append(options.content);
    $('body').append(win);

}