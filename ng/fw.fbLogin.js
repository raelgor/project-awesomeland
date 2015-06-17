fw.fbLogin = function () {

    FB.login(function (response) {

        response.authResponse && fw.send({

            "api": "core",
            "request": "fb-auth",
            "fb-access-token": FB.getAccessToken()

        }).success(function (response) {

            response.status == "success" && fw.initUILogin(response.userData);

        }).error(function (err) { console.log(err); });;

    }, { scope: 'email' });

}