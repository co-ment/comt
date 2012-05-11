gToc = null ;

instanciateToc = function() {
  gToc = {
      'tocId':CY.guid(),
      'tocTitleId':CY.guid(),
      'closeBtnId':CY.guid(),
      'empty': false
  } ;
  
  var overlayHtml = {};
  overlayHtml['headerContent'] = '<div id="' + gToc['tocId'] + '"><h3 id="' + gToc['tocTitleId'] + '"></h3>';

  var toBeTOCced = getElementsByTagNames('h2,h3,h4,h5,h6', document.getElementById('maincontainer'));
  
  var content = document.createElement('div');
  if (toBeTOCced.length >= 2) {
    for (var i=0;i<toBeTOCced.length;i++) {
	  	var tmp = document.createElement('a');
		  tmp.innerHTML = toBeTOCced[i].innerHTML.replace(/<\/?a[^>]*>/g,'');
  		tmp.className = 'page indent' + toBeTOCced[i].nodeName;
	  	content.appendChild(tmp);
		  var headerId = toBeTOCced[i].id || 'link' + i;
  		tmp.href = '#' + headerId;
	  	toBeTOCced[i].id = headerId;
    }
  }
  else {
    content.innerHTML = '';
    gToc['empty'] = true;
  }
  overlayHtml['bodyContent'] = content.innerHTML;
  
  var width = gLayout.getTopICommentsWidth() ;
  
  var overlay = new CY.Overlay( {
    zIndex :3,
    shim :false, // until we really need it, no shim 
    visible :false,
    headerContent :overlayHtml['headerContent'],
    bodyContent :overlayHtml['bodyContent'],
    xy :[3,30],
    width : width
  });
  overlay.get('contentBox').addClass("c-toc") ;
  overlay.get('contentBox').set("id", "the-toc") ;
  
  // attach to DOM
  overlay.render('#leftcolumn');
  
  CY.get("#"+gToc['tocTitleId']).set('innerHTML', gettext('Table of contents')) ;
  
  gToc['overlay'] = overlay ;
  
  var animationHide = null ;
  animationHide = new CY.Anim({
        node: overlay.get('boundingBox'),
        duration: .3, //gPrefs['general']['animduration'],
        easing: CY.Easing.easeOut
    });   
  gToc['animationHide'] = animationHide ; 
  animationHide.set('to', { opacity: 0});// height : 0 doesn't work
  gToc['animationHide-handle'] = animationHide.on('end', onTocHideAnimEnd, gToc);

  var animationShow = null ;
  animationShow = new CY.Anim({
        node: overlay.get('boundingBox'),
        duration: .3, //gPrefs['general']['animduration'],
        easing: CY.Easing.easeOut
    });   
  gToc['animationShow'] = animationShow ; 
  animationShow.set('to', { opacity: 1});
  gToc['animationShow-handle'] = animationShow.on('end', onTocShowAnimEnd, gToc);
  document.getElementsByClassName('c-toc')[0].style.width = width + 'px';
}

toggleTocFn = function() {
  if (isTocVisible())
    hideToc();
  else
    showToc();
}

hideToc = function() {
  gToc['overlay'].hide();
}

onTocHideAnimEnd = function() {
//  iComment['overlay'].blur() ;
  this.overlay.hide() ;
  gSync.resume() ;    
}

onTocShowAnimEnd = function() {
  gSync.resume() ;    
}

showToc= function () {
  removeFormErrMsg(gToc['tocId']) ;
  gIComments.hide() ;
  gToc['overlay'].show();
}

isTocVisible = function () {
  if (gToc != null)
    return gToc['overlay'].get('visible') ;
  return false ;
}

function getElementsByTagNames(list,obj) {
	if (!obj) var obj = document;
	var tagNames = list.split(',');
	var resultArray = new Array();
	for (var i=0;i<tagNames.length;i++) {
		var tags = obj.getElementsByTagName(tagNames[i]);
		for (var j=0;j<tags.length;j++) {
			resultArray.push(tags[j]);
		}
	}
	var testNode = resultArray[0];
	if (!testNode) return [];
	if (testNode.sourceIndex) {
		resultArray.sort(function (a,b) {
				return a.sourceIndex - b.sourceIndex;
		});
	}
	else if (testNode.compareDocumentPosition) {
		resultArray.sort(function (a,b) {
				return 3 - (a.compareDocumentPosition(b) & 6);
		});
	}
	return resultArray;
}
