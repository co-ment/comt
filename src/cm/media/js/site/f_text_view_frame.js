var gResetOtherFieldsOnFilterFieldChange = true;

var myDefaultOuterLayoutSettings = {
	center : {
		paneSelector :".outer-center"
	},
	north : {
		size :50,//30,
		spacing_open :0,
		closable :false,
		resizable :false
	}
};

var innerNorthPaneDefaults = {
	'innerNorthPaneOpened' :'0',
	'selectedTab' :'0'
};

onInnerNorthPaneClose = function() {
	_setCookie('innerNorthPaneOpened', '0');
	$('#add_comment_btn').css('top', 63) ;
	return true;
}

onInnerNorthPaneOpen = function() {
	_setCookie('innerNorthPaneOpened', '1');
	$('#add_comment_btn').css('top', 149) ;
	return true;
}

// DEFAULT LAYOUT SETTINGS
var myDefaultInnerLayoutSettings = {
	north : {
		// size: 66, /* 66 for FF */
		size :88, /* 66 for FF */
		spacing_closed :8,
		slidable :false,		
		resizable :false, /* important */
		togglerLength_closed :"100%",
		togglerLength_open :"100%",
		togglerAlign_closed :"center",
		/* togglerContent_closed :"options", */
		togglerTip_closed :gettext("click to show options"),
		togglerTip_open :gettext("click to hide options"),
		initClosed :false,
		paneSelector :".inner-north",
		onopen :"onInnerNorthPaneOpen",
		onclose :"onInnerNorthPaneClose"
	}
};

var outerLayout, innerLayout;
layoutFrames = function() {

	var innerNorthPaneOpened = $.cookie('innerNorthPaneOpened');
	myDefaultInnerLayoutSettings.north.initClosed = (innerNorthPaneOpened === null) ? (innerNorthPaneDefaults['innerNorthPaneOpened'] == '0')
			: (innerNorthPaneOpened == "0");

	outerLayout = $('body').layout(myDefaultOuterLayoutSettings);
	innerLayout = $('div.outer-center').layout(myDefaultInnerLayoutSettings);
	
	// to trigger add_comment_btn positioning
	if (myDefaultInnerLayoutSettings.north.initClosed)
		onInnerNorthPaneClose() ;
	else 
		onInnerNorthPaneOpen() ;
}

