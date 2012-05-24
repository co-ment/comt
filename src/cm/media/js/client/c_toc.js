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
  getElementsByClassName('c-toc')[0].style.width = width + 'px';
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

/*
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/	
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};
