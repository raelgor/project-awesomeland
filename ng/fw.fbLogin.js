fw.fbLogin = function () {

    FB.login(function (response) {

        response.authResponse && fw.send({

            "api": "core",
            "request": "fb-auth",
            "fb-access-token": FB.getAccessToken()

        }, function (response) {

            response.status == "success" && fw.initUILogin(response.userData);

        }, function (error) {

        });

    }, { scope: 'email' });

}