// globals used: gConf, gPrefs, gLayout, gSync


// IComment == IHM comment class 
IComment = function() {
	
	this.commentId = null ;
	
	var iCommentWidth = gLayout.getTopICommentsWidth() ;	
	var iCommentLeft = gConf['iCommentLeftPadding'] ;
	
	var changeToPending = gettext("change comment state to pending") ;
	var changeToApprove = gettext("change comment state to approved") ;
	var changeToUnapprove= gettext("change comment state to unapproved") ;
	var cancelChange = gettext("cancel changing the state of this comment") ;
	var pending = gettext("pending") ;
	var approved = gettext("approved") ;
	var unapproved = gettext("unapproved") ;
	var cancel = gettext("cancel") ;
	var showReplies = gettext("show replies") ;
	var changeTo= gettext("change to:") ;
	var reply = ngettext("reply","replies",1) ; // hack to get django to add 'replies' as the plural in f_text_view_frame !!
	var editComment = gettext("edit comment") ;
	var deleteComment = gettext("delete comment") ;
	var edit = gettext("edit") ;
	var del = gettext("delete") ;
	var close = gettext("close") ;
	var showScope = gettext("show scope") ;
	var scopeRemoved = gettext("Comment is detached: it was created on a previous version and text it applied to has been modified or removed.") ;
	
	// no header, no body yet 
	this.overlay = new CY.Overlay( {
		zIndex :3,
		shim :false, /* until we really need it, no shim */
		visible :false,
		width : iCommentWidth,
		xy : [ iCommentLeft, 0 ],
		headerContent :	'<div class="icomment-header">' +
							'<div class="c-iactions">' +  
								'<a class="c-moderate c-action" title="">'+ "vis" +'</a>' + " " +  
								'<a class="c-edit c-action" title="'+ editComment +'" alt="' + editComment + '">' + edit + '</a>' + " " +   
								'<a class="c-delete c-action" title="'+ deleteComment +'" alt="' + deleteComment + '">' + del + '</a>' + " " +   
							'</div>' +
							'<div class="c-state-actions displaynone">' +
								changeTo + '&nbsp;' +
								'<a class="c-state-pending c-action" title="' + changeToPending + '" alt="' + changeToPending + '">'+ pending +'</a>' + " " +  
								'<a class="c-state-approved c-action" title="' + changeToApprove + '" alt="' + changeToApprove + '">'+ approved +'</a>' + " " +  
								'<a class="c-state-unapproved c-action" title="' + changeToUnapprove + '" alt="' + changeToUnapprove + '">'+ unapproved +'</a>' + " " +  
								'<a class="c-state-cancel c-action" title="' + cancelChange + '" alt="' + cancelChange + '">' + cancel +'</a>' + " " +  
							'</div>' + 
							'<div class="c-no-scope-msg">' +
								scopeRemoved +  
							'</div>' + 
							'<a class="c-show-scope c-action" title="'+ showScope + '" alt="' + showScope + '"><em>-</em></a>' +
							'<a class="c-close c-action" title="'+ close + '" alt="' + close + '"><em>X</em></a>' +
						'</div>',
		bodyContent :	'<div class="icomment-body">' +
						'<span class="c-content"></span>' +
						'<span class="c-ireplyactions">' +
						'<a class="c-readreplies c-action" title="'+ showReplies +'" alt="' + showReplies + '">' + showReplies +'</a>' + " " +  
						'<a class="c-reply c-action" title="'+ reply +'" alt="' + reply + '">' + reply +'</a>' + "&nbsp;" +  
						'</span>' +
						'</div>'
	});
	
	this.overlay.get('contentBox').addClass("c-comment") ;
	
	// attach to DOM
	this.overlay.render('#leftcolumn');
	
	this.animation = new CY.Anim({
        node: this.overlay.get('boundingBox'),
        duration: gPrefs.get('general','animduration'),
        easing: CY.Easing.easeOut
    });		

	// CY.on won't work 
	this.overlay.get('contentBox').query(".c-close").on("click", this.onCloseCommentClick, this);
	this.overlay.get('contentBox').query(".c-moderate").on("click", this.onModerateCommentClick, this);
	this.overlay.get('contentBox').query(".c-state-pending").on("click", this.onPendingCommentClick, this);
	this.overlay.get('contentBox').query(".c-state-approved").on("click", this.onApprovedCommentClick, this);
	this.overlay.get('contentBox').query(".c-state-unapproved").on("click", this.onUnapprovedCommentClick, this);
	this.overlay.get('contentBox').query(".c-state-cancel").on("click", this.onCancelStateChangeClick, this);
	this.overlay.get('contentBox').query(".c-edit").on("click", this.onEditCommentClick, this);
	this.overlay.get('contentBox').query(".c-delete").on("click", this.onDeleteCommentClick, this);
	this.overlay.get('contentBox').query(".c-reply").on("click", this.onReplyCommentClick, this);
	this.overlay.get('contentBox').query(".c-readreplies").on("click", this.onReadRepliesCommentClick, this);

	this.overlay.get('contentBox').query(".icomment-header").on("mouseenter", this.onMouseEnterHeader, this);
	this.overlay.get('contentBox').query(".icomment-header").on("mouseleave", this.onMouseLeaveHeader, this);
	
	this.overlay.get('contentBox').on("click", this.onCommentClick, this);
}

