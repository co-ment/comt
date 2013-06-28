// DOM MANIPULATION TO DYNAMICALLY RENDER COMMENTS SCOPES IN TEXT 

// cf. http://www.quirksmode.org/dom/w3c_core.html#nodemanipulation (informative!)

// classes :
// c-s is for 'textnode wrapper span'
// c-c is a comment marker

paintCommentScope = function(comment) {
  if (comment.reply_to_id == null && comment['start_wrapper'] != -1) {
    var selection = {   'start' : { 'elt' : document.getElementById("sv_"+comment['start_wrapper']), 'offset' : comment['start_offset'] },
              'end' : { 'elt' : document.getElementById("sv_"+comment['end_wrapper']), 'offset' : comment['end_offset'] }
            } ;
    if (document.getElementById("sv_"+comment['start_wrapper'])== null) {
      warn_server({'from':'paintCommentScope', 'start_wrapper':comment['start_wrapper']}) ;
    }
    else {
      if (document.getElementById("sv_"+comment['end_wrapper'])== null)
        warn_server({'from':'paintCommentScope', 'end_wrapper':comment['end_wrapper']}) ;
      else {
          selection['start'] = _convertSelectionFromCSToCC(selection['start']) ;
          selection['end'] = _convertSelectionFromCSToCC(selection['end']) ;
      
          renderComment(selection, comment['id']) ;
      }
    }
  }
};

getCommentIdsFromClasses = function (elt) {
  var commentIds = [] ;
  var classes = elt['className'].split(" ") ;
  for (var i = 0, ilen = classes.length ; i < ilen ; i++) {
    if (classes[i].indexOf('c-id-') == 0) {
      commentIds.push(parseInt(classes[i].substring('c-id-'.length))) ;
    }
  }
  return commentIds ;
};

renderComment = function (selection, commentId) {
  var startOffset = selection['start']['offset'] ;
  var endOffset = selection['end']['offset'] ;
  var startElt = selection['start']['elt'] ;
  var endElt = selection['end']['elt'] ;

  
    if ((startElt != null) && (endElt != null) && _getTextNodeContent(startElt) != '' && _getTextNodeContent(endElt) != ''){
// log('startElt.id : ' + startElt.id) ;
// log('endElt.id : ' + endElt.id) ;
//      log('startElt.innerHTML : ' + startElt.innerHTML) ;
//      log('endElt.innerHTML : ' + endElt.innerHTML) ;
      markWholeNodesAsComments(startElt, endElt, commentId) ;
      markEndsAsComments(startElt, startOffset, endElt, endOffset, commentId) ;
  }
};

markWholeNodesAsComments = function (startElt, endElt, commentId) {
    var commonAncestor = _findCommonAncestor(startElt, endElt) ;
    _dynSpanToAnc(startElt, commonAncestor, commentId, false) ;
    
    _dynSpanToAnc(endElt, commonAncestor, commentId, true) ;

    _dynSpanInBetween(commonAncestor, startElt, endElt, commentId) ;
};

_setTextNodeContent = function(txtNodeParent, contentString) {
    CY.DOM.setText(txtNodeParent, contentString);
};

_getTextNodeContent = function(txtNodeParent) {
    return CY.DOM.getText(txtNodeParent);
};