fillFilterTab = function() {
	
	var tab = $('#c_filter');
	
	var html = '<div style="float:right">' +
				'<table>' +
					'<tr>' +
					'<td style="text-align:right;">' +
					gettext('Text') +
				'<td>&nbsp;</td>' +
				'<td>' +
					'<input id="filter_text" type="text"></input>' +
					'<input id="c_filter_btn" type="button" value="' + gettext('Search') + '"></input>' +
				'</td>' +
					'</tr>' +
					'<tr>' +
						'<td colspan="3" style="text-align:right;">' +
							'<input id="c_filterreset_btn" type="button" value="' + gettext('Reset') + '"></input>' +
							'<input id="c_filterhideall_btn" type="button" value="' + gettext('Hide all Comments') + '"></input>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>' +
			'<table>' +
				'<tr>' +
					'<td style="text-align:right;">' +
					gettext('Authors') +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td>' +
						'<select id="filter_name"></select>' +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td style="text-align:right;">' +
					gettext('States') +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td>' +
						'<select id="filter_state"></select>' +
					'</td>' +
				'</tr>' +
				'<tr>' +
					'<td style="text-align:right;">' +
						gettext('Dates') +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td>' +
						'<select id="filter_date"></select>' +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td style="text-align:right;">' +
						gettext('Tags') +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td>' +
						'<select id="filter_tag"></select>' +
					'</td>' +
				'</tr>' +
			'</table>';
	tab.append($(html));	
	
	$("#c_filter input[type='text']").add("#c_filter select").addClass('c_filter_field') ;

	$("#filter_name").add("#filter_date").add("#filter_tag").add("#filter_state").change(function() {
		if (frames['text_view_comments'].readyForAction()) {
			var elt = $(this) ;
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				//console.info($(this)) ;
				//console.info(elt) ;
				//applyFilter($(this)) ;
				applyFilter(elt) ;
			}) ;
		}
	});

	$("#c_filter_btn").click(function() {
		if (frames['text_view_comments'].readyForAction()) {
			var elt = $("#filter_text") ;
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				applyFilter(elt) ;
			}) ;
		}
	});

	$('#filter_text').keyup( function(e) {
		if (e.keyCode == 13) {$("#c_filter_btn").click();}
	});

	$("#c_filterreset_btn").click( function() {
		if (frames['text_view_comments'].readyForAction()) {
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				resetFilter();
			}) ;
		}
	});

	$("#c_filterhideall_btn").click( function() {
		if (frames['text_view_comments'].readyForAction()) {
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				frames['text_view_comments'].hideAll() ;
			}) ;
		}
	});
	
}
fillTopToolbar = function() {
	
	var parent = $('#outer-north');

	var viewPrev = gettext('view previous comment') ;
	var viewNext = gettext('view next comment') ;
	var viewFirst = gettext('view first comment') ;
	var viewLast = gettext('view last next comment') ;
	var viewAll = gettext('view all comments') ;
	var advancedInterface = gettext('toggle advance interface') ;
	var print = gettext('print document with/without comments') ;
	var exportDoc = gettext('export document with/without comments') ;
	var fullscreen = gettext('toggle full screen view') ;
	var feed = gettext('text feed') ;
	var addComment = gettext('add a comment') ;

	var html = '<div id="c-right-btn">' +
		        '<img id="c_fullscreen_btn" src="' + sv_media_url + '/img/arrow_out.png" title="'+ fullscreen +'" alt="'+ fullscreen +'"/>' +      
		        '<img id="c_print_btn" src="' + sv_media_url + '/img/printer.png" title="'+ print +'" alt="'+ print +'"/>' +         
		        '<img id="c_export_btn" src="' + sv_media_url + '/img/page_go.png" title="'+ exportDoc +'" alt="'+ exportDoc +'"/>' +
		        '<a target="_blank" href="' + frames['text_view_comments'].sv_text_feed_url + '"><img id="c_feed_btn" src="' + sv_media_url + '/img/feed.png" title="'+ feed +'" alt="'+ feed +'"/></a>' +         
	        '</div>' +
		    '<div id="c-msg-wrapper">' +
			'</div>' + 
			'<table style="margin-bottom:.3em;">' + 
			'<tbody>' + 
			'<tr>' + 
			'<td>' +
				'<span id="c_filter_results" >' +
				'<b>&nbsp;<span id="c_f_res_nb_dis"></span></b>&nbsp;<span id="c_f_res_nb_dis_txt"></span>' +
				'<span id="c_f_res_details">&nbsp;(' + gettext('filter:') + '&nbsp;<span id="c_f_res_nb_com"></span>/<span id="c_f_res_nb_tot_com"></span>&nbsp;<span id="c_f_res_nb_com_txt"></span>&nbsp;<span id="c_f_res_nb_rep"></span>/<span id="c_f_res_nb_tot_rep"></span><span id="c_f_res_nb_rep_txt"></span>)</span>' +
				'</span>' +
			'</td>' +
			'<td>' +
			'<span id="browse_section">' +
			', ' + gettext('browse by:') + ' ' + 
				'<select id="browse_by">' + 
				'<option value="scope">' + gettext('location') + '</option>' +
				'<option value="modif_thread">' + gettext('modification') + '</option>' +
				'</select>' + 
			'</span>' +
			'</td>' + 
			'<td width="40" align="right">' + 
				'<a href="#" id="c_browse_first"><img title="'+ viewFirst +'" alt="'+ viewFirst +'" src="' + sv_media_url + '/img/control_fastbackward_blue.png"/></a>' +
				'<a href="#" id="c_browse_prev"><img title="'+ viewPrev +'" alt="'+ viewPrev +'" src="' + sv_media_url + '/img/control_playback_blue.png"/></a>' +
			'</td>' +
			'<td width="50" align="center">' +
					'<span id="c_browse_indx_scope">-</span>' +
					'<span id="c_browse_indx_modif_thread" style="display: none;">-</span>' +
					'/' +
					'<span id="c_browse_indx_total"></span>' + 
			'</td>' +
			'<td width="40" align="left">' +
				'<a href="#" id="c_browse_next"><img title="'+ viewNext +'" alt="'+ viewNext +'" src="' + sv_media_url + '/img/control_play_blue.png"/></a>' +
				'<a href="#" id="c_browse_last"><img title="'+ viewLast +'" alt="'+ viewLast +'" src="' + sv_media_url + '/img/control_fastforward_blue.png"/></a>' +
			'</td>' +
			'<td width="20" align="left">' +
			'<a href="#" id="c_browse_all"><img title="'+ viewAll +'" alt="'+ viewAll +'" src="' + sv_media_url + '/img/view_all.png"/></a>' +
			'</td>' +
			'<td width="20" align="left">' +
				'<a href="#" id="c_advanced_btn"><img title="'+ advancedInterface +'" alt="'+ advancedInterface +'" src="' + sv_media_url + '/img/application_split.png"/></a>' +
			'</td>' +
			'<td width="20" align="left">' +
				'<a href="#" id="c_thread_unthread"><img id="c_thread_unthread_img"/></a>' +
			'</td>' +
			'</tr>' +
			'</tbody>' +
			'</table>' ;
	parent.prepend($(html));

	$("#add_comment_btn").click( function() {
		if (frames['text_view_comments'].readyForAction()) {
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				frames['text_view_comments'].gSync.showCommentForm(null) ;
			}) ;
		}
	});

	var showBrowseIndx = function() {
		$("#browse_by option").each(function() {
			$("#c_browse_indx_"+this.value).hide() ;
		}) ;
		$('#c_browse_indx_' + $('#browse_by').val()).show() ;
	};
	
	var first_browse_by_val = $.cookie('browse_by');
	first_browse_by_val = (first_browse_by_val == null) ? "location" : first_browse_by_val ;
	_setCookie('browse_by', $('#browse_by').val());
	$("#browse_by option[value="+ first_browse_by_val +"]").attr("selected", true);
	showBrowseIndx() ;
	
	$("#browse_by").change(function() {
		_setCookie('browse_by', $('#browse_by').val());
		showBrowseIndx() ;
	});
	
	var lBrowse = function(whereto) {
		if (frames['text_view_comments'].readyForAction()) 
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				frames['text_view_comments'].browse($('#browse_by').val(), whereto); 
			}) ;
	};
	$("#c_browse_prev").click( function() {lBrowse("prev");});
	$("#c_browse_next").click( function() {lBrowse("next");});
	$("#c_browse_first").click( function() {lBrowse("first");});
	$("#c_browse_last").click( function() {lBrowse("last");});
	$("#c_browse_all").click( function() {
		if (frames['text_view_comments'].readyForAction()) {
			frames['text_view_comments'].checkForOpenedDialog(null, function() {
				frames['text_view_comments'].gSync.showAllComments() ;
			}) ;
		}
	});
	
	$("#c_print_btn").click( function() {
		if (frames['text_view_comments'].readyForAction()) {
			var ids = frames['text_view_comments'].gDb.getFilteredCommentIdsAsString() ;
			frames['text_view_comments'].CY.log($("#filteredIds").val(ids)) ;
			openPrintDialog() ;
		}
	});
	
	$("#c_export_btn").click( function() {
		if (frames['text_view_comments'].readyForAction()) {
			var ids = frames['text_view_comments'].gDb.getFilteredCommentIdsAsString() ;
			frames['text_view_comments'].CY.log($("#filteredIds").val(ids)) ;
			openExportDialog() ;
		}
	});
	
	if (frames['text_view_comments'].gLayout.isInComentSite()) {
		$("#c_fullscreen_btn").click( function() {
				top.v_toggleFrameSize();
		});
	} ;	
	
	$("#c_advanced_btn").click( function() {
		$('.ui-layout-toggler').click() ; // calling the layout method did not work well edo that instead		
	}) ;
	
	setThreadPref = function() {
		var v = frames['text_view_comments'].c_readPreference('comments', 'threadpad');

		var btn_src = sv_media_url + '/img/unthread_box.png' ;
		var btn_desc = gettext('unthread discussions') ;
		if (v == '0') { 
			btn_src = sv_media_url + '/img/thread_box.png' ;
			btn_desc = gettext('thread discussions') ;
		}
		$('#c_thread_unthread_img').attr('src', btn_src).attr('alt', btn_desc).attr('title', btn_desc) ;
	};
	
	setThreadPref();	
	$('#c_thread_unthread').click( function() {
		var v = frames['text_view_comments'].c_readPreference('comments', 'threadpad');
		var anti_v = (v == '0') ? '1' : '0';
		frames['text_view_comments'].c_persistPreference('comments', 'threadpad', anti_v);
		setThreadPref();
		frames['text_view_comments'].gSync.animateToTop() ;
	});
	
}