IComment.prototype = {
	// checking readyForAction is not enough because handler could be called after animation end in the case : 
	// close btn is clicked before animation end (so before overlay gets hidden) but handler is called after so preventClickOn is false and close is called on an invisible overlay.
	// (whan clicking very fast on the close button while close animation is taking place).
	// SO : SHOULD ALWAYS CHECK FOR VISIBLE OVERLAY IN HANDLERS THAT COULD BE CALLED FROM AN ANIMATED OVERLAY
	onCloseCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) 
			gSync.closeComment(this) ;
	},
	onModerateCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) {
			this.overlay.get('contentBox').query(".c-iactions").addClass("displaynone") ;
			this.overlay.get('contentBox').query(".c-state-actions").removeClass("displaynone") ;
		}
	},
	onPendingCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) {
			gSync.moderateComment(this, 'pending') ;
		}
	},
	onApprovedCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) {
			gSync.moderateComment(this, 'approved') ;
		}
	},
	onUnapprovedCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) {
			gSync.moderateComment(this, 'unapproved') ;
		}
	},
	onCancelStateChangeClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) {
			this.overlay.get('contentBox').query(".c-iactions").removeClass("displaynone") ;
			this.overlay.get('contentBox').query(".c-state-actions").addClass("displaynone") ;
		}
	},
	onDeleteCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) {
			gSync.removeComment(this) ;
		}
	},
	onEditCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) 
			gSync.showEditForm(this) ;
	},
	onReplyCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) 
			gSync.showReplyForm(this) ;
	},
	onReadRepliesCommentClick : function (e) {
		e.halt() ; // prevent click triggered on content box
		if (readyForAction() && this.isVisible()) 
			gSync.openComment(this) ;
	},
	onCommentClick : function (e) {
		if (readyForAction() && this.isVisible()) {
			// first condition here is checking it's not clicked via a 'show comments' 	link
			if (e.target.get("target") == "_blank") {
				var link = e.target ;
				var showCommentUrl = sv_site_url + sv_text_view_show_comment_url ;
				if (link.get('href').indexOf(showCommentUrl) == 0) { 
					var res = (new RegExp('comment_id_key=([^&]*)', "g")).exec(link.get('href')) ;
					if (res != null) {
						// open new comment .... we'll suppose it satisfies the filter for now
						// TODO : should we reset the filter in this case ? instead of having the link open in a new window
						var id_key = res[1] ;
						var comment = gDb.getCommentByIdKey(id_key) ;
						if (comment != null) {
							e.halt() ;
							if (!link.hasClass("c-permalink")) {// clicking on the permalink itself should do anything
								checkForOpenedDialog(null, function() {
									gSync.showSingleComment(comment) ;
								}) ;
							}
						}
					}
				}
			}
			else {
				if (gShowingAllComments) {
					// next special dirty case test explained : when editing/replying to a comment with gShowingAllComments a click in the edit/reply form also is a click on the iComment, in this case we don't want to showSingleComment ....
					// should be handled via a preventDefault in some way
					if (!this._isHostingAForm()) {
						var comment = gDb.getComment(this.commentId) ;
						checkForOpenedDialog(null, function() {
							if (comment != null) 
								gSync.showSingleComment(comment) ;
						})
					}
				}
				else 
					gSync.activate(this) ;
			}
		}
	},	
	
	onMouseEnterHeader : function () {
		if (readyForAction() && this.isVisible() && (sv_prefix=="")) {
			this.overlay.get('contentBox').query(".c-permalink").removeClass('displaynone');
		}
	},
	
	onMouseLeaveHeader : function () {
		if (readyForAction() && this.isVisible() && (sv_prefix=="")) {
			this.overlay.get('contentBox').query(".c-permalink").addClass('displaynone');
		}
	},	
	
	setWidth : function(width) {
	    this.overlay.get('boundingBox').setStyle("width", width + 'px');
	},
	
	activate:function() {
		// debug !!
//		CY.log('activate' + this.commentId) ;
		this.overlay.get('boundingBox').addClass('c-focus-comment') ;
		
	},
	
	deactivate:function() {
		// debug !!
//		CY.log('deactivate' + this.commentId) ;
		this.overlay.get('boundingBox').removeClass('c-focus-comment') ;
		
	},
	hide:function() {
		// is IComment the top active one ?
		if (gIComments.isTopActive(this.commentId)) { // then try to activate next in displayed list
			if (!gIComments.activateVisibleNext())
				gIComments.deactivate() ;
		}

		if (this.isVisible()) {
			this.overlay.hide();
			this.overlay.blur() ;
		}
	},
	hideContent:function() {
		this.overlay.get('contentBox').query(".icomment-header").addClass('displaynone') ;
		this.overlay.get('contentBox').query(".icomment-body").addClass('displaynone') ;
	},
	showContent:function() {
		this.overlay.get('contentBox').query(".icomment-header").removeClass('displaynone') ;
		this.overlay.get('contentBox').query(".icomment-body").removeClass('displaynone') ;
	},
	isVisible:function() {
		return this.overlay.get('visible') ;
	},
	show:function() {
		this.hideReadRepliesLnk() ; // for now
		return this.overlay.show() ;
	},
	showReadRepliesLnk:function() {
		this.overlay.get('contentBox').query(".c-readreplies").removeClass('displaynone') ;
	},
	hideReadRepliesLnk:function() {
		this.overlay.get('contentBox').query(".c-readreplies").addClass('displaynone') ;
	},
	changeModeration:function(comment) {
		var moderationLnk = this.overlay.get('contentBox').query(".c-moderate") ;
		moderationLnk.set("innerHTML", gettext(comment.state)) ;
		
		moderationLnk.removeClass("c-state-approved") ;
		moderationLnk.removeClass("c-state-pending") ;
		moderationLnk.removeClass("c-state-unapproved") ;
		moderationLnk.addClass("c-state-" + comment.state) ;

		this.overlay.get('contentBox').query(".c-iactions").removeClass("displaynone") ;
		this.overlay.get('contentBox').query(".c-state-actions").addClass("displaynone") ;
	},
	isfetched : function() {
		return (this.commentId != null) ;
	},
	unfetch : function() {
		this.commentId = null ;
	},
	fetch : function(comment) {
		this.commentId = comment.id ;
		var boundingBoxNode = this.overlay.get('boundingBox') ;
		
		if (comment['start_wrapper'] != -1){ 
			boundingBoxNode.addClass('c-has-scope') ;
			boundingBoxNode.removeClass('c-has-no-scope') ;
		}
		else { 
			boundingBoxNode.addClass('c-has-no-scope') ;
			boundingBoxNode.removeClass('c-has-scope') ;
		}
		
		if (comment['reply_to_id'] != null){ 
			boundingBoxNode.addClass('c-is-reply') ;
		}
		else { 
			boundingBoxNode.removeClass('c-is-reply') ;
		}
		
		// TITLE
		var titleInfos = interpolate(gettext('last modified on %(date)s'),{'date':comment.modified_user_str}, true) ;
		
		var modifDateTooltip = (comment.modified == comment.created) ? '' : '<a title="' + titleInfos + '"> * </a>' ;
		var permaTitle = gettext('Permalink to this comment') ;
		var permalink = "";
		if (sv_prefix=="") {
			permalink = '<a class="c-permalink displaynone c-action" target="_blank" title="'+ permaTitle +'" href="" >¶&nbsp;</a>' ;
		}
		
		var infos = interpolate(gettext('by %(name)s, created on %(date)s'),{'name':comment.name, 'date':comment.created_user_str}, true) ;
		
		var newTitleContent = '<span class="c-header"><div class="c-header-title">' + comment.title + permalink + '</div><div class="c-infos">' + infos + '</div></span>' ;
		
		var newTitleNode = CY.Node.create(newTitleContent) ;
		var prevTitleNode = boundingBoxNode.query(".c-header") ;
		if (prevTitleNode == null) // first time, no title yet
			boundingBoxNode.query('.icomment-header').insertBefore(newTitleNode, boundingBoxNode.one('.c-iactions')) ;
		else 
			prevTitleNode.get('parentNode').replaceChild(newTitleNode, prevTitleNode) ;

		// TAG
		var newTagNode = CY.Node.create('<div class="c-tags"><span class="c-tags-infos">' + 'tags:' + '</span>' + comment.tags + '</div>') ;
		var prevTagNode = boundingBoxNode.query(".c-tags") ;
		if (prevTagNode == null) 
			boundingBoxNode.query('.icomment-header').appendChild(newTagNode) ;
		else 
			prevTagNode.get('parentNode').replaceChild(newTagNode, prevTagNode) ;
		// NO TAG ?
		if (comment.tags == "")
			newTagNode.addClass('displaynone') ;

		// CONTENT
		var newContentNode = CY.Node.create('<span class="c-content">' + comment.content_html + '</span>') ;
		var prevContentNode = boundingBoxNode.query(".c-content") ;
		if (prevContentNode == null) 
			boundingBoxNode.query('.icomment-body').appendChild(newContentNode) ;
		else 
			prevContentNode.get('parentNode').replaceChild(newContentNode, prevContentNode) ;

		// PERMALINK
		if (sv_prefix=="") {
			boundingBoxNode.query(".c-permalink").set("href",sv_site_url + comment.permalink) ;
		}

		// MODERATION
		this.changeModeration(comment) ;
/* useless : use implemendted permanentlink instead
 * 
		// also change link title to give users the possibility to know comment id (to be able to reference this exact comment in GET arguments) 
		var moderationLnk = this.overlay.get('contentBox').query(".c-moderate") ;
		//var cid = (comment.reply_to_id == null) ? this.commentId : "" ;
		moderationLnk.set("title", "click to change comment ID visibility".replace(/ID/, this.commentId).replace(/  /, " ")) ;
		
 */		
		// open links in new window :
		var links = boundingBoxNode.queryAll(".c-content a") ;
		if (links != null)
			links.setAttribute( "target" , "_blank" ) ;
		links = boundingBoxNode.queryAll(".c-header-title a") ;
		if (links != null)
			links.setAttribute( "target" , "_blank" ) ;
		
		this.permAdapt(comment) ;
	},

	permAdapt : function(comment) {
		// this comment permissions 
		var delLnk = this.overlay.get('contentBox').query(".c-delete") ; 
		if (delLnk) {	// there will be a server side check anyway
			if (!comment.can_delete)
				delLnk.addClass('displaynone') ;
			else 
				delLnk.removeClass('displaynone') ;
		}

		var editLnk = this.overlay.get('contentBox').query(".c-edit") ; 
		if (editLnk) {	
			if (!comment.can_edit) 
				editLnk.addClass('displaynone') ;
			else 
				editLnk.removeClass('displaynone') ;
		}
		
		var replyLnk = this.overlay.get('contentBox').query(".c-reply") ;
		if (replyLnk) {
			if (!hasPerm("can_create_comment"))
				replyLnk.addClass('displaynone') ;
			else 
				replyLnk.removeClass('displaynone') ;
		}

		var moderateLnk = this.overlay.get('contentBox').query(".c-moderate") ; 
		if (moderateLnk) {	
			if (!comment.can_moderate)  
				moderateLnk.addClass('displaynone') ;
			else 
				moderateLnk.removeClass('displaynone') ;
		}
	},
	setThreadPad : function(pad) { // TODO review ...
		this.overlay.get('contentBox').query('.yui-widget-hd').setStyle('paddingLeft', pad + 'px') ;
		this.overlay.get('contentBox').query('.yui-widget-bd').setStyle('paddingLeft', pad + 'px') ;
		
	},
	setPosition : function(xy) {
		var boundingBoxNode = this.overlay.get('boundingBox') ;

	    boundingBoxNode.setStyle("opacity", 1); // TODO check this is still usefull
	   	boundingBoxNode.setXY(xy) ;
	},
	getPosition : function(xy) {
		var boundingBoxNode = this.overlay.get('boundingBox') ;

	   	return boundingBoxNode.getXY() ;
	},
	onAnimationEnd : function() {
		if (!CY.Lang.isUndefined(this['animation-handle']) && !CY.Lang.isNull(this['animation-handle'])) { 
			this['animation-handle'].detach() ;
			this['animation-handle'] = null ;
//			CY.log('detached...') ;
		}
		gIComments.signalAnimationEnd() ;
		if (gIComments.animationsEnded())
			gIComments.whenAnimationsEnd() ;		
	},
	onAnimationEndFocus : function() {
		if (!CY.Lang.isUndefined(this['animation-handle']) && !CY.Lang.isNull(this['animation-handle'])) { 
			this['animation-handle'].detach() ;
			this['animation-handle'] = null ;
//			CY.log('detached...') ;
		}
		gIComments.signalAnimationEnd() ;
		if (gIComments.animationsEnded())
			gIComments.whenAnimationsEndFocus() ;		
	},

	//aa = new CY.Anim({node:gIComments._c[0].overlay.get('boundingBox'), to:{xy : [0,0]}, duration:2.0})
	setAnimationToPosition : function(toXY, focus) {
		var boundingBoxNode = this.overlay.get('boundingBox') ;
		
		// ANIMATION
	    // 2 lines of optim that could be removed (0.011)
		if (gPrefs.get('general','animduration') < 0.011) 
	    	boundingBoxNode.setXY(toXY) ;
		
		this.animation.set('to', { xy: toXY});
		this.animation.set('duration', gPrefs.get('general','animduration')) ; // shouldn't be here really ...
    if (focus)
    	this['animation-handle'] = this.animation.on('end', this.onAnimationEndFocus, this);
    else
    	this['animation-handle'] = this.animation.on('end', this.onAnimationEnd, this);
		
		return this.animation ;
	},
	getHeight : function() {
		return this.overlay.get('boundingBox').get('offsetHeight') ;
	},
	scrollIntoView : function() {
		//this.isVisible() && 
		if (!this.overlay.get('contentBox').inViewportRegion())
			this.overlay.get('contentBox').scrollIntoView(true) ;
	},
	_isHostingAForm : function() {
		return (this.isVisible() && ((gNewReplyHost != null && gNewReplyHost == this) || (gEditICommentHost != null && gEditICommentHost == this)));
	}

}
