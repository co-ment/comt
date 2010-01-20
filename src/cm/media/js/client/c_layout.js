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
		var ret = false;
		try { 
			if (!CY.Lang.isUndefined(sv_site_url) && !CY.Lang.isUndefined(parent) && !CY.Lang.isUndefined(parent.parent)) {
				var parentParentLocation = new String(parent.parent.location) ;
				// TODO
				//CY.log(parentParentLocation) ;
				ret = (parentParentLocation.indexOf(sv_site_url) == 0);
			}
		}
		catch (e) {
			ret=false;
			//CY.log("error thrown while trying to access parent.parent.location") ;
		}
		//CY.log("inComentSite returned : " + ret) ;
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