markEndsAsComments = function(startElt, startOffset, endElt, endOffset, commentId) {
  
//  alert('starting with: ' + startElt.childNodes.length + 'and a length of : ' + startElt.firstChild.data.length) ; 
//  alert('2 and a length of : ' + CY.DOM.getText(startElt).length) ; 

  var beforeStart = _getTextNodeContent(startElt).substring(0, startOffset) ; 
  var afterStart = _getTextNodeContent(startElt).substring(startOffset) ;
  var beforeEnd = _getTextNodeContent(endElt).substring(0, endOffset) ;
  var afterEnd = _getTextNodeContent(endElt).substring(endOffset) ;

    var sameNode = (startElt === endElt) ;
    
//    log('beforeStart : ' + beforeStart + ' , afterStart : ' + afterStart + ' , beforeEnd : ' + beforeEnd + ' , afterEnd : ' + afterEnd + ' , sameNode : ' + sameNode) ;
 
    // taking care of start node : (and 'sameNode' case when start and end lie
  // on same node)
    if (afterStart != "") { // otherwise nothing to do on the start node
      if (CY.DOM.hasClass(startElt, 'c-c')) {
        var lastElt = null, afterStartElt = null, afterEndElt = null, beforeStartElt = null ;
        
          var btw = (sameNode) ? _getTextNodeContent(startElt).substring(startOffset, endOffset) : afterStart ;
                    

          if (sameNode && (afterEnd != "")) {
        afterEndElt = startElt ;
        lastElt = afterEndElt ;
      }
        if (btw != "") {
          if (lastElt == null) {
            afterStartElt = startElt ;
          }
          else {
            afterStartElt = _yuiCloneNode(startElt) ;
            lastElt.parentNode.insertBefore(afterStartElt, lastElt) ;
          }
        lastElt = afterStartElt ;
        }
        if (beforeStart != "") {
          if (lastElt == null) {
            beforeStartElt = startElt ;
          }
          else {
            beforeStartElt = _yuiCloneNode(startElt) ;
            lastElt.parentNode.insertBefore(beforeStartElt, lastElt) ;
          }
        lastElt = beforeStartElt ;
        }
        
      if (afterEndElt != null) {
        _setTextNodeContent(afterEndElt, afterEnd) ;
      }
      
        if (afterStartElt != null) {
        _setTextNodeContent(afterStartElt, btw) ;
          _addIdClass(afterStartElt, commentId) ;
        }

//        alert('beforeStartElt.firstChild.data.length: ' + beforeStartElt.firstChild.data.length);
//        alert('beforeStartElt.childNodes.length: ' + beforeStartElt.childNodes.length);
        if (beforeStartElt != null) {
        _setTextNodeContent(beforeStartElt, beforeStart) ; 
        }
//        alert('beforeStartElt.childNodes.length: ' + beforeStartElt.childNodes.length);
        //alert('typeof beforeStartElt: ' + typeof beforeStartElt);
//        alert('beforeStartElt.lastChild ==  beforeStartElt.firstChild : ' + (beforeStartElt.lastChild == beforeStartElt.firstChild));
        
//        alert('beforeStartElt.firstChild.id : ' + beforeStartElt.firstChild.id);
//        alert('beforeStartElt.lastChild.data : ' + beforeStartElt.lastChild.data);
//        alert('beforeStartElt.firstChild.data : ' + beforeStartElt.firstChild.data);
//        alert('afterStartElt.firstChild.data : ' + afterStartElt.firstChild.data);
//        alert('afterEndElt.firstChild.data : ' + afterEndElt.firstChild.data);
        
        }
    }
    if ( ( !sameNode ) && ( beforeEnd != "" ) ) { // otherwise nothing to do
                          // on the end node
      if (CY.DOM.hasClass(endElt, 'c-c')) {
        var lastElt = null, beforeEndElt = null, afterEndElt = null ;
        
        if (afterEnd != "") {
          afterEndElt = endElt ;
        lastElt = endElt ;
      }
      
        if (beforeEnd != "") {
          if (lastElt == null)
            beforeEndElt = endElt ;
          else {
            beforeEndElt = _yuiCloneNode(endElt) ;
            lastElt.parentNode.insertBefore(beforeEndElt, lastElt) ;
          }
        lastElt = beforeEndElt ;
        }
        if (afterEndElt != null) {
          _setTextNodeContent(afterEndElt, afterEnd) ;
      }
      
        if (beforeEndElt != null) {
          _addIdClass(beforeEndElt, commentId) ;
          _setTextNodeContent(beforeEndElt, beforeEnd) ;
        }
      }
    }
};

