fw.logout = function () {

    // Close GUI if exists
    $('.gui').addClass('out');

    fw.send({
        "api": "core",
        "request": "logout"
    });

    // Reset side-box state
    $('#side-box > *').toggleClass('out');

}
