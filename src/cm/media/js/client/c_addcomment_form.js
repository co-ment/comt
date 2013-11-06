gICommentForm = null ;

instanciateICommentForm = function() {
  gICommentForm = {
      'position':[CY.WidgetPositionExt.TL, CY.WidgetPositionExt.TL],
      'formId':CY.guid(),
      'formTitleId':CY.guid(),
      'titleInputId':CY.guid(),
      'contentInputId':CY.guid(),
      'tagsInputId':CY.guid(),
      'categoryInputId':CY.guid(),
      'formatInputId':CY.guid(),
      'startWrapperInputId':CY.guid(),
      'endWrapperInputId':CY.guid(),
      'startOffsetInputId':CY.guid(),
      'endOffsetInputId':CY.guid(),
      'selectionPlaceId':CY.guid(),
      'keyId':CY.guid(),
      'currentSelId':CY.guid(),
      'currentSelIdI':CY.guid(),
      'addBtnId':CY.guid(),
      'cancelBtnId':CY.guid(),
      'closeBtnId':CY.guid()
  } ;
  
  if (!sv_loggedIn) {
    gICommentForm ['nameInputId'] = CY.guid() ;
    gICommentForm ['emailInputId'] = CY.guid() ;
  }
  
  var overlayHtml = getHtml(gICommentForm) ;
  
  var width = gLayout.getTopICommentsWidth() ;
  width += gLayout.iCommentsRequiredThreadPadding (); // SID: use max available space as there is no indentation on that box
  
  var overlay = new CY.Overlay( {
    zIndex :3,
    shim :false, // until we really need it, no shim 
    visible :false,
    headerContent :overlayHtml['headerContent'],
    bodyContent :overlayHtml['bodyContent'],
    xy :[10,10],
    width : width
  });
  overlay.get('contentBox').addClass("c-newcomment") ;
  
  // attach to DOM
  overlay.render('#leftcolumn');
  
  if (!sv_loggedIn) {
    CY.get("#"+gICommentForm['nameInputId']).set('value',gPrefs.get("user","name")) ;
    CY.get("#"+gICommentForm['emailInputId']).set('value',gPrefs.get("user","email")) ;
  }
    
  CY.get("#"+gICommentForm['formTitleId']).set('innerHTML', gettext('New comment')) ;
  CY.get("#"+gICommentForm['formatInputId']).set('value',gConf['defaultCommentFormat']) ;
  
  CY.on("click", onSubmitICommentFormClick, "#"+gICommentForm['addBtnId']);
  CY.on("click", onCancelICommentFormClick, "#"+gICommentForm['cancelBtnId']);
  CY.on("click", onCancelICommentFormClick, "#"+gICommentForm['closeBtnId']);
  
  gICommentForm['overlay'] = overlay ;
  
  var animationHide = null ;
  animationHide = new CY.Anim({
        node: overlay.get('boundingBox'),
        duration: .3, //gPrefs['general']['animduration'],
        easing: CY.Easing.easeOut
    });   
  gICommentForm['animationHide'] = animationHide ; 
  animationHide.set('to', { opacity: 0});// height : 0 doesn't work
  gICommentForm['animationHide-handle'] = animationHide.on('end', onICommentFormHideAnimEnd, gICommentForm);

  var animationShow = null ;
  animationShow = new CY.Anim({
        node: overlay.get('boundingBox'),
        duration: .3, //gPrefs['general']['animduration'],
        easing: CY.Easing.easeOut
    });   
  gICommentForm['animationShow'] = animationShow ; 
  animationShow.set('to', { opacity: 1});
  gICommentForm['animationShow-handle'] = animationShow.on('end', onICommentFormShowAnimEnd, gICommentForm);
  
  changeFormFieldsWidth(gICommentForm['formId'], width) ;
}

cleanICommentForm = function() {
  CY.get("#"+gICommentForm['currentSelIdI']).set('innerHTML', gNoSelectionYet) ;

    var hostNode = gICommentForm['overlay'].getStdModNode(CY.WidgetStdMod.BODY) ;
    hostNode.queryAll(".comment_input").set('value', "") ;
  
  CY.get("#"+gICommentForm['formatInputId']).set('value',gConf['defaultCommentFormat']) ;// for now ...
  
  if (!sv_loggedIn) {
    hostNode.queryAll(".user_input").set('value', "") ;
  }
}

