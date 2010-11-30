
// dialog related
_afterDlg = function(args) {
  var yesFunction = args[0] ;
  var yesFunctionContext = args[1] ;
  var yesFunctionArgs = args[2] ;
  yesFunction.call(yesFunctionContext, yesFunctionArgs) ;
}
_abortNewCommentConfirmed = function(args) {
  if (isICommentFormVisible()) {
    if (gLayout.isInFrame()) {
      gSync.hideICommentForm({fn:function(){_afterDlg(args) ;}}) ;
      gSync.resume() ;
    }
  }
}
_abortNewReplyConfirmed = function(args) {
  if (gNewReplyHost != null) {
    if (gLayout.isInFrame()) {
      cancelNewReplyForm() ;
      _afterDlg(args) ;
    }
  }
}
_abortNewEditConfirmed = function(args) {
  if (gEditICommentHost != null) {
    if (gLayout.isInFrame()) {
      cancelEditForm() ;
      _afterDlg(args) ;
    }
  }
}

//if topIComment != null will check if edit or new reply is hosted by a child of topIComment
//if topIComment == null will check if edit or a new reply is hosted somewhere
checkForOpenedDialog = function(topIComment, yesFunction, yesFunctionContext, yesFunctionArgs) {
  var childrenIds = [] ;
  if (topIComment != null) {
    childrenIds = CY.Array.map(gDb.getThreads([gDb.getComment(topIComment.commentId)]), function(comment) { return comment.id ;}) ;
  }
  
  if (isICommentFormVisible()
    ||
    (gNewReplyHost != null && (topIComment == null || CY.Array.indexOf(childrenIds, gNewReplyHost.commentId) != -1))
    ||
    (gEditICommentHost != null && (topIComment == null || CY.Array.indexOf(childrenIds, gEditICommentHost.commentId) != -1))) {
    if (gLayout.isInFrame()) {
      if (isICommentFormVisible()) 
        parent.f_yesNoDialog(gettext("New comment will be canceled, continue?"), gettext("Warning"), null, null, null, _abortNewCommentConfirmed, this, [yesFunction, yesFunctionContext, yesFunctionArgs]) ;
      else if (gNewReplyHost != null)
        parent.f_yesNoDialog(gettext("Started reply will be canceled, continue?"), gettext("Warning"), null, null, null, _abortNewReplyConfirmed, this, [yesFunction, yesFunctionContext, yesFunctionArgs]) ;
      else if (gEditICommentHost != null)
        parent.f_yesNoDialog(gettext("Started comment edition will be canceled, continue?"), gettext("Warning"), null, null, null, _abortNewEditConfirmed, this, [yesFunction, yesFunctionContext, yesFunctionArgs]) ;
    }
  }
  else {
    yesFunction.call(yesFunctionContext, []) ;
  }
}

