// this == dom element
onFadeEnd = function () {
  $(this).remove() ;
} ;

_enqueueMsg = function(msg, cls, remainVisibleTime) {
  var m = $('<span>' + msg + '</span>').addClass("f-msg-cls").addClass(cls).appendTo("#t-msg-wrapper") ;
  if (remainVisibleTime)
    m.parent().animate({'opacity':.95}, remainVisibleTime).fadeOut(2000, onFadeEnd) ;
  return m ;
  
}

enqueueMsg = function(msg) {
  var cls = "f-msg" ;
  var remainVisibleTime = 2000 ;
  _enqueueMsg(msg, cls, remainVisibleTime) ;  
}

enqueueErrorMsg = function(msg) {
  var cls = "f-msg-e" ;
  var remainVisibleTime = 4000 ;
  _enqueueMsg(msg, cls, remainVisibleTime) ;  
}

setCookie = function(name, value) {
  var cookieExpire = new Date();
  cookieExpire.setFullYear(2100, 0, 1);
  $.cookie(name, value, {
    'expires' :cookieExpire,
    'path': '/'
  });
}

/* utility function to remember form field value into cookie */
rememberFormField = function(form_id, field_id, cookie_name) {
  /* value gets fetched from cookie if possible */  
  $(document).ready(function(){
    var cookie_val = $.cookie(cookie_name); 
    if (cookie_val) {
      $('#' + form_id + ' #' + field_id)[0].value = cookie_val; 
    }
  })

  /* value gets saved on submit */
  $(document).ready(function(){
    $('#' + form_id + ' input[type=submit]').click(function() {
      var val = $('#' + form_id + ' #' + field_id)[0].value;
      if (val) {
        setCookie(cookie_name, val);
      }
      });
  })  
}

