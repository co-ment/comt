CY = null;
gPrefs = null;
gLayout = null;
gDb = null;
gIComments = null;
gSync = null;
gGETValues = null;

gConf = {'iCommentLeftPadding':4, 
        'defaultCommentFormat':'markdown',
        'sliderFixedMin':.9,
        'sliderFixedMax':.1,
        'iCommentsInitAlloc':2,
        'defaultPrefs':{'text':{'style':'text-modern-style'}, 'user' : {'name' : '','email' : ''},'general': {'animduration' : '0.4'},'comments': {'threadpad' : '1'},'layout': {'comments_col_width' : '25'  /* out of 100 */}}
};

//available text styles in c-text-styles.css
//classname(key) : will be added to #textcontainer, name(value) : the name to display in style dropdown choice"
gTextStyles = {'text-modern-style':gettext('modern'), 'text-classic-style':gettext('classic'), 'text-code-style':gettext('code')};

YUI( {
	base :sv_media_url + "/js/lib/yui/" + c_yui_base + "/build/",
	// filter: '{% if CLIENT_DEBUG %}debug{% else %}raw{% endif %}',
	// filter :'raw',
	timeout :10000
}).use(
	    "text-modern-style",
		"cookie",
		"json",
		"overlay",
		"io-form",
		"async-queue",
		"event-mouseenter",		
		"anim",
		"collection",
		function(Y) {
	        CY = Y;
	        
            gPrefs = new Preferences() ;
            gPrefs.init() ;
            
            gLayout = new Layout() ;
            gLayout.init() ;

    		if (sv_withComments) {
	            gDb = new Db() ;
	            gDb.init() ;
	            
	            gIComments = new IComments() ;	            	            
	            gIComments.init() ;
    		}

            gSync = new Sync() ;
            gSync.init() ;

			CY.on("domready", onDomReady, this); 

		});

_reinit = function(filterRes) {
	gIComments.hide();
	gDb.initComments(filterRes['commentIds']);

	unpaintAllComments();
	renderCommentScopes();
	
	updateFilterResultsCount(filterRes['nbDiscussions'], filterRes['nbComments'], filterRes['nbReplies']);
};

reinit = function(filterGETValues) {
	var filterRes = gDb.computeFilterResults(filterGETValues);
	_reinit(filterRes);
};

hideAll = function() {
	_reinit({'commentIds':[],'nbDiscussions':0, 'nbComments':0, 'nbReplies':0});
};

updateFilterResultsCount = function(nbDiscussions, nbComments, nbReplies) {
	var r = gDb.getCommentsAndRepliesCounts(true);
	var nbAllComments = r[0], nbAllReplies = r[1];
	var detailedResults = (nbComments != 0 || nbReplies != 0) && (nbAllComments != nbComments || nbAllReplies != nbReplies) ;
	if (gLayout.isInFrame()) {
		parent.f_updateFilterCountDetailed(detailedResults) ;
		parent.f_updateFilterCountResult(nbDiscussions, nbComments, nbReplies, nbAllComments, nbAllReplies);
	}
};

updateResetFilterResultsCount = function() {
	var counts = gDb.getCommentsAndRepliesCounts(false)
	var nbComments = counts[0], nbReplies = counts[1];

	var nbDiscussions = nbComments;
	updateFilterResultsCount(nbDiscussions, nbComments, nbReplies);
};

// TODO MOVE
renderCommentScopes = function() {
	for (var i = 0 ; i < gDb.comments.length ; i++) {
		var comment = gDb.comments[i] ;
		paintCommentScope(comment) ;
	}
} ;

onTextMouseUp = function(e) {
	if (readyForAction()) {
		var selection = getSelectionInfo() ;
		if (selection != null) {
			updateICommentFormSelection(selection) ;
			if (gEditICommentHost != null) {
				var modifyScope = CY.get("#"+gEdit['ids']['changeScopeInputId']+" input").get('checked') ;
				if (modifyScope) {
					gEditICommentHost.scrollIntoView() ;
				}
			}
		}
		else {
			var node = e.target ;
			if (node.hasClass('c-c')) {
				var elt = CY.Node.getDOMNode(node) ;
				var commentIds = getCommentIdsFromClasses(elt) ;
				if (commentIds.length > 0) {
					checkForOpenedDialog(null, function() { // will only check for reply
						gSync.showComments(commentIds, [e.pageX, e.pageY], false) ;
					}) ;
				}
			} 
		}
//// FIRST UPDATE SELECTION IF ANY AND SCROLL TO EDITION IF ANY		
//		if (isICommentFormVisible() || gEditICommentHost != null) {
//			CY.log(selection) ;
//			updateICommentFormSelection(selection) ;
//			
//			if (gEditICommentHost != null) {
//				var modifyScope = CY.get("#"+gEdit['ids']['changeScopeInputId']+" input").get('checked') ;
//				if (modifyScope) {
//					gEditICommentHost.scrollIntoView() ;
//					didSomething = true ;
//				}
//			}
//			if (isICommentFormVisible())
//			didSomething = true ;
//		}
//		else {
//			checkForOpenedDialog(null, function() { // will only check for reply
//					var node = e.target ;
//					if (node.hasClass('c-c')) {
//						var elt = CY.Node.getDOMNode(node) ;
//						var commentIds = getCommentIdsFromClasses(elt) ;
//						if (commentIds.length > 0) {
//							//hideOverlay(gICommentForm) ;
//							// gIComments.hide() ;20080814 moved it to gSync._showComments
//							gSync.showComments(commentIds, [e.pageX, e.pageY]) ;
//						}
//					}
//				}) ;
//		}
	}
} ;

