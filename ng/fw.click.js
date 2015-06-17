fw.click = function (event) {

    var tar = $(event.target);

    tar.is(':not(#logout-button, #logout-button *)') && $('.on#logout-button').removeClass('on');

    $('.exp-opt').not(tar.parent()).removeClass('exp-opt');
    tar.is('#toolbar > div > a') && tar.parent().toggleClass('exp-opt');

}