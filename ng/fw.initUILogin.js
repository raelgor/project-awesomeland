fw.initUILogin = function (userData) {

    // Save the token we just received or verified
    localStorage.setItem('session_token', userData.token);
    window.session_token = userData.token;

    // Toggle side-box to logged in state
    $("#side-box > *").toggleClass("out");
    $("#player-name").html(userData.first_name + " " + userData.last_name);

    var picturePath = "https://graph.facebook.com/" + userData.fbid + "/picture";
    var profilePicPreloader = new Image();

    profilePicPreloader.src = picturePath;
    profilePicPreloader.onload = handler;
    profilePicPreloader.onerror = handler;

    function handler() { $('#fbpic').removeClass('unborn'); }

    $("#fbpic").css("background-image", "url(" + picturePath + ")");

    $("#nickname").html(userData.nickname);


    // Log user data
    console.log(userData);

}

