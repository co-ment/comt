v_toggleFrameSize = function() {
  if (gInFullScreen)
    _toNormalSize() ;
  else 
    _toFullScreenSize() ;
}

//v_toNormalSize = function() {
//  _toNormalSize() ;
//}
//
v_toInitialSize = function() {
  _toInitialSize() ;
  $(window).resize(function(){
//    console.log('before setFramesize in top resize winwidth' +  frames['text_view_frame'].frames['text_view_comments'].CY.DOM.winWidth()) ;
    _setFrameSize();
//    console.log('after setFramesize in top resize winwidth' +   frames['text_view_frame'].frames['text_view_comments'].CY.DOM.winWidth()) ;
  });
}