onICommentFormHideAnimEnd = function() {
//  iComment['overlay'].blur() ;
  this.overlay.hide() ;
  gSync.resume() ;    
}

onICommentFormShowAnimEnd = function() {
  gSync.resume() ;    
}

onSubmitICommentFormClick = function() {
  if (!sv_loggedIn) {
    var name = CY.get("#"+gICommentForm['nameInputId']).get('value') ;
    gPrefs.persist("user", "name", name) ;  
  
    var email = CY.get("#"+gICommentForm['emailInputId']).get('value') ;
    gPrefs.persist("user", "email", email) ;
  }
  gSync.saveComment(gICommentForm['formId']) ;
}

onCancelICommentFormClick = function() {
  gSync.cancelICommentForm() ;
}

// record selection info in hidden form fields
_updateICommentFormSelection = function(ids, displayedText, csStartSelection, csEndSelection) {
  var node = CY.Node.get('#'+ids['currentSelIdI']) ;
  if (node != null)
    node.set('innerHTML', displayedText) ;
  
    node = CY.get('#'+ids['startWrapperInputId']) ;
  if (node != null)
    node.set('value', csStartSelection['elt'].id.substring("sv_".length)) ;
    node = CY.get('#'+ids['startOffsetInputId']) ;
  if (node != null)
    node.set('value', csStartSelection['offset']) ;
    node = CY.get('#'+ids['endWrapperInputId']) ;
  if (node != null)
    node.set('value', csEndSelection['elt'].id.substring("sv_".length)) ;
    node = CY.get('#'+ids['endOffsetInputId']) ;
  if (node != null)
    node.set('value', csEndSelection['offset']) ;
}

updateICommentFormSelection = function(selection) {
  var text = (selection == null) ? "" : selection['text'] ;
  if (text != "") {
    // display text to be commented 
    var displayedText = text ; 
    var maxLength = 100 ; // even number only
    if (text.length > maxLength ) {
      var start = text.substring(0, (text.substring(0, maxLength/2)).lastIndexOf(" ")) ;
      var endPart = text.substring(text.length - maxLength/2) ;
      var end = endPart.substring(endPart.indexOf(" ")) ;
      displayedText = start + " ... " + end ;
    }
        var csStartSelection = _convertSelectionFromCCToCS(selection['start']) ;
        var csEndSelection = _convertSelectionFromCCToCS(selection['end']) ;

        _updateICommentFormSelection(gICommentForm, displayedText, csStartSelection, csEndSelection);
        if (gEdit != null)
          _updateICommentFormSelection(gEdit['ids'], displayedText, csStartSelection, csEndSelection);
      positionICommentForm() ;
  }
}

showICommentForm= function () {
  removeFormErrMsg(gICommentForm['formId']) ;
  if (!sv_loggedIn) {
    if (CY.get("#"+gICommentForm['nameInputId']).get('value') == '') 
      CY.get("#"+gICommentForm['nameInputId']).set('value', gPrefs.get('user','name')) ;
    if (CY.get("#"+gICommentForm['emailInputId']).get('value') == '') 
      CY.get("#"+gICommentForm['emailInputId']).set('value', gPrefs.get('user','email')) ;
  }
  gIComments.hide() ;
  hideToc();
  positionICommentForm() ;
  gICommentForm['overlay'].show() ;
  CY.get("#"+gICommentForm['titleInputId']).focus() ;
}

isICommentFormVisible = function () {
  if (gICommentForm != null)
    return gICommentForm['overlay'].get('visible') ;
  return false ;
}

positionICommentForm = function () {
  if (gICommentForm != null) { 
    var overlay = gICommentForm['overlay'] ;
    var boundingBox = overlay.get('boundingBox') ;

    var commentFormHeight = boundingBox.get('offsetHeight') ;
    var windowHeight = boundingBox.get('winHeight') ;

    var pos = gICommentForm['position'] ;
    if (commentFormHeight > windowHeight) // trying to have save comment visible ... :
      pos = [CY.WidgetPositionExt.BL, CY.WidgetPositionExt.BL] ;
    
    overlay.set("align", {points:pos});
    if (commentFormHeight <= windowHeight)
      overlay.set("y", overlay.get("y") + 30);
    boundingBox.setX(boundingBox.getX() + gConf['iCommentLeftPadding']);
  }
}