onSliderStop = function() {
	var slideVal = $("#c_slider").slider('value') ;
//	console.info("in onSliderStop slider val : " + slideVal) ;
	if (slideVal > (frames['text_view_comments'].gConf['sliderFixedMin'] * 100)) 
		$("#c_slider").slider('value', [90]) ;
	if (slideVal < (frames['text_view_comments'].gConf['sliderFixedMax'] * 100)) 
		$("#c_slider").slider('value', [10]) ;
	
	frames['text_view_comments'].c_setCommentsColWidth(slideVal) ;
	frames['text_view_comments'].c_persistPreference('layout', 'comments_col_width', slideVal);
}

fillTextPreferencesTab = function() {
	var tab = $('#c_text_preferences');
	tab.append($(
			'<table>' +
			'<tr>' +
			'<td>' +
			gettext('Text style') +
			'</td>' +
			'<td>&nbsp;</td>' +
			'<td>' +
			'<select id="c_textpref_style"></select>' +
			'</td>' +
			'</tr>' +
			'</table>')) ;
	var styles = frames['text_view_comments'].gTextStyles ;
	for (var key in styles) {
		$("#c_textpref_style").append($("<option value='"+ key +"'>" + styles[key] + "</option>")) ;
	}
	
	var setTextStyle = function() {
		var styles = frames['text_view_comments'].gTextStyles ;
		var wish = $('#c_textpref_style').val() ;
		for (var key in styles) {
			if (key == wish)
				frames['text_view_comments'].CY.get("#textcontainer").addClass(styles[key]) ;
			else 
				frames['text_view_comments'].CY.get("#textcontainer").removeClass(styles[key]) ;
		}
	};
	
	var setTextStyleField = function() {
		var v = frames['text_view_comments'].c_readPreference('text', 'style');
		$('#c_textpref_style').val(v);
	};
	
	$("#c_textpref_style").change(function(v) {
		frames['text_view_comments'].c_persistPreference('text', 'style', $("#c_textpref_style").val());
		setTextStyle();
	});
	
	setTextStyleField();
	setTextStyle();
}

