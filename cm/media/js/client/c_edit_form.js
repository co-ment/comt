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
          'categoryInputId':CY.guid(),
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
  CY.one("#"+gEdit['ids']['formTitleId']).set('innerHTML', gettext("Edit comment")) ;

// FETCH FORM VALUES FROM COMMENT
  
  var comment = gDb.getComment(gEditICommentHost.commentId) ;
  CY.one("#"+gEdit['ids']['editCommentId']).set('value', comment.id) ;
  CY.one("#"+gEdit['ids']['keyId']).set('value', comment.key) ;

  CY.one("#"+gEdit['ids']['changeScopeInputId']+" input").set('checked', false) ;
  // Edit scope and category just for the first comment in a thread
  // => hides these inputs for a reply.
  if (comment.reply_to_id != null) {
    CY.one("#"+gEdit['ids']['changeScopeInputId']).addClass('displaynone')
    if (CY.one("#"+gEdit['ids']['categoryInputId'])) {
      CY.one("#"+gEdit['ids']['categoryInputId']).addClass('displaynone')
      CY.one("#"+gEdit['ids']['categoryInputId']).ancestor().addClass('displaynone')
    }
  }
  changeScopeFormClick() ; // to adapt

  CY.one("#"+gEdit['ids']['nameInputId']).set('value', comment.name) ; 
  CY.one("#"+gEdit['ids']['emailInputId']).set('value', comment.email) ; 

  if (comment.logged_author) {
    CY.one("#"+gEdit['ids']['nameInputId']).setAttribute("disabled", true); 
    CY.one("#"+gEdit['ids']['emailInputId']).setAttribute("disabled", true);
  }
  
// FORM VALUES
  CY.one("#"+gEdit['ids']['titleInputId']).set('value', comment['title']) ;
  CY.one("#"+gEdit['ids']['contentInputId']).set('value', comment['content']) ;
  CY.one("#"+gEdit['ids']['tagsInputId']).set('value', comment['tags']) ;
  if ( CY.one("#"+gEdit['ids']['categoryInputId']))
    CY.one("#"+gEdit['ids']['categoryInputId']).set('value', comment['category']) ;
  
  CY.one("#"+gEdit['ids']['formatInputId']).set('value',gConf['defaultCommentFormat']) ;// for now ...
  
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
    var chckCtrl = CY.one("#"+gEdit['ids']['changeScopeInputId']+" input") ;
    var chck = chckCtrl.get('checked') ;
    chckCtrl.set('checked', !chck) ; // set it back 
  }
}
changeScopeFormClick = function() {
  var node = CY.one("#"+gEdit['ids']['currentSelId']) ;
  if (CY.one("#"+gEdit['ids']['changeScopeInputId']+" input").get('checked'))
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
    gEditICommentHost['overlay'].get('contentBox').one (".icomment-edit-body").remove () ;
    gEditICommentHost['overlay'].get('contentBox').one (".icomment-edit-header").remove () ;

// SHOW ICOMMENT OVERLAY
    gEditICommentHost.showContent() ;
    
    gEditICommentHost = null ;
  }
}