// WARNING (200891108): had to use YUI cloneNode instead of the native cloneNode
// (because of the _yuid that is cloned under IE, cf tests made in textYUIcloneNode.html)
// so code like :
// afterStartElt = startElt.cloneNode(true) ;
// afterStartElt.id = CY.guid() ;
// was replaced with :
// afterStartElt = _yuiCloneNode(startElt) ;
_yuiCloneNode = function (srcElt) {
  var ret = CY.Node.getDOMNode(CY.get('#'+srcElt.id).cloneNode(true)) ;
  ret.id = CY.guid();
  return ret ;
};

// will wrap textNodes into c-c spans going up the DOM tree from elt to ancestor
// textNodes impacted here will be those that are :
// the same generation or older than elt (but elt is excluded)
// AND not older than grand children of to
// assumption :
// 1 ancestor is an ancestor of elt (we'll be going up the DOM tree)
// 2 elt is a textNode.
// argumentss :
// prev : will spannify previous siblings if true, next siblings otherwise
_dynSpanToAnc = function (elt, ancestor, commentId, prev) {
// log('in : _dynSpanToAnc, elt : ' + elt.id) ;
  var c = elt ;
    while ((c != null) && (c !== ancestor) && (c.parentNode !== ancestor)) {
    var c_sib = null ;
    if (prev) {
      c_sib = c.previousSibling ;
    }
    else {
      c_sib = c.nextSibling ;
    }
    
    if (c_sib == null) {
      c = c.parentNode ;
    }
    else {
      c = c_sib ;     
      _recAddComment(c, commentId) ;
    }
  } ;
};

// between elt1 and elt2 (which are excluded)
_dynSpanInBetween = function (anc, elt1, elt2, commentId) {
  var a = elt1 ;
  var elt1Anc = null ;
    while (a) {
        if (a.parentNode === anc) {
          elt1Anc = a ;
          break;
        }
        a = a.parentNode;
    }
  if (elt1Anc != null) {
    a = elt2 ;
    var elt2Anc = null ;
      while (a) {
          if (a.parentNode === anc) {
            elt2Anc = a ;
            break;
          }
          a = a.parentNode;
      }
    if (elt2Anc != null) { // found both ancestor, now doing the work
      a = elt1Anc.nextSibling ;
      while ((a != null) && (a !== elt2Anc)) {
        _recAddComment(a, commentId) ;
        a = a.nextSibling ;
      }
    }
  }
};

// (copied from YUI dom-base)
_bruteContains = function(element, needle) {
    while (needle) {
        if (element === needle) {
            return true;
        }
        needle = needle.parentNode;
    }
    return false;
};

//elt is supposed to be c-c classed
_addIdClass = function (elt, commentId) {
  CY.DOM.addClass(elt, 'c-id-' + commentId) ;
  var block_elt = _findParentBlockElt(elt);
  if (block_elt != null) {
    _unpaintCategories(block_elt);
    _repaintCategories(elt, block_elt);
  }
  _updateCommentCounter(elt) ;
};

//elt is supposed to be c-c classed
_removeIdClass = function (elt, commentId) {
  CY.DOM.removeClass(elt, 'c-id-' + commentId) ;
  var block_elt = _findParentBlockElt(elt);
  if (block_elt != null) {
    _unpaintCategories(block_elt);
    _repaintCategories(elt, block_elt, commentId);
  }
  _updateCommentCounter(elt) ;
};

//elt is supposed to be c-c classed
_removeIdClasses = function (elt) {
  var re = _cgetRegExp('(?:^|\\s+)c-id-(?:\\d+)', 'g');
  elt['className'] = elt['className'].replace(re, " ") ;
  _updateCommentCounter(elt) ;
  var block_elt = _findParentBlockElt(elt);
  if (block_elt != null) {
    _unpaintCategories(block_elt);
  }
};