fillPreferencesTab = function() {
	var tab = $('#c_preferences');

	var html = '<div style="float:right"><input id="c_pref_save_btn" type="button" value="' + gettext('Save') + '"></input><input id="c_pref_reset_btn" type="button" value="' + gettext('Reset') + '"></input></div>' +
				'<table>' +
				'<tr>' +
					'<td>' +
						gettext('Animation duration') +
					'</td>' +
					'<td>&nbsp;</td>' +
					'<td>' +
						'<input id="c_pref_animduration" type="text" style="width:3em" value="" />' +
					'</td>' +
				'</tr>' + 
				'<tr>' +
					'<td>' +
						'<span class="frame_helptext">' + gettext('(0.001 to 1 second)') + '</span>' +
					'</td>' +
					'<td></td><td></td>' +
				'</tr>' +
				'</table>';
	tab.append($(html)) ;

	setPreferencesFieldsValue = function() {
		var v = frames['text_view_comments'].c_readPreference('general', 'animduration');
		$('#c_pref_animduration').val(v);
	};
	
	setPreferencesFieldsValue();

	$('#c_pref_animduration').blur( function() {
		var v = parseFloat($(this).val());
		if (isNaN(v) || (v <= 0) || (v > 1)) {
			v = frames['text_view_comments'].c_readDefaultPreference('general', 'animduration');
		}
		$(this).val(v);
	});

	$('#c_pref_reset_btn').click( function() {
		frames['text_view_comments'].c_resetPreferences(['general']);
		setPreferencesFieldsValue();

		enqueueMsg(gettext('preferences reset (will apply on next load)'));
	});

	$('#c_pref_save_btn').click( function() {
		frames['text_view_comments'].c_persistPreference('general', 'animduration', $('#c_pref_animduration').val());

		enqueueMsg(gettext('preferences saved (will apply on next load)'));
	});
}

