fw.logout = function () {

    // Close GUI if exists
    $('.gui').addClass('out');

    fw.send({
        "api": "core",
        "request": "logout",
        "token": window.session_token
    });

    // Destroy token
    delete window.session_token;
    localStorage.removeItem('session_token');

    // Reset side-box state
    $('#side-box > *').toggleClass('out');

}
