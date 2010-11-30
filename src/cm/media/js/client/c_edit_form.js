gEditICommentHost = null ;
gEdit = null ;

dbgc = null ;
showEditForm = function(iCommentHost) {
  
  if (gEdit == null) {
    gEdit = {
        'ids':{
          'formId':CY.guid(),
          'formTitleId':CY.guid(),
          'nameInputId':CY.guid(),
          'emailInputId':CY.guid(),
          'titleInputId':CY.guid(),
          'contentInputId':CY.guid(),
          'tagsInputId':CY.guid(),
          'formatInputId':CY.guid(),
          'startWrapperInputId':CY.guid(),
          'endWrapperInputId':CY.guid(),
          'startOffsetInputId':CY.guid(),
          'endOffsetInputId':CY.guid(),
          'changeScopeInputId':CY.guid(),
          'changeScopeInputWrapper':CY.guid(),
          'selectionPlaceId':CY.guid(),
          'keyId':CY.guid(),
          'editCommentId':CY.guid(),
          'currentSelId':CY.guid(),
          'currentSelIdI':CY.guid(),
          'addBtnId':CY.guid(),
          'cancelBtnId':CY.guid()
          },
        'handlers':{}
    } ;
  }
  
  gEditICommentHost = iCommentHost ;

  gEditICommentHost.hideContent() ;

// FORM HTML  
  var overlayHtml = getHtml(gEdit['ids']) ;
  var editHeader = '<div class="icomment-edit-header">' + overlayHtml['headerContent'] + '</div>' ;
  var editBody = '<div class="icomment-edit-body">' + overlayHtml['bodyContent'] + '</div>' ;
  
//  cf. http://yuilibrary.com/projects/yui3/ticket/2528319 
  gEditICommentHost['overlay'].setStdModContent(CY.WidgetStdMod.HEADER,CY.Node.create(editHeader),CY.WidgetStdMod.AFTER);   
  gEditICommentHost['overlay'].setStdModContent(CY.WidgetStdMod.BODY,CY.Node.create(editBody),CY.WidgetStdMod.AFTER);
  
// FORM TITLE   
  CY.get("#"+gEdit['ids']['formTitleId']).set('innerHTML', gettext("Edit comment")) ;

// FETCH FORM VALUES FROM COMMENT
  
  var comment = gDb.getComment(gEditICommentHost.commentId) ;
  CY.get("#"+gEdit['ids']['editCommentId']).set('value', comment.id) ;
  CY.get("#"+gEdit['ids']['keyId']).set('value', comment.key) ;

  CY.get("#"+gEdit['ids']['changeScopeInputId']+" input").set('checked', false) ;
  if (comment.reply_to_id != null) 
    CY.get("#"+gEdit['ids']['changeScopeInputId']).addClass('displaynone')
  changeScopeFormClick() ; // to adapt

  CY.get("#"+gEdit['ids']['nameInputId']).set('value', comment.name) ; 
  CY.get("#"+gEdit['ids']['emailInputId']).set('value', comment.email) ; 

  if (comment.logged_author) {
    CY.get("#"+gEdit['ids']['nameInputId']).setAttribute("disabled", true); 
    CY.get("#"+gEdit['ids']['emailInputId']).setAttribute("disabled", true);
  }
  
// FORM VALUES
  CY.get("#"+gEdit['ids']['titleInputId']).set('value', comment['title']) ;
  CY.get("#"+gEdit['ids']['contentInputId']).set('value', comment['content']) ;
  CY.get("#"+gEdit['ids']['tagsInputId']).set('value', comment['tags']) ;
  
  CY.get("#"+gEdit['ids']['formatInputId']).set('value',gConf['defaultCommentFormat']) ;// for now ...
  
// WIDTH  
  var width = gLayout.getTopICommentsWidth() ;
  changeFormFieldsWidth(gEdit['ids']['formId'], width) ;
  
// ATTACH EVENT HANDLERS
  gEdit['handlers']['addBtnId'] = CY.on("click", onEditSaveClick, "#"+gEdit['ids']['addBtnId']);
  gEdit['handlers']['cancelBtnId'] = CY.on("click", onEditCancelClick, "#"+gEdit['ids']['cancelBtnId']);
  gEdit['handlers']['changeScope'] = CY.on("click", onChangeScopeClick, "#"+gEdit['ids']['changeScopeInputId']);
  
}
onEditSaveClick = function(iCommentHost) {
  if (readyForAction())
    gSync.editComment() ;
}
onEditCancelClick = function(iCommentHost) {
  if (readyForAction())
    gSync.cancelEdit() ;
}
onChangeScopeClick = function() {
  if (readyForAction())
    gSync.changeScopeFormClick() ;
  else {// (onChangeScopeClick triggers an animation : checking for readyForAction does not prevent the checkbox change ...)
    var chckCtrl = CY.get("#"+gEdit['ids']['changeScopeInputId']+" input") ;
    var chck = chckCtrl.get('checked') ;
    chckCtrl.set('checked', !chck) ; // set it back 
  }
}
changeScopeFormClick = function() {
  var node = CY.get("#"+gEdit['ids']['currentSelId']) ;
  if (CY.get("#"+gEdit['ids']['changeScopeInputId']+" input").get('checked'))
    node.removeClass('displaynone') ;
  else
    node.addClass('displaynone') ;
}
cancelEditForm = function() {
  if (gEditICommentHost != null) {
// DETACH EVENT HANDLERS
    for (var id in gEdit['handlers']) {
      if (gEdit['handlers'][id] != null) {
        gEdit['handlers'][id].detach() ;
        gEdit['handlers'][id] = null ;
      }
    }

// REMOVE EDIT FORM NODES FROM ICOMMENT OVERLAY
    var node = gEditICommentHost['overlay'].get('contentBox').query(".icomment-edit-body") ;
    node.get('parentNode').removeChild(node) ;
    node = gEditICommentHost['overlay'].get('contentBox').query(".icomment-edit-header") ;
    node.get('parentNode').removeChild(node) ;

// SHOW ICOMMENT OVERLAY
    gEditICommentHost.showContent() ;
    
    gEditICommentHost = null ;
  }
}