initFrame = function() {
	_initYesNoDialog();
	_initPrintDialog() ;	

	$(window).resize(function(){
 		onSliderStop(); 
//		console.log('in frame resize' +  $("#c_slider").slider('value')) ;
//		console.log('in frame resize' + frames['text_view_comments'].CY.DOM.winWidth()) ;
//		console.log('in frame resize' + $(window).width()) ;
	});

	//$('<div id="c_slider"></div>').appendTo("#c-btns").slider({ 
	$('#c_slider').slider({ 
	animate: true,
	range: "min",
	value: frames['text_view_comments'].c_readPreference('layout','comments_col_width'),
	min: 1,
	iframeFix: true,
	max: 100,
//	step: 5,
	slide: function(event, ui) {
		var slideVal = ui.value ;
		frames['text_view_comments'].c_setCommentsColWidth(slideVal) ;
	},
	stop:function(event, ui) {
		onSliderStop() ;
	}
	}) ;

	
	_initTabs();
	
	f_interfaceFreeze();
};

_initTabs = function() {
	$(".inner-north").tabs();

	var selectedTab = $.cookie('selectedTab');
	selectedTab = (selectedTab === null) ? innerNorthPaneDefaults['selectedTab'] : parseInt(selectedTab);
	$(".inner-north").tabs('select', selectedTab);
	$(".inner-north").bind('tabsselect', function(event, ui) {
		// // Objects available in the function context:
			// ui.tab // anchor element of the selected (clicked) tab
			// ui.panel // element, that contains the selected/clicked tab
			// contents
			// ui.index // zero-based index of the selected (clicked) tab
			_setCookie('selectedTab', ui.index);

		});
}

_initYesNoDialog = function() {
	$('#dialog_h').dialog( {
		// bgiframe: true, // why would we ?
		autoOpen :false,
		modal :true
	});
}

_setCookie = function(name, value) {
	var cookieExpire = new Date();
	cookieExpire.setFullYear(2100, 0, 1);
	$.cookie(name, value, {
		'expires' :cookieExpire,
		'path': '/'
	});
}

//contains code thats offered by the text_view_comment_frame to its child frame text_view_comment
f_getFrameFilterData = function () {
	var name = $('#filter_name').val(); ; 
	var date_str = $('#filter_date').val(); ; 
	var text = $('#filter_text').val(); ; 
	var tag = $('#filter_tag').val(); ; 
	var state = $('#filter_state').val(); ; 
	return {'name':name, 'date':date_str, 'text':text, 'tag':tag, 'state':state} ;
}

f_setFilterValue = function (obj) {
	for (key in obj) {
		if (key.indexOf('filter_') == 0) 
			$('#'+key).val(obj[key]); // wont explode even if argument is silly
	}
}

