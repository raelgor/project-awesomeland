fw.logout = function () {

    // Close GUI if exists
    $('.gui').addClass('out');

    // Destroy token
    delete window.session_token;
    localStorage.removeItem('session_token');

    // Reset side-box state
    $('#side-box > *').toggleClass('out');


}
