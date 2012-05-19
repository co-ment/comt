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

$.ajaxSetup({ 
     beforeSend: function(xhr, settings) {
         function getCookie(name) {
             var cookieValue = null;
             if (document.cookie && document.cookie != '') {
                 var cookies = document.cookie.split(';');
                 for (var i = 0; i < cookies.length; i++) {
                     var cookie = jQuery.trim(cookies[i]);
                     // Does this cookie string begin with the name we want?
                 if (cookie.substring(0, name.length + 1) == (name + '=')) {
                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                     break;
                 }
             }
         }
         return cookieValue;
         }
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     } 
});