f_isFrameFilterFieldsInit = function () {
	var obj = f_getFrameFilterData() ;
	var ret = true ;
	for (key in obj) {
		ret = ret && (obj[key] == "") ;
	}
	return ret ;
}

initFilterFields = function () {
	$('.c_filter_field').val("") ;
}

resetFilter = function () {
	initFilterFields() ;
	frames['text_view_comments'].reinit() ;
	enqueueMsg(gettext("filter reset")) ;
}

applyFilter = function(self) {
	var val = self.val() ;  
	if (gResetOtherFieldsOnFilterFieldChange) {
		initFilterFields() ;  
		self.val(val) ; 
	}
	frames['text_view_comments'].reinit();
	enqueueMsg(gettext("filter applied"));
}

f_updateFilterCountResult = function(nbDiscussions, nbComments, nbReplies, nbAllComments, nbAllReplies) {
	// update result counter message field.
	$("#c_f_res_nb_dis").html(nbDiscussions) ;
	$("#c_f_res_nb_dis_txt").html(ngettext('discussion', 'discussions', nbDiscussions)) ;

	$("#c_f_res_nb_com").html(nbComments) ;
	$("#c_f_res_nb_tot_com").html(nbAllComments) ;
	$("#c_f_res_nb_com_txt").html(ngettext('comment', 'comments', nbComments)) ;
	$("#c_f_res_nb_rep").html(nbReplies) ; 
	$("#c_f_res_nb_tot_rep").html(nbAllReplies) ; 
	$("#c_f_res_nb_rep_txt").html(ngettext('&nbsp;reply', '&nbsp;replies', nbReplies)) ;

	// update browser infos
	$("#c_browse_indx_total").html(nbDiscussions) ; 
	
	//console.info('nbDiscussions + typeof nbDiscussions +nbComments + typeof nbComments) ;
	$("#c_filter_results").show() ; 
} ;

f_updateFilterCountDetailed = function(detailed) {
	if (detailed) {
		$("#c_f_res_details").show() ;
		$("c_browse_all").val('View all (filtered) comments')
	}
	else {
		$("#c_f_res_details").hide() ;
		$("#c_browse_all").val('View all comments')
	}
} ;

f_updateFilterData = function(newFilterData) {
//	console.info(newFilterData) ;
	// users
	var selectedNameOption = $("#filter_name option:selected").attr("name") ;
	var all = gettext("all") ;
	$("#filter_name option").remove() ;
	
	$("#filter_name").append($("<option name='c_f2_user_all' value=''>" + all + "</option>")) ;
	for (var  i=0, ilen=newFilterData['names'].length; i < ilen ; i++) {
		var item = newFilterData['names'][i] ;
		$("#filter_name").append($("<option name='c_f2_user_"+ item.name +"' value='"+ item.name +"'>" + item.name +"("+item.nb_comments+")</option>")) ;
	}
	
	$("#filter_name option[name="+selectedNameOption+"]").attr("selected", true);
	
	// dates
	var selectedDateOption = $("#filter_date option:selected").attr("name") ;

	$("#filter_date option").remove() ;
	
	$("#filter_date").append($("<option name='c_f_date_all' value=''>" + all + "</option>")) ;
	for (var  i=0, ilen=newFilterData['dates'].length; i < ilen ; i++) {
		var item = newFilterData['dates'][i] ;
		var ddd = ngettext('last 24 hours (%(nb_comments)s)', 'last %(nb_days)s days (%(nb_comments)s)', item.nb_day) ;
		var ccc = interpolate(ddd,{'nb_days':item.nb_day, 'nb_comments':item.nb_comments}, true) ;		
		
		$("#filter_date").append($("<option name='c_f_date_"+ item.nb_day +"' value='"+ item.nb_day_date +"'>" + ccc + "</option>")) ;
	}
	
	$("#filter_date option[name="+selectedDateOption+"]").attr("selected", true);
	
	// text : nothing to do
	
	// tags
	var selectedTagOption = $("#filter_tag option:selected").attr("name") ;

	$("#filter_tag option").remove() ;
	
	$("#filter_tag").append($("<option name='c_f2_tag_all' value=''>" + all + "</option>")) ;
	for (var  i=0, ilen=newFilterData['tags'].length; i < ilen ; i++) {
		var item = newFilterData['tags'][i] ;
		$("#filter_tag").append($("<option name='c_f2_tag_"+ item.name +"' value='"+ item.name +"'>" + item.name +"("+item.nb_comments+")</option>")) ;
	}
	$("#filter_tag option[name="+selectedTagOption+"]").attr("selected", true);
	
	// states
	var selectedStateOption = $("#filter_state option:selected").attr("state") ;

	$("#filter_state option").remove() ;
	
	$("#filter_state").append($("<option name='c_f2_state_all' value=''>" + all + "</option>")) ;
	for (var  i=0, ilen=newFilterData['states'].length; i < ilen ; i++) {
		var item = newFilterData['states'][i] ;
		$("#filter_state").append($("<option name='c_f2_state_"+ item.state +"' value='"+ item.state +"'>" + gettext(item.state) +"("+item.nb_comments+")</option>")) ;
	}
	$("#filter_state option[name="+selectedStateOption+"]").attr("selected", true);
} ;

