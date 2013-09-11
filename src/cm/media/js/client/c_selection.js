getWrapperAncestor = function(elt) {
  var parent = elt ;
  while (parent != null) {
      if (CY.DOM.hasClass(parent, 'c-s')) 
        return parent ;
      parent = parent.parentNode ;
  }
  return null ; 
}

hasWrapperAncestor = function(elt) {
  return (getWrapperAncestor(elt) != null) ;
/*  var parent = elt ;
  while (parent != null) {
      if (CY.DOM.hasClass(parent, 'c-s')) 
        return true ;
      parent = parent.parentNode ;
  }
  return false ;*/ 
}

// returns null or :
// {'text' : textcontent, 'start': {'elt':startNode, 'nbChar':startOffset(==number of characters to selection start in the start node},
// 'end': ....}
// the text attribute is informational having it empty doesn't mean selection is empty !!

// when selection starts/ends in/on a non textual element (<hr/> for example) we very often have anchorNode/focusNode == body elt
// TODO adapt this body case by considering offset ( cf. http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html)
getSelectionInfo  = function () {
  var startNode = null, endNode = null, startOffset = 0, endOffset = 0, text = '' ;
  
  if (window.getSelection) { // everything else than IE
    var userSelection = window.getSelection();

    if (userSelection.rangeCount > 0) {
      var range = userSelection.getRangeAt(0) ;
      text = range.toString() ;
      if (text != "")  {
        
        // selection occured from right to left ? :
        var r1 = document.createRange() ;r1.setStart(userSelection.anchorNode, userSelection.anchorOffset) ;r1.collapse(true) ;
        var r2 = document.createRange() ;r2.setEnd(userSelection.focusNode, userSelection.focusOffset) ;r2.collapse(false) ;
        var leftToRight = (r2.compareBoundaryPoints(2, r1) == 1) ; // 2 is for END_TO_END
//        CY.log("leftToRight : " + leftToRight) ;
        startNode = (leftToRight) ? userSelection.anchorNode.parentNode : userSelection.focusNode.parentNode ;  
        // GIB: when selecting amath, we should go up in the dom to find the accurate start/end Nodes
        if (startNode.nodeName == 'mi' || startNode.nodeName == 'mo') {
          startNode = startNode.parentElement.parentElement.parentElement.parentElement;
        }
        innerStartNode = (leftToRight) ? userSelection.anchorNode : userSelection.focusNode ;
        endNode = (leftToRight) ? userSelection.focusNode.parentNode : userSelection.anchorNode.parentNode;
        // GIB: when selecting amath, we should go up in the dom to find the accurate start/end Nodes
        if (endNode.nodeName == 'mi' || endNode.nodeName == 'mo') {
          endNode = endNode.parentElement.parentElement.parentElement.parentElement;
        }
        innerEndNode = (leftToRight) ? userSelection.focusNode : userSelection.anchorNode;
          
        startOffset = (leftToRight) ? userSelection.anchorOffset : userSelection.focusOffset;
        endOffset = (leftToRight) ? userSelection.focusOffset : userSelection.anchorOffset ;

        if (!hasWrapperAncestor(endNode) && hasWrapperAncestor(startNode)){
          var r3 = document.createRange() ;
          r3.setStart(innerStartNode, startOffset) ;

          var csStartAncestor = getWrapperAncestor(startNode) ;
          var next = csStartAncestor ;
          r3.setEndAfter(next) ;
          
          var ind = parseInt(csStartAncestor.id.substring('sv_'.length)) ;
          while(r3.toString().length < range.toString().length) {
              ind++ ;
              var node = CY.get("#sv_"+ind) ;
              if (node) {
                next = CY.Node.getDOMNode(node) ;
                r3.setEndAfter(next) ;
              }
              else 
                break ;
          }
          endNode = next.lastChild ;
          endOffset = CY.DOM.getText(endNode).length ;
        }
        else if (!hasWrapperAncestor(startNode) && hasWrapperAncestor(endNode)){
          var r3 = document.createRange() ;
          r3.setEnd(innerEndNode, endOffset) ;

          var csEndAncestor = getWrapperAncestor(endNode) ;
          var prev = csEndAncestor ;
          r3.setStartBefore(prev) ;
          
          var ind = parseInt(csEndAncestor.id.substring('sv_'.length)) ;
          while(r3.toString().length < range.toString().length) {
              ind-- ;
              var node = CY.get("#sv_"+ind) ;
              if (node) {
                prev = CY.Node.getDOMNode(node) ;
                r3.setStartBefore(prev) ;
              }
              else 
                break ;
          }
          startNode = prev.firstChild ;
          startOffset = 0 ;
        }
        else if (!hasWrapperAncestor(startNode) && !hasWrapperAncestor(endNode)){
          var textLength = text.length ;
          
          // gather nodes with id sv_xxxx as candidates for start ancestor
          var startNodeInds = [] ;
          for (var ind = 0 ;  ; ind++) {
            var svNode = CY.get("#sv_"+ind) ;
            if (svNode == null) {
              break;
            }
            else {
              var svText = svNode.get("text") ;
              if (text.indexOf(svText) == 0) {
                startNodeInds.push(ind) ;
              }
            }
          }
          
          // gather nodes with id sv_xxxx as candidates for end ancestor
          var endNodeInds = [] ;
          for (var ind = 0 ;  ; ind++) {
            var svNode = CY.get("#sv_"+ind) ;
            if (svNode == null) {
              break;
            }
            else {
              var svText = svNode.get("text") ;
              if (text.indexOf(svText) == (textLength - svText.length)) { // i.e. the selection exactly ends with svText
                endNodeInds.push(ind) ;
              }
            }
          }

          var stop = false ;
          for (var i = 0 ; i < startNodeInds.length ; i++) {
            for (var j = 0 ; j < endNodeInds.length ; j++) {
              var r4 = document.createRange() ;
              
              var s = CY.Node.getDOMNode(CY.get("#sv_"+startNodeInds[i])) ; var e = CY.Node.getDOMNode(CY.get("#sv_"+endNodeInds[j])) ;
              
              r4.setStartBefore(s) ; r4.setEndAfter(CY.Node.getDOMNode(e)) ;
              
              // does r4 starts after range start and r4 ends before range end ? 
              if ((-1 < r4.compareBoundaryPoints(0, range)) && (1 > r4.compareBoundaryPoints(2, range))) { 
                startNode = s.firstChild ;
                startOffset = 0 ;
                endNode = e.lastChild ;
                endOffset = CY.DOM.getText(e).length ;
                
                stop = true ; 
                break ;
              }
            }
            if (stop)
              break ;
          }             
        }       
        
        r1.detach() ;
        r2.detach() ;
      }
      else 
        return null ;
    }
    else 
      return null ;
    
  }
  else if (document.selection) { // IE case
    var rng = document.selection.createRange();
    if (rng.text.length == 0) 
      return null ;
    var el = rng.parentElement();

    // duplicate the range and collapse it to its start, to ask IE the parent element of the start textNode.    
    var rngStart = rng.duplicate();
    var rngEnd = rng.duplicate();

    rngStart.collapse(true); // collapse to start
    rngEnd.collapse(false);  // collapse to end
    
    startNode = rngStart.parentElement() ;
    while(rngStart.moveStart('character', -1) != 0) {
      if (rngStart.parentElement() != startNode)
        break ;
      startOffset++ ;
    }
    endNode = rngEnd.parentElement() ;
    while(rngEnd.moveEnd('character', -1) != 0) {
      if (rngEnd.parentElement() != endNode)
        break ;
      endOffset++ ;
    }
    
    text = rng.text ;
  }
  
  if (!hasWrapperAncestor(startNode) || !hasWrapperAncestor(endNode)){
    // CY.log('no wrapper on one end') ;
    return null ;
  }
  return {'text' : text, 'start' : {'elt':startNode, 'offset':startOffset}, 'end' : {'elt':endNode, 'offset':endOffset}} ;
}
