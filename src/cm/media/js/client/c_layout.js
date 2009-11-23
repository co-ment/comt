// globals used: gConf, gPrefs

Layout = function() {
}

Layout.prototype = {
	init : function () {
	},
	
	isInFrame : function () {
		return (!CY.Lang.isUndefined(parent) && parent.location != location && CY.Lang.isFunction(parent.f_getFrameFilterData)); ;
	},
	
	isInComentSite : function () {
		// TODO test with IE, test also when embeded
		
		var ret = false; 
		try {
			ret = (!CY.Lang.isUndefined(parent) && !CY.Lang.isUndefined(parent.parent) && parent.parent.location != location && CY.Lang.isFunction(parent.parent.v_toggleFrameSize));
		}
		catch (e) {
			ret=false;
		}
			
		return ret ;
	},
	
	sliderValToPx : function (val) {
		var winWidth = CY.DOM.winWidth() ;
		if (this.isInFrame()) 
			 winWidth = parent.$(parent).width() ;		
		var theta = val / 100 ;
		theta = Math.min(theta, gConf['sliderFixedMin']) ;
		theta = Math.max(theta, gConf['sliderFixedMax']) ;
		var colWidth = theta * winWidth ;
		return Math.floor(colWidth) ;
	},

	getTopICommentsWidth : function() {
		return this.getTopICommentsWidthFromWidth(this.sliderValToPx(gPrefs.get('layout','comments_col_width'))) ;
	},
	
	getTopICommentsWidthFromWidth : function(val) {
		return val - 7;
	},
	
	setLeftColumnWidth : function (colWidth) {
		CY.get('#contentcolumn').setStyle('marginLeft', colWidth + 'px');
		CY.get('#leftcolumn').setStyle('width', colWidth + 'px');
	},
	
	parentInterfaceUnfreeze : function() {
		if (this.isInFrame())
			parent.f_interfaceUnfreeze() ;
	}
	
}
