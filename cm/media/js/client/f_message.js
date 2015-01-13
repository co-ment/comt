//// unique id generator.
//$.extend($.fn, {
//  id : function () {
//    return this.each(function () {
//      $(this).attr("id", "f-" + $.data(this));
//    });
//  }
//}); 
//

// this == dom element
onFadeEnd = function () {
  $(this).remove() ;
} ;

gLoadingMsg = null ;
enqueueLoadingMsg = function() {
  gLoadingMsg = _enqueueMsg (gettext("loading..."), "", null) ;
}

removeLoadingMsg = function() {
  if (gLoadingMsg != null) {
    gLoadingMsg.remove() ;
    gLoadingMsg = null ;
  }
}

_enqueueMsg = function(msg, cls, remainVisibleTime) {
  var m = $('<span>' + msg + '</span>').appendTo("#c-msg-wrapper").addClass("f-msg-cls").addClass(cls) ;
  if (remainVisibleTime)
    m.animate({'opacity':.95}, remainVisibleTime).fadeOut(2000, onFadeEnd) ;
  return m ;
  
}

enqueueMsg = function(msg) {
//  while ($("#c-msg-wrapper .f-msg-cls").children().size() > 1) {
//    $("#c-msg-wrapper .f-msg-cls:first").stop(false, true) ;
//  }
//  
  var cls = "f-msg" ;
  var remainVisibleTime = 8000 ;
  _enqueueMsg(msg, cls, remainVisibleTime) ;
}

enqueueErrorMsg = function(msg) {
  var cls = "f-msg-e" ;
  var remainVisibleTime = 4000 ;
  _enqueueMsg(msg, cls, remainVisibleTime) ;  
}
