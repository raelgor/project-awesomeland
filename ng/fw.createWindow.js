fw.createWindow = function (options) {

    var win = $('<div>');
    win.html('<div class="window-x">x</div>');
    $('.fw-window').remove();
    win.addClass("fw-window");
    win.append(options.content);
    $('body').append(win);
   

}