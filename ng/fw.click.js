fw.click = function (event) {

    $(event.target).is(':not(#logout-button, #logout-button *)') && $('.on#logout-button').removeClass('on');

}