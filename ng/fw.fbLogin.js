fw.fbLogin = function () {

    FB.login(function (response) {

        response.authResponse && fw.send({

            "api": "core",
            "request": "fb-auth",
            "fb-access-token": FB.getAccessToken()

        }, function (response) {

            console.log(response);

        }, function (error) {

        });

    }, { scope: 'email' });

}