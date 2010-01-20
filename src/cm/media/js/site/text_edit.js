function check_save(){
    needToConfirm = false;

    var newVersion = $('#id_new_version').attr('checked') ;
    var commentsKept = $('#id_keep_comments').attr('checked') ;

    var new_content = $('#id_content').val()
    var new_format = $('#id_format').val()
    
    if (commentsKept) {
        var pre_edit_url = tb_conf['pre_edit_url'] ;

        $.ajax({
           url: pre_edit_url,
           type:'POST',
           dataType:"json",
           data: { "new_content": new_content,  "new_format": new_format},
           success: function(obj){
               nb_removed = obj['nb_removed'];
               if (newVersion) {
                    if (nb_removed == 0) {
                        $('#edit_form').submit();
                    }
                    else {
                		var message = ngettext( 
                				'%(nb_comments)s comment applies to text that was modified.',
                				'%(nb_comments)s comments apply to text that was modified.', 
								nb_removed) ;
                		message += '<br />' ;
                		message += gettext( 'Should comments be kept with no scope or entirely removed from new version?') ;
                		message = interpolate(message,{'nb_comments':nb_removed}, true) ;		
                		
                        $('#remove_scope_choice_dlg').html(message) ;
                        $('#remove_scope_choice_dlg').dialog('open') ;
                    }
               }
               else {                  
                   if (nb_removed == 0) {
                        $('#edit_form').submit();
                    }
                   else {
	               		var message = ngettext(  
	               				'%(nb_comments)s comment applies to text that was modified.',
                				'%(nb_comments)s comments apply to text that was modified.', 
								nb_removed) ;
                		message += '<br />' ;
                		message += gettext( '(We suggest you create a new version)') ;
                		message += '<br />' ;
                		message += gettext( 'Should comments be kept with no scope or entirely removed?') ;
                		message = interpolate(message,{'nb_comments':nb_removed}, true) ;		

                 		$('#remove_scope_choice_dlg').html(message) ;
                        $('#remove_scope_choice_dlg').dialog('open') ;
                   }
               }
           },
           error: function(msg){
               alert("error: " + msg);
           }
        });
    }
    else {
        if (!newVersion) {
            var message = gettext("You chose not to create a new version all comments will be deleted") ;
        		message += '<br />' ;
        		message += gettext( 'Do you want to continue?') ;
                $('#confirm_all_removed').html(message) ;
                $('#confirm_all_removed').dialog('open') ;
        }
        else {
            $('#edit_form').submit();
        }
    }
}

$(function() {
	var buttons = {};
	buttons[gettext('No')] = function() {$(this).dialog('close');} ;
	buttons[gettext('Yes')] = function() {$(this).dialog('close');$('#edit_form').submit();} ;

    $('#confirm_all_removed').dialog({
        bgiframe: true, 
        autoOpen: false,        
        title :gettext('Warning'),
        modal: true,
        buttons:buttons
    }) ;
    
	var buttons0 = {};
	buttons0[gettext('Detach')] = function() {$(this).dialog('close');$('#cancel_modified_scopes').val("1");$('#edit_form').submit();} ;
	buttons0[gettext('Remove')] = function() {$(this).dialog('close');$('#cancel_modified_scopes').val("0");$('#edit_form').submit();} ;
	buttons0[gettext('Cancel')] = function() {$(this).dialog('close');} ;

    $('#remove_scope_choice_dlg').dialog({
        bgiframe: true, 
        autoOpen: false,        
        title :gettext('Warning'),
        modal: true,
        buttons:buttons0
    }) ;

    $("#save").click(function() { check_save() ;}) ;
}) ;
