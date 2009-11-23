gShowingAllComments = false ;
// YUI : queue, overlay
Sync = function() {
	// this queue handles both animations and io requests
	this._q = null ;
	
	this._iPreventClick = false ; // oh really ?
}

Sync.prototype = {
	init : function (iComment) {
	this._q = new CY.AsyncQueue() ;
// pr2 this._q = new CY.Queue() ;
	},
	
	setPreventClickOn : function () {
		CY.log("setPreventClickOn !") ;
		if (gLayout.isInFrame())
			parent.f_interfaceFreeze()		
		this._iPreventClick = true ;
	},

	setPreventClickOff : function () {
		CY.log("setPreventClickOff !") ;
		if (gLayout.isInFrame())
			parent.f_interfaceUnfreeze()		
		this._iPreventClick = false ;
	},

	removeCommentRet : function(args) {
		var successfull = args['successfull'] ;
		
		var iComment = (successfull) ? args['failure']['iComment'] : args['success']['iComment'] ;
		
		if (successfull) {
			var filterData = args['returned']['filterData'] ;
			if (gLayout.isInFrame()) {
				parent.f_updateFilterData(filterData) ;
			}
			
			var y = gIComments.getTopPosition()[1] ;
			
			var comment = gDb.getComment(iComment.commentId) ;
			this._q.add(
		            function(){
		            	
		    	    	unpaintCommentScope(comment) ;
		    	    	gIComments.close(comment.id) ;
		    	    	gIComments.remove(comment.id) ;
		    	    	if (comment.reply_to_id != null)
		    	    		gIComments.refresh(comment.reply_to_id) ;
		    	    	
		    	    	gDb.del(comment) ;
		    	    	
		    	    	if (gLayout.isInFrame()) {
		    		    	if (gDb.comments.length == 0 && gDb.allComments.length != 0) {
		    		    		parent.f_enqueueMsg(gettext("no filtered comments left")) ;
		    					parent.resetFilter() ;  
		    		    	}
		    		    	else {
		    					// just counting here ...
		    					var filterRes = gDb.computeFilterResults() ;
		    					updateFilterResultsCount(filterRes['nbDiscussions'], filterRes['nbComments'], filterRes['nbReplies']) ;
		    		    	}
		    	    	}
		            }
			);
			
			this._animateTo(y) ;		
		}
		this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
		this.resume() ;
	},
	
	moderateCommentRet : function(args) {
		var successfull = args['successfull'] ;

		var iComment = (successfull) ? args['failure']['iComment'] : args['success']['iComment'] ;

		if (successfull) {
			var ret = args['returned'] ;
			var comment = ret['comment'] ;

			gDb.upd(comment) ;
			
			var shouldReset = gLayout.isInFrame() && !parent.f_isFrameFilterFieldsInit() ;
			if (shouldReset){
				parent.resetFilter() ;
				this._showSingleComment(comment) ;
			}
			else 
				iComment.changeModeration(comment) ;
		}

		this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
		this.resume() ;
	},
	
	saveCommentRet : function(args) {
		var successfull = args['successfull'] ;
		if (successfull) {
			var formId = args['success']['formId'] ;
			var ret = args['returned'] ;
		
			removeFormErrMsg(formId) ;
		
			if ('errors' in ret) { // validation error
				var errors = ret['errors'] ;
				for (var eltName in errors) {
					addFormErrMsg(formId, eltName, errors[eltName]) ;
				}
				this._animateToTop() ;
			}
			else {
				var isReply = function() {return (gNewReply != null) && (formId == gNewReply['ids']['formId']) ;} ;
				var isNewComment = function() {return (gICommentForm != null) && (formId == gICommentForm['formId']) ;} ;
				var isEdit = function() {return (gEdit != null) && (formId == gEdit['ids']['formId']) ;} ;
				
				// doing this here for the a priori moderation case
				if (isNewComment())
					this.hideICommentForm(cleanICommentForm()) ;
				else if (isEdit())
					this._hideEditForm() ;
				else if (isReply())
					this._hideNewReplyForm() ;
				
				if ("comment" in ret) { // won't be when add with a priori moderation
					var comment = ret['comment'] ;
	
					gDb.upd(comment) ;
	
					var shouldReset = gLayout.isInFrame() && !parent.f_isFrameFilterFieldsInit() ;
					if (shouldReset)
						parent.resetFilter() ;
					else { // ASSUMING filter is in init state ! (because when not // TODO $$$$$$$$$$$ this isn't true anymore .... when passing filter arguments in url !!
							// in frame for now data can't be filtered)
						if (comment.reply_to_id == null) { // not a reply
							unpaintCommentScope(comment) ; // for the edit case
							paintCommentScope(comment) ;
						}
					}
	
					// UPDATE FILTER DATA // TODO move ????
					var filterData = ret['filterData'] ;
					if (gLayout.isInFrame()) {
						parent.f_updateFilterData(filterData) ;
						updateResetFilterResultsCount() ;				
					}

					if (isReply()) { // add reply case
						if (!shouldReset) {
							this._insertReply(comment) ;
						}
					}
					else { // edit (reply or comment) or add (comment) case
				    	this._showSingleComment(comment) ;
					}
				}
				else 
					this._animateToTop() ;
			}

		}
		else { // TODO ? ALL ret-FUNCTIONS ?
			this._q.add({id:"expl", fn:function () {CY.log('in example .........') ;}}) ;
			this._q.promote("expl") ;
		}

		this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
		this.resume() ;
	},
	
	example : function () {
		CY.log('in example .........') ;
	},

	moderateComment	: function(iComment, state) {
		var comment = gDb.getComment(iComment['commentId']) ;
        this._q.add(
	            {fn:CY.bind(this.setPreventClickOn, this)},
	            {autoContinue:false, fn:CY.bind(doExchange, null, "editComment", {'comment_key':comment.key, 'state':state}, null, this.moderateCommentRet, this, {'iComment':iComment}, gettext("could not save comment"))}
	            ).run();
	},
	
	_saveComment : function(serverFun, formId) {
        this._q.add(
	            {fn:CY.bind(this.setPreventClickOn, this)},
	            {autoContinue:false, fn:CY.bind(doExchange, null, serverFun, {}, formId, this.saveCommentRet, this, {'formId':formId}, gettext("could not save comment"))}
	            ).run();
	},
	
	editComment : function() {
		this._saveComment("editComment", gEdit['ids']['formId']) ;
	},
	
	saveComment : function(formId) {
		this._saveComment("addComment", formId) ;
	},
	
	removeComment : function(iComment) {
		checkForOpenedDialog(iComment, function() {
			if (gLayout.isInFrame()) {
				parent.f_yesNoDialog(gettext("Are you sure you want to delete this comment?"), gettext("Warning"), function() { this.animateToTop() ;}, this, null, function() {
					var comment = gDb.getComment(iComment.commentId) ;
			        this._q.add(
				            {fn:CY.bind(this.setPreventClickOn, this)},
				            {autoContinue:false, fn:CY.bind(doExchange, null, "removeComment", {'comment_key':comment.key}, null, this.removeCommentRet, this, {'iComment':iComment}, gettext("could not remove comment"))}
				            ).run();
				}, this, null) ;
		        
			}
//			else {
//				alert("TODO : can't yet delete comments when not embed in text_view_frame because can't 'dialog' confirmation") ;
//			}
		
		}, this, null) ;
	},
	
	resume : function(commentDbIds, mouseXY) {
		this._q.run() ;
	},
	
	resetAutoContinue : function(callbackId) {
		this._q.getCallback(callbackId).autoContinue = true;
	},
	
	hideICommentForm : function(funObj) {
//		this._q.add({fn:function() {persistICommentFormValues();}}) ;
		this._q.add({autoContinue:false, fn:CY.bind(gICommentForm['animationHide'].run, gICommentForm['animationHide'])}) ;
//		this._q.add({fn:function() {cleanICommentForm();}}) ;
		if (funObj)
			this._q.add(funObj) ;
	},
	
	/* ANIMATION DRIVEN INTERFACE CHANGES */
	
	showCommentForm : function(iComment) {
		checkForOpenedDialog(null, function() {
	        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});
			this._q.add({fn:function() {
								if (iComment == null) {
									var selection = getSelectionInfo() ;
									updateICommentFormSelection(selection) ;
								}
								showICommentForm(iComment);
							}}) ;
			this._q.add({autoContinue:false, fn:CY.bind(gICommentForm['animationShow'].run, gICommentForm['animationShow'])},
					{fn:CY.bind(this.setPreventClickOff, this)}
					).run();
		}, this, null) ;
	},
	
	showEditForm : function(iComment) {
		checkForOpenedDialog(null, function() {
	        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});

	        this._q.add({fn:function() {
	        				showEditForm(iComment) ;
	        			}});
			this._animateToTop() ;
			
	        this._q.add({fn:CY.bind(this.setPreventClickOff, this)});
	        this._q.run() ;
		}, this, null) ;
	},
	
	showReplyForm : function(iComment) {
		checkForOpenedDialog(null, function() {
	        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});

	        this._q.add({fn:function() {
	        					instanciateNewReplyForm(iComment) ;
	        					}});
			this._animateToTop() ;
			
	        this._q.add({fn:CY.bind(this.setPreventClickOff, this)});
	        this._q.run() ;
		}, this, null) ;
	},
	
	cancelICommentForm : function() {
        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});
        