// Finds the closest parent of an element which is a block.
_findParentBlockElt = function(elt) {
  var block_elt = elt;
  var block_elt_style = block_elt.currentStyle || window.getComputedStyle(block_elt, ""); 
  var block_elt_display = block_elt_style.display;
  while (block_elt != null && block_elt_display != 'block') {
    block_elt = block_elt.parentElement;
    block_elt_style = block_elt.currentStyle || window.getComputedStyle(block_elt, ""); 
    block_elt_display = block_elt_style.display;
  }
  return block_elt;
};

// Removes all vertical bars from a block element.
_unpaintCategories = function(block_elt) {
  CY.DOM.removeClass(block_elt, 'cat1');
  CY.DOM.removeClass(block_elt, 'cat2');
  CY.DOM.removeClass(block_elt, 'cat3');
  CY.DOM.removeClass(block_elt, 'cat4');
  CY.DOM.removeClass(block_elt, 'cat5');
};

// Paints all vertical bars of a block element but the one for commentId if not null.
_repaintCategories = function(elt, block_elt, commentId) {
  // Loop through all comments in this wrapper id
  var wrapper_id = parseInt(getWrapperAncestor(elt).id.substr(3));
  var len = gDb.comments.length;
  for (var i=0; i<len; i++) {
    if (i in gDb.comments) {
      var comment = gDb.comments[i];
      if ((commentId == null || comment.id != commentId) && comment.start_wrapper <= wrapper_id && comment.end_wrapper >= wrapper_id) {
        if (comment.category) {
          CY.DOM.addClass(block_elt, 'cat' + comment.category);
        }
      }
    }
  }
};

_recAddComment = function (elt, commentId) {
  if (CY.DOM.hasClass(elt, 'c-c')) {
    _addIdClass(elt, commentId) ;
  }
  else {
    var c = elt.firstChild ;
        while (c != null) {
          _recAddComment(c, commentId) ;
      c = c.nextSibling ;
        }
    }
};

// might be expensive ... (? maybe should use contains when available, instead
// of custom _bruteContains)
_findCommonAncestor = function (elt1, elt2) {
  if (_bruteContains(elt1, elt2))
    return elt1 ;
  else {
    var e = elt2 ;
    while ((e != null) && !_bruteContains(e, elt1)) {
      e = e.parentNode ; 
    }
    return e ;
  }
};

_cregexCache = {};
// inspired (copied) from dom-base-debug in yui
_cgetRegExp = function(str, flags) {
    flags = flags || '';
    if (!_cregexCache[str + flags]) {
        _cregexCache[str + flags] = new RegExp(str, flags);
    }
    return _cregexCache[str + flags];
};

//c-c should be classed with a c-count-x where x is a number for color graduation
//c-c should be classed with many c-id-xid where xid is the comment db id of comment that apply to it
_updateCommentCounter = function (elt) {
  var re = _cgetRegExp('(?:^|\\s+)c-id-(?:\\d+)', 'g');
  var matches = elt['className'].match(re);
  var countIds = (matches == null) ? 0 : gDb.getThreads(CY.Array.map(matches, function(item) {return gDb.getComment(parseInt(item.replace(/\D/g, '')));})).length
  
  re = _cgetRegExp('(?:^|\\s+)c-count-(?:\\d+)', 'g');
  elt['className'] = elt['className'].replace(re, " ") ;
  CY.DOM.addClass(elt, 'c-count-'+countIds+' ') ;
  if (countIds > 0) {
    elt.setAttribute ('title', countIds + ngettext(' comment', ' comments', countIds));
    if (countIds > 25) {
      // ensure that we have the last color even if there are too many comments on the same place
      CY.DOM.addClass(elt, 'c-count-25') ;
    }
  }
};

_convertSelectionFromCCToCS = function (sel) {
  var offset = sel['offset'] ;
  var elt = sel['elt'].parentNode ;
  
  var e = sel['elt'].previousSibling ;
  while (e != null) {
    offset += _getTextNodeContent(e).length ;
    e = e.previousSibling ; // will be a c-c !!
  }
  
  return  {'elt':elt, 'offset':offset} ;
};

