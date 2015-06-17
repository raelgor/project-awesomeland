var fw = {},
    app = angular.module('app', []);

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function () {

    FB.init({

        appId: '447178132134523',
        status: true,
        cookies: true,
        xfbml: true,
        version: 'v2.3'

    });

    FB.getLoginStatus(function (response) {

        window.p = fw.send({
            "api": "core",
            "request": "auth-token"
        }).success(function (response) {

            $('#side-box > *').removeClass('disabled');
            response.status == "success" && fw.initUILogin(response.userData);

        }).error(function (err) { console.log(err); });

    });

};