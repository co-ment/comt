Db = function() {
	//initial comment db as objs (TREE LIKE MODEL : replies are included in comment.replies)
	this.comments = null; // current set of (filtered) comments 
	this.allComments = null; // all server database comments

	// obj
	// keys : commentDbId as string	
	// values : comment db as obj
	this.commentsByDbId = {};
	this.allCommentsByDbId = {};
	
	// dictionary (always contains all comments (no reply) whatever the filter
	// order key --> ordered array of comment ids (no reply)
	this.ordered_comment_ids = {}; // all server database comments
	
}

Db.prototype = {
		
//////////////////////////////
//		CORE FUNCTIONS
//////////////////////////////
	init : function() {
		// at first server side ordered comment by asc ids, replies by creation date :
		this.allComments = CY.JSON.parse(sv_comments) ;
		if (sv_read_only) {
			this.initToReadOnly() ;
		}
		
	    this._computeAllCommentsByDbId() ;
	    
	    this._reorder() ;
	},
	
	_del : function (arr, dic, id) {
		// first recursively remove all replies
		var comment = dic[id] ;
		
		for (var i = 0 ; i < comment.replies.length ; i++) {
			var rid = comment.replies[i].id ;
			this._del(comment.replies, dic, rid) ;
			i--;
		}
		
		for (var i = 0, ilen = arr.length ; i < ilen ; i++) {
			if (arr[i].id == id) {
				arr.splice(i, 1) ;
				delete dic[id] ;
				break ;
			}
		}
	},

	del : function(comment) {
		var arr = (comment.reply_to_id == null) ? this.comments : this.commentsByDbId[comment.reply_to_id].replies ; 
		this._del(arr, this.commentsByDbId, comment.id) ;
		arr = (comment.reply_to_id == null) ? this.allComments : this.allCommentsByDbId[comment.reply_to_id].replies ; 
		this._del(arr, this.allCommentsByDbId, comment.id) ;
		
		this._reorder() ;
		
	},
	
	// maintains the ordered lists
	_reorder : function() {
		
		// scope (order by start_wrapper, start_offset, end_wrapper, end_offset 
		var a = [] ;
	    
		for (var i = 0, ilen = this.allComments.length ; i < ilen ; i++) {
			
			var comment = this.allComments[i] ;
			var found = false ;

			for (var j = 0, jlen = a.length ; j < jlen ; j++) {
				
				var id = a[j] ;
				var comment2 = this.allCommentsByDbId[id] ;
				
				if ((comment.start_wrapper < comment2.start_wrapper)
					||
					((comment.start_wrapper == comment2.start_wrapper) && (comment.start_offset < comment2.start_offset) )
					||
					((comment.start_wrapper == comment2.start_wrapper) && (comment.start_offset == comment2.start_offset) && (comment.end_wrapper < comment2.end_wrapper) ) 
					||
					((comment.start_wrapper == comment2.start_wrapper) && (comment.start_offset == comment2.start_offset) && (comment.end_wrapper == comment2.end_wrapper) && (comment.end_offset < comment2.end_offset) ) ) {
						a.splice(j, 0, comment.id) ;
						found = true ;
						break ;
					}
			}
			if (!found)  {
				a.push(comment.id) ;
			}
		}
		this.ordered_comment_ids['scope']  = a ;
		
		// modified thread  
		a = [] ;
		var mod = {} ; // we'll aggregate modification dates in this assoc array id --> latest modification
	    
		for (var i = 0, ilen = this.allComments.length ; i < ilen ; i++) {
			
			var comment = this.allComments[i] ;
			var commentModif = comment.modified ;
			
			mod[comment.id] = commentModif ; 

			for (var j = 0, jlen = comment.replies.length ; j < jlen ; j++) {
				
				var reply = comment.replies[j] ;
				var replyModif = reply.modified ;

				if (replyModif > mod[comment.id])
					mod[comment.id] = replyModif ;
			}
		}
		
		for (var id in mod) {
			var numberId = this.allCommentsByDbId[id].id			
			var found = false ;
			for (var i = 0, ilen = a.length ; i < ilen ; i++) {
				var id2 = a[i] ;
				
				if (mod[id] < mod[id2]) {
					a.splice(i, 0, numberId) ;
					found = true ;
					break ;
				}
				
			}
			if (!found)  {
				a.push(numberId) ;
			}
		}
		
		this.ordered_comment_ids['modif_thread'] = a ; 
	},

	// EDIT OR ADD CASE : when just added id is max and so both (comments and replies) initial id asc order remains
	_upd : function(arr, dic, c) {
		var found = false ;
		for (var i = 0, ilen = arr.length ; i < ilen ; i++) {
			if (arr[i].id == c.id) { // edit
				arr.splice(i, 1, c) ;
				found = true ;
				break ;
			}
		}
		
		if (!found) { // add
			arr.push(c) ;
		}
		
		dic[c.id] = c ;
	},

	// EDIT OR ADD CASE : when just added id is max and so both (comments and replies) initial id asc order respected
	upd : function(comment) {
		var arr = (comment.reply_to_id == null) ? this.allComments : this.allCommentsByDbId[comment.reply_to_id].replies ; 
		this._upd(arr, this.allCommentsByDbId, comment) ;
		
		var cloneComment = CY.clone(comment) ;
		
		arr = (comment.reply_to_id == null) ? this.comments : this.commentsByDbId[comment.reply_to_id].replies ; 
		this._upd(arr, this.commentsByDbId, cloneComment) ;
		
		this._reorder() ;		
		
	},

	// initializes this.comments
	// commentId is the result of a computeFilterResults call : no assumption can be made on the order of ids (!)
	// so we'll loop through allComments to carry order from allComments to comments
	initComments : function(commentIds) {
	    this.comments = [] ;
		for (var i = 0, ilen = this.allComments.length ; i < ilen ; i++) {
			
			var index = CY.Array.indexOf(commentIds, this.allComments[i].id) ;
			if (index != -1) {
				
				var cloneComment = CY.clone(this.allComments[i]) ;
				
				this.comments.push(cloneComment) ;
			}
		}
	    this._computeCommentsByDbId() ;
	},

	_computeCommentsByDbId : function() {
		this.commentsByDbId = {} ;
	    var flatComments = this.getThreads(this.comments) ;
		for ( var i = 0; i < flatComments.length; i++)
			this.commentsByDbId[flatComments[i].id] = flatComments[i];
	},
	
	_computeAllCommentsByDbId : function() {
		this.allCommentsByDbId = {} ;
	    var flatComments = this.getThreads(this.allComments) ;
		for (var i = 0; i < flatComments.length; i++) 
			this.allCommentsByDbId[flatComments[i].id] = flatComments[i];
	},
	
	// returns threads :
	// given an array [comment1, comment2, comment3], this function will return [comment1, comment1reply1, comment1reply1reply1, comment1reply1reply2, comment2, comment3, comment3reply1]
	//note : will return top parents ordered the way comments are
	getThreads : function(comments) {
		var ret = [] ;

		for (var i = 0 ; i < comments.length ; i++) {
			ret.push(comments[i]) ;
			if (comments[i].replies.length > 0)
				ret = ret.concat(this.getThreads(comments[i].replies)) ;
		}
		return ret ;
	},
	_getPath : function(dic, comment) {
		var ret = [comment] ;
		
		var c = comment ;
		while (c.reply_to_id != null) {
			c = dic[c.reply_to_id] ;
			ret.push(c) ;
		}
			
		return ret ;
	},
	// returns comments as array : [comment, ..., comment's top parent]
	getPath : function(comment) {
		return this._getPath(this.commentsByDbId, comment) ;
	},
	// getCommentFromIComment ...
	getComment : function(dbId) {
		return this.commentsByDbId[dbId] ;
	},	
	
	getCommentByIdKey : function(id_key) {
		for (var id in this.commentsByDbId) {
			var comment = this.commentsByDbId[id] ;
			if (comment.id_key == id_key) { 
				return comment ;
			}
		}
		return null ;
	},	
	
	isChild : function(commentDbId, parentDbId) {
		var comment = this.commentsByDbId[commentDbId] ;
		
		var isChild = (commentDbId == parentDbId) ;
		
		while ((!isChild) && (comment.reply_to_id != null)) {
			comment = this.commentsByDbId[comment.reply_to_id] ;
			isChild = (comment.id == parentDbId) ; ;
		}
		return isChild ;
	},	
	
	initToReadOnly : function(commentDbId, parentDbId) {
		for (var i = 0, ilen = this.allComments.length ; i < ilen ; i++) {
			var comment = this.allComments[i] ;
			for (var prop in comment) {
				if (0 == prop.indexOf("can_") && typeof comment[prop] === 'boolean')
					comment[prop] = false ;
			}
		}
	},	
	
//////////////////////////////
//	BROWSING FUNCTIONS
//////////////////////////////

	browsingIndex : function(dbId) {
		var indx = {} ;
		for (var order in this.ordered_comment_ids) {
			var inFilter =  CY.Array.filter(this.ordered_comment_ids[order], function(id) {return (id in this.commentsByDbId);}, this) ;
			indx[order] = CY.Array.indexOf(inFilter, dbId ) ;
		}
		//indx['total'] = this.ordered_comment_ids['scope'].length
		return indx ;
	},
	
	browse : function(order, whereto, dbId) {
		//var arr = this.ordered_comment_ids[gConf['defaultBrowsingOrder']] ;
//		CY.log(order) ;
		var arr = this.ordered_comment_ids[order] ;
		if (arr.length > 0) {
		
			var starti = -1 ; 
			if ((whereto == 'prev') || (whereto == 'next')) {
				
				for (var i = 0 ; i < arr.length ; i++) {
					var id = arr[i] ;
					if (id == dbId) {
						starti = (whereto == 'prev') ? i - 1 : i + 1 ;
						starti = (arr.length + starti) % arr.length ; // to guaranty a positive value 
						break ;
					}
				}
				if (starti == -1) {
					CY.error("internal error in db browse (was called with a dbId that isn't among the filtered ones)") ;
					return null;
				}
			}
			if (whereto == 'last') {
				starti = arr.length - 1 ;
			}
			if (whereto == 'first') {
				starti = 0 ;
			}
	
			for (var i = starti, j = 0 ; (i >= 0) && (i < arr.length) ; j++ ) {
				var id = arr[i] ;
				if (id in this.commentsByDbId) // checking id is among the filtered ones
					return this.commentsByDbId[id] ;
				if ((whereto == 'prev') || (whereto == 'last')) 
					i = i - 1 ;
				else  
					i = i + 1 ;
				i = (arr.length + i) % arr.length ; // to guaranty a positive value
				if (j > arr.length)// to prevent an infinite loop
					break ;
			}
			
			CY.error("internal error in db browse (could not find any filtered comment)") ;
		}
		return null;
	},
	
//////////////////////////////
//	FILTER FUNCTIONS
//////////////////////////////
	
	//returns the list of commentIds satisfying the filter
	computeFilterResults : function(filterGETValues) {
	    var filterData = {} ;
	    if (filterGETValues) {
			for (key in filterGETValues) {
				if (key.indexOf('filter_') == 0) 
					filterData[key.substr('filter_'.length)] = filterGETValues[key];
			}
	    }
	    else {
			if (gLayout.isInFrame()) 
				filterData = parent.f_getFrameFilterData() ;
	    }

		var cWithNameIds = [] ;
		var rWithNameIds = [] ;
		var filterName = "" ;
		if ('name' in filterData)
			filterName = filterData['name'] ;
		this.filterByName(filterName, cWithNameIds, rWithNameIds) ;
		
		var cAfterDateIds = [] ;
		var rAfterDateIds = [] ;
		var filterDate = "" ;
		if ('date' in filterData)
			filterDate = filterData['date'] ;
		this.filterByDate(filterDate, cAfterDateIds, rAfterDateIds) ;

		var cWithTextIds = [] ;
		var rWithTextIds = [] ;
		var filterText = "" ;
		if ('text' in filterData)
			filterText = filterData['text'] ;
		this.filterByText(filterText, cWithTextIds, rWithTextIds) ;
		
		var cWithTagIds = [] ;
		var rWithTagIds = [] ;
		var filterTag = "" ;
		if ('tag' in filterData)
			filterTag = filterData['tag'] ;
		this.filterByTag(filterTag, cWithTagIds, rWithTagIds) ;
		
		var cWithStateIds = [] ;
		var rWithStateIds = [] ;
		var filterState = "" ;
		if ('state' in filterData)
			filterState = filterData['state'] ;
		this.filterByState(filterState, cWithStateIds, rWithStateIds) ;
		
		
		var commentIds = [] ;
		var replyIds = [] ;
		// find intersections
		for (var i = 0, ilen = cWithNameIds.length ; i < ilen ; i++) {
			var id = cWithNameIds[i] ;
			if ((CY.Array.indexOf(cAfterDateIds, id) != -1) && (CY.Array.indexOf(cWithTextIds,id) != -1) && (CY.Array.indexOf(cWithTagIds,id) != -1) && (CY.Array.indexOf(cWithStateIds,id) != -1)) {
				commentIds.push(id) ; 
			}
		}
		
		for (var i = 0, ilen = rWithNameIds.length ; i < ilen ; i++) {
			var id = rWithNameIds[i] ;
			if ((CY.Array.indexOf(rAfterDateIds,id) != -1) && (CY.Array.indexOf(rWithTextIds,id) != -1) && (CY.Array.indexOf(rWithTagIds,id) != -1) && (CY.Array.indexOf(rWithStateIds,id) != -1)) {
				replyIds.push(id) ; 
			}
		}
		
		var nbReplies = replyIds.length, nbComments = commentIds.length ;
		var nbDiscussions = nbComments ;
		
		// look for comments to add because a reply satisfies the filter
//		CY.log('replyIds:') ;
//		CY.log(replyIds) ;
//		CY.log('this.allCommentsByDbId :');CY.A
//		CY.log(this.allCommentsByDbId);
		for (var i = 0, ilen = replyIds.length ; i < ilen ; i++) {
			var id = replyIds[i] ;
			var reply = this.allCommentsByDbId[id] ;
			var parents = this._getPath(this.allCommentsByDbId, reply) ;
			var topComment = parents[parents.length - 1] ;
			var id = topComment.id ;
			if (CY.Array.indexOf(commentIds,id) == -1) {
				commentIds.push(id) ;
				nbDiscussions++ ;
			}
		}
		
		return {'commentIds': commentIds,'nbDiscussions':nbDiscussions, 'nbComments':nbComments, 'nbReplies':nbReplies} ;
	},

	filterByText : function(text, cWithTextIds, rWithTextIds) {
		var re = new RegExp(text, "gi");
		for (var id in this.allCommentsByDbId) {
			var comment = this.allCommentsByDbId[id] ;
			if (text == "" || re.exec(comment.title) != null || re.exec(comment.content) != null) { // search only in the comment (not the comment scope) for now
				if (comment.reply_to_id == null) 
					cWithTextIds.push(comment.id);
				else 
					rWithTextIds.push(comment.id) ;
			}
		}
	},

	filterByName : function(name, cWithNameIds, rWithNameIds) {
		for (var id in this.allCommentsByDbId) {
			var comment = this.allCommentsByDbId[id] ;
			if (name == "" || comment.name == name) { // sensitive exact match for now
				if (comment.reply_to_id == null) 
					cWithNameIds.push(comment.id);
				else 
					rWithNameIds.push(comment.id) ;
			}
		}
	},

	// warning : tags are case sensitive
	filterByTag : function(tag, cWithTagIds, rWithTagIds) {
		// cf ", ".join... in client.py	
		var re0 = new RegExp("^" + tag + "$", "g"); 
		var re1 = new RegExp("^" + tag + ", ", "g");
		var re2 = new RegExp(", " + tag + ", ", "g"); 
		var re3 = new RegExp(", " + tag + "$", "g"); 
		for (var id in this.allCommentsByDbId) {
			var comment = this.allCommentsByDbId[id] ;
			if (tag == "" || re0.exec(comment.tags) || re1.exec(comment.tags) != null || re2.exec(comment.tags) != null || re3.exec(comment.tags) != null) { // search only in the comment (not the comment scope) for now
				if (comment.reply_to_id == null) 
					cWithTagIds.push(comment.id);
				else 
					rWithTagIds.push(comment.id) ;
			}
		}
	},

	filterByState : function(state, cWithStateIds, rWithStateIds) {
		for (var id in this.allCommentsByDbId) {
			var comment = this.allCommentsByDbId[id] ;
			if (state == "" || comment.state == state) { 
				if (comment.reply_to_id == null) 
					cWithStateIds.push(comment.id);
				else 
					rWithStateIds.push(comment.id) ;
			}
		}
	},

	filterByDate : function(date_str, cAfterDateIds, rAfterDateIds) {
		var date = (date_str == "") ? 0 : parseInt(date_str) ;
		for (var id in this.allCommentsByDbId) {
			var comment = this.allCommentsByDbId[id] ;
			if (comment.modified > date) { 
				if (comment.reply_to_id == null) 
					cAfterDateIds.push(comment.id); 
				else 
					rAfterDateIds.push(comment.id) ;
			}
		}
	},
//	filterByDate : function(date_str, cAfterDateIds, rAfterDateIds) {
//		var date = (date_str == "") ? "" : Date.parseDate(date_str, sv_client_date_fmt).getTime() ;
//		for (var id in this.allCommentsByDbId) {
//			var comment = this.allCommentsByDbId[id] ;
//			// TODO : created should be the date not a string !!
//			var create_date = (date_str == "") ? "" : Date.parseDate(comment.created_str, sv_client_date_fmt).getTime() ;
//			if (date_str == "" || create_date > date) { 
//				if (comment.reply_to_id == null) 
//					cAfterDateIds.push(comment.id); 
//				else 
//					rAfterDateIds.push(comment.id) ;
//			}
//		}
//	},
	
//////////////////////////////
//	COUNT FUNCTIONS
//////////////////////////////
	
	getCommentsAndRepliesCounts : function(all) {
		var cCount = 0 ;
		var rCount = 0 ;
		var arr = (all) ? this.allComments:this.comments;
	    var flatComments = this.getThreads(arr) ;
		for ( var i = 0; i < flatComments.length; i++) {
			if (flatComments[i].reply_to_id == null)
				cCount++ ;
			else 
				rCount++ ;
		}
		return [cCount, rCount] ;
	},

	// counts both comments and comments 
	getCommentsNb : function(all) {
		var arr = (all) ? this.allComments:this.comments;
	    return this.getThreads(arr).length ;
	},
	getFilteredCommentIdsAsString : function() {
		var ret = "" ;
		for (var id in this.commentsByDbId) 
			ret = ret + id + "," ;
		return ret ;
	}
}