_convertSelectionFromCSToCC = function (sel) {
  var ret = {'elt':null, 'offset':-1} ;
  
  var cc = null ;
  var ccElt = sel['elt'].firstChild ;
  var length = 0 ;
  while (ccElt != null) {
    var prevLength = length ;
    length += _getTextNodeContent(ccElt).length ;
    if (length >= sel['offset']) {
      ret['elt'] = ccElt ;
      ret['offset'] = sel['offset'] - prevLength ;
      break ;
    }
    ccElt = ccElt.nextSibling ; // will be a c-c !!
  }
  return ret ;
};


/*******************************************************************************/
/* SCOPE REMOVAL */
/*******************************************************************************/

unpaintCommentScope = function(comment) {
    var dbId = comment.id;

  var classeId = 'c-id-' + dbId ;
  var toBeRemovedElts = [] ;

  var cNodeList = CY.all("."+classeId) ;
  if (cNodeList != null) { // null in case of a reply ...
    for (var i = 0, ilen = cNodeList.size() ; i < ilen ; i++)  {
      var c = cNodeList.item(i) ;
      if (c.hasClass('c-c')) { // always will !!
        var cElt = CY.Node.getDOMNode(c) ;
        _removeIdClass(cElt, dbId) ;
        
        var cIds = getCommentIdsFromClasses(cElt) ;
        quicksort(cIds) ;
        
        var p = c.get('previousSibling') ;
        if (p != null) {
          var pElt = CY.Node.getDOMNode(p) ;
          var pIds = getCommentIdsFromClasses(pElt) ; 
          quicksort(pIds) ;
          if (areSortedArraysEqual(cIds, pIds)) {
            _setTextNodeContent(cElt, _getTextNodeContent(pElt) + _getTextNodeContent(cElt)) ;            
            toBeRemovedElts.push(pElt) ;
          }
        }
        
        var n = c.get('nextSibling') ;
        if (n != null) {
          var nElt = CY.Node.getDOMNode(n) ;
          var nIds = getCommentIdsFromClasses(nElt) ; 
          quicksort(nIds) ;
          if (areSortedArraysEqual(cIds, nIds)) {
            cElt.firstChild.data = cElt.firstChild.data + nElt.firstChild.data; 
            toBeRemovedElts.push(nElt) ;
          }
        }
      }
      else {
        alert('HAS NO c-c ? : ' + commentNode.get('id') + " , innerHTML :" + commentNode.get('innerHTML')) ;
        return ;
      }
    }
  }
  for (var i = 0, ilen = toBeRemovedElts.length ; i < ilen ; i++)  {
    toBeRemovedElts[i].parentNode.removeChild(toBeRemovedElts[i]) ;
  }
};

// not related to the unpaintCommentScope function (faster)
unpaintAllComments = function() {
  var cNodeList= CY.all(".c-s") ;
  var toBeRemovedElts = [] ;
  for (var i = 0, ilen = cNodeList.size() ; i < ilen ; i++)  {
    var c = cNodeList.item(i) ;
    
    // remove Classes
    var fc = c.get('firstChild') ;
    var fcElt = CY.Node.getDOMNode(c.get('firstChild')) ;
    _removeIdClasses(fcElt) ;
    
    // merge nodes
    var n = fc.get('nextSibling') ;
    while (n != null)  {
      var nElt = CY.Node.getDOMNode(n) ;
      fcElt.firstChild.data = fcElt.firstChild.data + nElt.firstChild.data; 
      toBeRemovedElts.push(nElt) ;
      n = n.get('nextSibling') ;
    }
  }
  for (var i = 0, ilen = toBeRemovedElts.length ; i < ilen ; i++)  {
    toBeRemovedElts[i].parentNode.removeChild(toBeRemovedElts[i]) ;
  }

};

showScope = function(commentDbId) {
  var s = CY.all('.c-id-' + commentDbId); 
  if (s != null)
    s.addClass('c-scope') ;
};

hideScopeAnyway = function() {
  var s = CY.all('.c-scope'); 
  if (s != null)
    s.removeClass('c-scope') ;
};