gLastScrollTime = null ;
checkForAlignement = function () {
	var now = (new Date()).getTime() ;
	if ((gLastScrollTime != null) && (now - gLastScrollTime) > 200) {
		positionICommentForm() ;			
		gLastScrollTime = null ;
	}
};

onFrameScroll = function () {
	gLastScrollTime = (new Date()).getTime() ;
};

browse = function(order, whereto) {
	gSync.browse(order, whereto) ; 
};

initialConnect = function() {
	CY.on("mouseup", onTextMouseUp, "#textcontainer");
	gTimer = CY.Lang.later(200, this, checkForAlignement, [], true) ;
	CY.on('scroll', onFrameScroll, window, this, true);
	CY.on('resize', onFrameScroll, window, this, true);
};

// serious tests were made : various browsers + comments on a link.
preventLinksInText = function() {
	var interceptLink = function(e) {
		e.preventDefault();

		var a = e.target;
		while (a != null && a.get("href") == null) {
			a = a.get('parentNode');
		}

		if (a != null && a.get("href") != null) {
			window.open(a.get("href"));
		}

	} ;

	CY.all("#textcontainer a").on("click", interceptLink);
};

onDomReady = function(arg1) {
	preventLinksInText();
	var q1 = new CY.AsyncQueue(); //  
	// doesn't behave like the doc says :
	// no timeout -> seems in blocking mode
	q1.add( {
		fn : function() {

			if (gLayout.isInComentSite()) {
				parent.toInitialSize();
			}
			if (sv_withComments) {
				instanciateICommentForm();
			}
		},
		timeout :5
	}, {
		fn : function() {

			gGETValues = CY.JSON.parse(sv_get_params);
			
			CY.get('#maincontainer').setStyle('display', 'block');
			CY.get('#textcontainer').setStyle('display', 'block');
			
			var val = (sv_withComments) ? gPrefs.get('layout','comments_col_width') : 0 ; 
			var colWidth = sliderValToPx(val) ;
			gLayout.setLeftColumnWidth(colWidth) ;
			
			if (gLayout.isInFrame()) {
				parent.f_initFrame();
				parent.f_layoutFrames();

				if (sv_withComments) {
					parent.f_fillTopToolbar() ;
					if (hasPerm("can_create_comment"))  	
						parent.$("#add_comment_btn").removeClass('initially_hidden');
					//parent.enqueueLoadingMsg(); // no more loading message ? TODO
					
					parent.f_fillFilterTab() ;
					parent.f_fillPreferencesTab() ;
					
//					parent.f_fillBrowseSection() ;
					
					var firstTimeFilterData = CY.JSON.parse(sv_filter_data);
					parent.f_updateFilterData(firstTimeFilterData);
					
					parent.f_setFilterValue(gGETValues) ;					
				}
				parent.f_fillTextPreferencesTab() ;
			}
			
			if (gLayout.isInComentSite()) 
				parent.$("#c_fullscreen_btn").show();
			else {
				parent.$("#c_fullscreen_btn").hide();
			}

		},
		timeout :5
	}, {
		fn : function() {
			if (sv_withComments) {
				
				reinit(gGETValues);
				initialConnect();
			}
		},
		timeout :5
	}, {
		fn : function() {
			if (gLayout.isInFrame()) {
				parent.f_interfaceUnfreeze() ;
				parent.f_removeLoadingMsg();
			}
			// if there is a comment id in the url display it
			if ("comment_id_key" in gGETValues) {
				var id_key = gGETValues["comment_id_key"] ;
				var comment = gDb.getCommentByIdKey(id_key) ;
				if (comment != null) {
					var path = gDb.getPath(comment) ;
					var topParentComment = path[path.length - 1] ;
					gSync.showSingleComment(topParentComment) ;
				}
			}
			
//			else {
//			gSync.showAllComments() ;// show all
//			}
		}
	});
	q1.run();
};