f_interfaceUnfreeze = function() {
	// tabs headers
	for ( var i = 0, ilen = $(".c_tab").length; i < ilen; i++) {
		$(".inner-north").tabs("enable", i);
	}

	$(".inner-north select").add(".inner-north input").add("#outer-north select").add("#outer-north input").each( function() {
		$(this).attr("disabled", false);
	});

	$("#c_slider").slider('enable') ;

} ;

f_interfaceFreeze = function() {
	// tabs headers
	for ( var i = 0, ilen = $(".c_tab").length; i < ilen; i++) {
		$(".inner-north").tabs("disable", i);
	}

	$(".inner-north select").add(".inner-north input").add("#outer-north select").add("#outer-north input").each( function() {
		$(this).attr("disabled", true);
	});
	
	$("#c_slider").slider('disable') ;
} ;

f_enqueueMsg = function(msg) {
	enqueueMsg(msg) ; 	
} ;

f_enqueueErrorMsg = function(msg) {
	enqueueErrorMsg(msg) ; 	
} ;

f_removeLoadingMsg = function() {
	removeLoadingMsg() ;
}

f_initFrame = function() {
	initFrame() ;
}

f_layoutFrames = function() {
	layoutFrames() ;
}

f_fillTextPreferencesTab = function() {
	fillTextPreferencesTab() ;
}

f_fillPreferencesTab = function() {
	fillPreferencesTab() ;
}

f_fillBrowseSection = function() {
	fillBrowseSection() ;
}

f_fillFilterTab = function() {
	fillFilterTab() ;
}

f_fillTopToolbar = function() {
	fillTopToolbar() ;
}

f_yesNoDialog = function(htmlContent, title, noFunction, noFunctionContext, noFunctionArgs, yesFunction, yesFunctionContext, yesFunctionArgs) {
	$('#dialog_h').html(htmlContent) ;
	
	$('#dialog_h').dialog('option', 'title', title) ;

	function onNo() {
		if (noFunction != null)
			noFunction.call(noFunctionContext, noFunctionArgs) ;
	}
	
	function onYes() {
		if (yesFunction != null)
			yesFunction.call(yesFunctionContext, yesFunctionArgs) ;
	}
	var buttons = {} ;
	buttons[gettext('No')] = function() {$(this).dialog('close');onNo();} ;
	buttons[gettext('Yes')] = function() {$(this).dialog('close');onYes();} ;
	$('#dialog_h').dialog('option', 'buttons', buttons) ;        
	$('#dialog_h').dialog('open') ;
}

f_setCookie = function(name, value) {
	_setCookie(name, value) ;
}
