// gConf
IComments = function() {
	// this class manages Comments interface (fetched comments <--> IComment.commentId != null)

	this._c = [] ; // IComments instances   // commentId == null means is connected to no comment anymore

	this._a = [] ; // IComments animations to run

	this._nbEndedAnim = 0 ;

	this._topActiveCommentDbId = null ; // active 
}

IComments.prototype = {
		init : function (container) {
			for (var i = 0 ; i < gConf['iCommentsInitAlloc']; i++) { 
				this._c.push(new IComment()) ;
			}
		},

		getIComment : function (commentId) {
			return CY.Array.find(this._c, function(iComment) { return (iComment.isfetched() && iComment.commentId == commentId) ;}) ;
		},
		
		insertAfter : function (previousComment, comment) {
			var _cids = CY.Array.map(this._c, function(iComment) { return iComment.commentId ; }) ;
			var index = CY.Array.indexOf(_cids, previousComment.id) ;
			if (index != -1) {
				this._c.splice(index + 1, 0, new IComment()) ; // will append when index + 1 == array length
				this._c[index + 1].fetch(comment) ;
				return this._c[index + 1] ;
			}
			return null ;
		},
		
		_remove : function (iComments) {
			var toRemoveIds = CY.Array.map(iComments, function(comment) { return comment.commentId ; }) ;
			
			for (var i = 0 ; i < this._c.length ; i++) { // starting at the bottom to be sure that last remove will be iComment  
				var iComment2 = this._c[i] ;
				if (iComment2.isfetched() && CY.Array.indexOf(toRemoveIds, iComment2.commentId) != -1) {
					
					iComment2.unfetch() ;

					this._c.push(this._c.splice(i, 1)[0]) ;
					
					i-- ;
				}
			}
		},
		
		// all children, comment's IComment included !
		// model based (cf. gDb)
		_getChildren : function (commentId) {
			return CY.Array.filter(this._c, function(iComment) { return (iComment.isfetched() && gDb.isChild(iComment.commentId,commentId)) ; }) ;
		},

		_getInvisibleChildren : function (commentId) {
			return CY.Array.filter(this._getChildren(commentId), function(iComment) { return (!iComment.isVisible()) ; }) ;
		},

		// REFRESH (readreplies link etc ?..)
		refresh : function (commentId) {
			
			var iComment = this.getIComment(commentId) ;

			var invisibleChildrenIComments = this._getInvisibleChildren(commentId) ;
			if (invisibleChildrenIComments.length > 0) //parentIComment is supposed to be visible
				iComment.showReadRepliesLnk() ;
			else
				iComment.hideReadRepliesLnk() ;
		},

		remove : function (commentId) {
			this._remove(this._getChildren(commentId)) ;
		},

		close : function (commentId) {
			CY.Array.each(this._getChildren(commentId), function (iComment) { iComment.hide() ; }) ;
		},

		open : function (commentId) {
			CY.Array.each(this._getChildren(commentId), function (iComment) { iComment.show() ; }) ;
		},

		fetch : function (comments) {
			// fill
			for (var i = 0 ; i < comments.length; i++) {
				if (i == this._c.length)
					this._c.push(new IComment()) ;
				
				this._c[i].fetch(comments[i]) ;
			}
			
			// nullify others
			for (var i = comments.length ; i < this._c.length ; i++) {
				this._c[i].unfetch() ;
			}
		},
		
		setPosition : function (xy) {
			CY.each(this._c, function (iComment) { iComment.setPosition(xy) ; }) ;
		},

		show : function () {
			CY.each(this._c, function (iComment) { 
				if (iComment.isfetched()) {
					iComment.show();
				}}) ;
		},
		
		hide : function () {
			this.deactivate(); // to prevent a chain of activate / deactivate while hiding IComments one by one
			CY.each(this._c, function (iComment) { if (iComment.commentId != null) iComment.hide(); }) ;
		},
		
		setWidth : function (colWidth) {
			var nextY = null ;
			for (var i = 0 ; i < this._c.length; i++) {
				var iComment = this._c[i] ;
				iComment.setWidth(colWidth) ;
				
				if (iComment.commentId != null && iComment.isVisible()) {
					var xy = iComment.getPosition() ;
					if (nextY == null) 
						nextY = xy[1] ;
					xy[1] = nextY ;
					iComment.setPosition(xy) ;
					nextY += iComment.getHeight() ;
				}
			}
		},

		getTopPosition:function() {
			for (var i = 0 ; i < this._c.length; i++) {
				var iComment = this._c[i] ;
				if (iComment.commentId != null && iComment.isVisible())
					return iComment.getPosition() ;
			}
			return null
		},

		getPosition:function(id) {
			for (var i = 0 ; i < this._c.length; i++) {
				var iComment = this._c[i] ;
				if (iComment.commentId == id && iComment.isVisible())
					return iComment.getPosition() ;
			}
			return null ;
		},

		setAnimationToPositions : function (y) {
			this._initAnimations();
			//CY.log(gPrefs.get('comments','threadpad')) ;
			var lpad = (gPrefs.get('comments','threadpad') == '1') ? gConf['iCommentThreadPadding'] : 0 ; // gIThreadPad ... TODO 'configurize'

			var nextY = y ;
			for (var i = 0 ; i < this._c.length;i++) {
				var iComment = this._c[i] ;
				if (iComment.isfetched && iComment.isVisible()) {
					var comment_path = gDb.getPath(gDb.getComment(iComment.commentId)) ;
					var iCommentX = ((comment_path.length - 1) * lpad) + gConf['iCommentLeftPadding'] ;

					if (nextY == null) {
						var xy = iComment.getPosition() ;
						nextY = xy[1] ;
					}
					
					this._a.push(iComment.setAnimationToPosition([iCommentX, nextY])) ;
					nextY += iComment.getHeight() ;
				}
			}
		},
		
		setAnimationToPositionsAndFocus : function (y, focusCommentId) {
			this._initAnimations();
			var lpad = (gPrefs.get('comments','threadpad') == '1') ? gConf['iCommentThreadPadding'] : 0 ;

			var nextY = y ;
			for (var i = 0 ; i < this._c.length;i++) {
				var iComment = this._c[i] ;
				if (iComment.isfetched && iComment.isVisible()) {
					var comment_path = gDb.getPath(gDb.getComment(iComment.commentId)) ;
					var iCommentX = ((comment_path.length - 1) * lpad) + gConf['iCommentLeftPadding'] ;

					if (nextY == null) {
						var xy = iComment.getPosition() ;
						nextY = xy[1] ;
					}
					
          if (iComment.commentId >= focusCommentId)
  					this._a.push(iComment.setAnimationToPosition([iCommentX, nextY], focusCommentId)) ;
          else
  					this._a.push(iComment.setAnimationToPosition([iCommentX, nextY])) ;
					nextY += iComment.getHeight() ;
				}
			}
		},
		
// ANIMATION FUNCTIONS		
		_initAnimations : function () {
			this._a = [] ;
			this._nbEndedAnim = 0 ; 		
		},
		
		runAnimations : function () {
			if (this._a.length == 0) // will occur when closing last displayed comment
				gSync.resetAutoContinue("animationRun") ;
			else 
				CY.each(this._a, function (animation) { animation.run() ; }) ;
		},
		
		whenAnimationsEnd : function () {
			gSync.resume() ; 		
		},
		
		whenAnimationsEndFocus : function () {
      gGETValues = CY.JSON.parse(sv_get_params);
      if ("comment_id_key" in gGETValues) {
        var id_key = gGETValues["comment_id_key"];
        var focusComment = gDb.getCommentByIdKey(id_key);
        if (focusComment != null)
          gIComments.getIComment(focusComment.id).overlay.focus();
      }
			gSync.resume();
		},
		
		animationsEnded : function () {
			return ((this._a.length == 0) || (this._a.length == this._nbEndedAnim)) ; 		
		},
		
		signalAnimationEnd : function () {
			this._nbEndedAnim++ ;					
		},
		
// ACTIVE RELATED FUNCTIONS		
		// returns true only for the top iComment
		isTopActive : function(commentDbId) {
			return ((commentDbId != null) && (this._topActiveCommentDbId == commentDbId)) ;
		},
		
		isAnyActive : function() {
			return (this._topActiveCommentDbId != null) ;
		},
		
		//warning : calling this function "focus" would make IE get mad
		activate : function(commentDbId) {
			
			if (this._topActiveCommentDbId != null) {// then deactivate current 
				this.deactivate() ;
			}

			// activate whole top parent thread
			var comment = gDb.getComment(commentDbId) ;
			var comment_path = gDb.getPath(comment) ;
			var topParent = comment_path[comment_path.length - 1] ;
			
			var iComments = this._getChildren(topParent.id) ;
			CY.Array.each(iComments, function(iComment){iComment.activate();}) ;

			this._topActiveCommentDbId = topParent.id ;

			// update browser index
			if (gLayout.isInFrame()) {
				var indxDict = gDb.browsingIndex(this._topActiveCommentDbId) ;
				parent.$("#browse_by option").each(function() {
					var rank = 1 + indxDict[this.value] ;
					parent.$("#c_browse_indx_"+this.value).html(''+ rank) ;
				}) ;
			}
			
			showScope(topParent.id) ;
		},
		
		deactivate : function() {
			if (this._topActiveCommentDbId != null) {
				parent.$("#browse_by option").each(function() {
					parent.$("#c_browse_indx_"+this.value).html('-') ;
				}) ;

				// scopes
				hideScopeAnyway() ;
				
				var iComments = this._getChildren(this._topActiveCommentDbId) ;
				CY.Array.each(iComments, function(iComment){iComment.deactivate();}) ;

				this._topActiveCommentDbId = null ;
			}
		},

		// active next IComment among the displayed ones (try below and if couldn't try above)
		// model based
		activateVisibleNext : function() {
			
			if (this._topActiveCommentDbId != null) {

				for (var j = 0 ; j < 2 ; j++) {
					
					var start = (j==0) ? 0 : this._c.length - 1 ; 
					
					var b = false ;
					
					for (var i = start ; (i >= 0) && i <= (this._c.length - 1) ;) {
						var iComment = this._c[i] ;
						
						if (iComment.commentId != null && iComment.isVisible()) {
							b = b || (gDb.isChild(iComment.commentId,this._topActiveCommentDbId)) ; 
							if (b && (!gDb.isChild(iComment.commentId,this._topActiveCommentDbId))) { // found the one below that doesn't have topActive as parent
								this.activate(iComment.commentId) ;
								return true ;
							}
						}
						i = (j == 0) ? i + 1 : i - 1 ;
					}
				}
			}
			return false ;
		},
		
		browse : function(order, whereto) {
			var wt = whereto ;
			if ((whereto == "prev") && !this.isAnyActive()) {
				wt = "last" ;
			}
			if ((whereto == "next") && !this.isAnyActive()) {
				wt = "first" ;
			}
			return gDb.browse(order, wt, this._topActiveCommentDbId) ;
		}
		
}
