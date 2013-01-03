function check_save(){
  var newVersion = $('#id_new_version').attr('checked') ;
  var commentsKept = $('#id_keep_comments').attr('checked') ;

  if (commentsKept) {
    submit_edit_form();
  }
  else {
    if (!newVersion) {
      var message = gettext("You chose not to create a new version all comments will be deleted") ;
      message += '<br />' ;
      message += gettext( 'Do you want to continue?') ;
      $('#confirm_all_removed_dlg').html(message) ;
      $('#confirm_all_removed_dlg').dialog('open') ;
    }
    else {
      submit_edit_form() ;        
    }
  }
}

function submit_edit_form() {
  needToConfirm = false;
    $('#edit_form').submit();
}

$(function() {
  var buttons = {};
  buttons[gettext('No')] = function() {
    $(this).dialog('close');
  } ;
  buttons[gettext('Yes')] = function() {
    $(this).dialog('close');submit_edit_form();
  } ; 

  $('#confirm_all_removed_dlg').dialog({
    bgiframe: true, 
    autoOpen: false,        
    title :gettext('Warning'),
    modal: true,
    buttons:buttons
  }) ;

  $("#save").click(function() { check_save() ;}) ;
}) ;
