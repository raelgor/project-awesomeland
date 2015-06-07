var psilos = {
    ipsos: 190,
    poutsa: 190,
    greet: function () { return 'hi' },
    log: function (message) {
        $('#p-output').append('<div>' + message + '</div>');
    },
    send: function () {

        var data = {
            value: $('#p-input').val()
        };

        function callback(response) {

            psilos.log(response);

        }

        $.post('http://swiftfinger.com/api', data, callback);

    },

    findImage: function () {

        $('#p-output').html('');

        var id = String(Math.random()).split('.')[1],
            path = "/assets/images/buildings/" + $('#p-input').val() + '.png',
            html = '<img id="' + id + '" src="' + path + '" />';

        psilos.log(html);

        function callback() {

            $('#' + id).remove();
            psilos.log("404 not found");

        }

        $('#' + id).error(callback);

    }
}

$('#p-send').click(psilos.findImage);
