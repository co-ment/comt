// contains code that proposed by the text_view_comment frame to its parent frame


c_persistPreference = function(key1, key2, val) {
  gPrefs.persist(key1, key2, val) ;
}

c_readDefaultPreference = function(key1, key2) {
  return gConf['defaultPrefs'][key1][key2] ;
}

c_readPreference = function(key1, key2) {
  return gPrefs.get(key1,key2) ;
}

c_resetPreferences = function(entries) {
  gPrefs.reset(entries) ;
}

c_applyTextStyle = function(val) {
  CY.use(val) ;
}

sliderValToPx = function (val) {
  var winWidth = CY.DOM.winWidth() ;
  if (gLayout.isInFrame()) 
     winWidth = parent.$(parent).width() ;    
  var theta = val / 100 ;
  theta = Math.min(theta, gConf['sliderFixedMin']) ;
  theta = Math.max(theta, gConf['sliderFixedMax']) ;
  var colWidth = theta * winWidth ;
  return Math.floor(colWidth) ;
}


c_setCommentsColWidth = function(val) {
  var colWidth = sliderValToPx(val) ;
  gLayout.setLeftColumnWidth(colWidth) ;

  var iCommentWidth = gLayout.getTopICommentsWidthFromWidth(colWidth) ;

  // icomments
  gIComments.setWidth(iCommentWidth) ;  

  //forms
  gICommentForm['overlay'].get('boundingBox').setStyle('width', iCommentWidth + 'px') ;
  changeFormFieldsWidth(gICommentForm['formId'], iCommentWidth) ;
  
  //toc
  //For some reasons: gToc['overlay'].get('boundingBox').setStyle('width', iCommentWidth + 'px');
  // does not work when the div.c-toc has a fixed position.
  document.getElementById('the-toc').style.width = iCommentWidth + 'px';
  
  if (gNewReply) 
    changeFormFieldsWidth(gNewReply['ids']['formId'], iCommentWidth) ; 
  if (gEdit) 
    changeFormFieldsWidth(gEdit['ids']['formId'], iCommentWidth) ; 
}
