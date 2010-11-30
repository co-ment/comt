gInFullScreen = false;

_setFrameSize = function() {
  if (gInFullScreen) {
    // TODO test it seriously
    var headerHeight = $("#header").height();
    var windowHeight = $(window).height();
    var frameHeight = (windowHeight - headerHeight - 2) + 'px'; // - 2 to prevent scrollbars ? --> TODO test it without -2

    var windowWidth = $(window).width();
    var frameWidth = (windowWidth - 2) + 'px'; // - 2 to prevent scrollbars ?// --> TODO test it without -2

    // TODO test if we're embeded ! wont work otherwise anyway (frame security concerns)
    $("#text_view_frame").css( {
      'position' :'absolute',
      'left' :'0px',
      'top' :headerHeight,
      'width' :frameWidth,
      'height' :frameHeight
    });
  }
  else {
    // TODO test it seriously
    var frameTop = Math.ceil($("#text_view_frame_container").position()["top"]);

    var windowHeight = $(window).height();
    var frameHeight = (windowHeight - frameTop - 2) + 'px'; // - 2 to prevent scrollbars // ? --> TODO test it without -2
    
    var windowWidth = $(window).width();
    var frameWidth = (windowWidth - 2) + 'px'; // - 2 to prevent scrollbars ? // --> TODO test it without -2

    // TODO test if we're embeded ! wont work otherwise anyway (frame security)
    $("#text_view_frame").css( {
      'position' :'relative',
      'width' :'99.9%',
      'height' :frameHeight,
      'top' :'0px'
    });
  }
}
_toFullScreenSize = function() {
  gInFullScreen = true;
  _setFrameSize() ;

  frames['text_view_frame'].$("#c_fullscreen_btn").attr('src', sv_media_url + '/img/arrow_in.png');

  frames['text_view_frame'].f_setCookie('fullscreen', '1') ;
};

_toNormalSize = function() {
  gInFullScreen = false;
  _setFrameSize() ;

  frames['text_view_frame'].$("#c_fullscreen_btn").attr('src', sv_media_url + 'img/arrow_out.png');
  
  frames['text_view_frame'].f_setCookie('fullscreen', '0') ;
};

_toInitialSize = function() {
  //console.info('_toInitialSize') ; 
  var fullscreen = ($.cookie('fullscreen') == '1');
  if (fullscreen)
    _toFullScreenSize() ;
  else 
    _toNormalSize() ;
};
