fw.initUILogin = function (userData) {

    localStorage.setItem('session_token', userData.token);

    window.session_token = userData.token;

    $("#side-box > *").toggleClass("out");

    $("#player-name").html(userData.first_name + " " + userData.last_name);

    var picturePath = "https://graph.facebook.com/" + userData.fbid + "/picture";
    $("#fbpic").css("background-image","url(" + picturePath + ")");

    $("#nickname").html(userData.nickname);



    console.log(userData);

}

