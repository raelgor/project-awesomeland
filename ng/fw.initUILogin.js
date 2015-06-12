fw.initUILogin = function (userData) {

    localStorage.setItem('session_token', userData.token);

    window.session_token = userData.token;



    console.log(userData);

}