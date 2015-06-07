var lefteris = {
    ipsos: 170,
    greet: function () { return 'hi' },
    log: function (message) {
        $('#l-output').append('<div>' + message + '</div>');
    },
    send: function () {

        var data = {
            value: $('#l-input').val()

        };

        function callback(response) {

            lefteris.log(response);
        }

        $.post('http://swiftfinger.com/api', data, callback);
    },

    viewImage: function () {

        $('#l-output').html('');
        var data = {
            value: $('#l-input').val()

        };
        var id = String(Math.random()).split('.')[1],
            path = "/assets/images/items/" + data.value + ".png";
            img = '<img id="' + id + '"src="' + path + '" />';

       lefteris.log(img);

       function callback() {

           $('#' + id).remove();
           lefteris.log("404 not found");
       
       }

       $('#' + id).error(callback);

    }


}


  //$('#l-send').click(lefteris.send);
//$('#l-send').click(lefteris.viewImage);
$('#l-input').keyup(function (e) {
    e.keyCode == 13 && lefteris.viewImage();

});
   