//		this._q.add({fn:function() {cleanICommentForm();}}) ;
    	this.hideICommentForm() ;
    	
        this._q.add({fn:CY.bind(this.setPreventClickOff, this)});
        this._q.run() ;
	},
	cancelEdit : function() {
        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});
        
    	this._q.add({fn:function() {cancelEditForm();}}) ;
    	this._animateToTop() ;
    	
        this._q.add({fn:CY.bind(this.setPreventClickOff, this)});
        this._q.run() ;
	},
	cancelReply : function() {
        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});
        
    	this._q.add({fn:function() {cancelNewReplyForm();}}) ;
    	this._animateToTop() ;
    	
        this._q.add({fn:CY.bind(this.setPreventClickOff, this)});
        this._q.run() ;
	},
	changeScopeFormClick : function() {
        this._q.add({fn:CY.bind(this.setPreventClickOn, this)});
        
    	this._q.add({fn:function() {changeScopeFormClick();}}) ;
    	this._animateToTop() ;
    	
        this._q.add({fn:CY.bind(this.setPreventClickOff, this)});
        this._q.run() ;
	},
	// this is invoked during queue execution
	_hideNewReplyForm : function() {
		this._q.add({fn:function() {
					cleanNewReplyForm() ; 
					cancelNewReplyForm() ;}}) ;
	},
	// this is invoked during queue execution
	_hideEditForm : function() {
		this._q.add({fn:function() {
					cancelEditForm() ;}}) ;
	},
	// this is invoked during queue execution
	_insertReply : function(comment) {
		this._q.add({fn:function() {
					var parentComment = gDb.getComment(comment.reply_to_id) ;
					var parentThread = gDb.getThreads([parentComment]) ;
					var previousComment = parentThread[parentThread.length - 2] ; // - 2 because now that comment has been added comment is parentThread[parentThread.length - 1]

					var iComment = gIComments.insertAfter(previousComment, comment) ;
					// iComment CAN'T BE NULL ! (TODO check that there is a
					// check server side that parent exists when adding a reply
					// !)
					
					var parentPosition = gIComments.getPosition(comment.reply_to_id) ;
					iComment.setPosition(parentPosition) ;
					
					// check if activation is necessary (will always be ?)
					var comment_path = gDb.getPath(comment) ;
					var topComment = comment_path[comment_path.length - 1] ;
					if (gIComments.isTopActive(topComment.id))
						iComment.activate() ;

					iComment.show() ;}}) ;
    	this._animateToTop() ;
	},
	_showSingleComment : function(comment) {
		if (comment != null) {
			var path = gDb.getPath(comment) ;
			var topAncestorComment = path[path.length - 1] ;
			var topY = CY.get(".c-id-"+topAncestorComment.id).getY() ;
			this._showComments([topAncestorComment.id], topY, false) ;
			// optim when browsing comments with no reply			
			if (topAncestorComment.replies.length > 0)
				this._animateTo(topY) ;
		}
	},

	showSingleComment : function(comment) {
		this._q.add({fn:CY.bind(this.setPreventClickOn, this)}) ;
		this._showSingleComment(comment) ;
		this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
		this._q.run();
	},
	
	browse : function(order, whereto) { 
		var comment = gIComments.browse(order, whereto) ;
		if (comment != null) 
			this.showSingleComment(comment) ;
	},
	
	_showComments : function(commentDbIds, topY, showingAll) {
		this._q.add(
			{fn:function() {
				gShowingAllComments = showingAll ;			
				gIComments.hide() ; 
				var cs = CY.Array.map(commentDbIds, function(id) { return gDb.getComment(id) ; }) ;
				var comments = gDb.getThreads(cs) ;
				gIComments.fetch(comments) ;
	
				if (commentDbIds.length > 0) {
					if (!showingAll) {
						gIComments.activate(commentDbIds[0]) ;
						var scopeStart = CY.get(".c-id-"+commentDbIds[0]) ;
						if (!scopeStart.inViewportRegion())
							scopeStart.scrollIntoView(true) ;
					}
					else {
						CY.get('document').set('scrollTop', 0) ; 
					}
				}
				
				gIComments.setPosition([gConf['iCommentLeftPadding'], topY]) ;
	
				gIComments.show() ;
			}}) ;
	},
	
	_animateTo : function(topY) {
		this._q.add({fn:function() {
						gIComments.setAnimationToPositions(topY) ;
						}},
					{id:"animationRun", autoContinue:false, fn:CY.bind(gIComments.runAnimations, gIComments)}
	            ) ;
	},
	
	_animateToTop : function() {
		var topPos = gIComments.getTopPosition() ;
		if (topPos != null)
			this._animateTo(topPos[1]) ;
	},
	
	animateToTop : function() {
		this._q.add({fn:CY.bind(this.setPreventClickOn, this)}) ;
		this._animateToTop() ;
		this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
		this._q.run();
	},
	
	showAllComments : function() {
		checkForOpenedDialog(null, function() {
			gShowingAllComments = true ;
			var allTopComments = CY.Array.map(gDb.comments, function(c){return c.id;}) ;
			this.showComments(allTopComments, [0,0], true) ;
		}, this, null) ;
	},

	showComments : function(commentDbIds, mouseXY, showingAll) {
		checkForOpenedDialog(null, function() {
			this._q.add({fn:CY.bind(this.setPreventClickOn, this)}) ;
			this._showComments(commentDbIds, mouseXY[1], showingAll) ;
			this._animateTo(mouseXY[1]) ;
			this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
			this._q.run();
		}, this, null) ;
	},

	openComment : function(iComment) { 
		this._q.add({fn:CY.bind(this.setPreventClickOn, this)}) ;

		var y = gIComments.getTopPosition()[1] ;
		this._q.add({fn:function() {
			gIComments.open(iComment.commentId) ;
    		gIComments.refresh(iComment.commentId) ;
		}}) ;
		this._animateTo(y) ;
		
		this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
		this._q.run();
	},
	
	closeComment : function(iComment) { 
		checkForOpenedDialog(iComment, function() {
			this._q.add({fn:CY.bind(this.setPreventClickOn, this)}) ;
	
			var y = gIComments.getTopPosition()[1] ;
			this._q.add({fn:function() {
				var comment = gDb.getComment(iComment.commentId) ;
				gIComments.close(iComment.commentId) ;
		    	if (comment.reply_to_id != null)
		    		gIComments.refresh(comment.reply_to_id) ;
			}}) ;
			this._animateTo(y) ;
	
			this._q.add({fn:CY.bind(this.setPreventClickOff, this)}) ;
			this._q.run() ;
		}, this, null) ;
	},
	
	activate : function(iComment) {
		gIComments.activate(iComment.commentId) ;
	}
}
			
readyForAction = function () {
	return !gSync._iPreventClick ;
};
