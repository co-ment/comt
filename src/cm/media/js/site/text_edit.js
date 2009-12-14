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
                				'%(nb_comments)s comment will be removed because the text it applies to has been changed.',
                				'%(nb_comments)s comments will be removed because the text they apply to has been changed.', 
								nb_removed) ;
                		message += '<br />' ;
                		message += gettext( 'Do you want to continue?') ;
                		message = interpolate(message,{'nb_comments':nb_removed}, true) ;		
                		
                        $('#check_save_dialog').html(message) ;
                        $('#check_save_dialog').dialog('open') ;
                    }
               }
               else {                  
                   if (nb_removed == 0) {
                        $('#edit_form').submit();
                    }
                   else {
	               		var message = ngettext(  
	               				'%(nb_comments)s comment will be lost because the text it applies to has been changed.',
	               				'%(nb_comments)s comments will be lost because the text they apply to has been changed.',	               								
								nb_removed) ;
                		message += '<br />' ;
                		message += gettext( '(We suggest you create a new version)') ;
                		message += '<br />' ;
                		message += gettext( 'Do you want to continue?') ;
                		message = interpolate(message,{'nb_comments':nb_removed}, true) ;		

                 		$('#check_save_dialog').html(message) ;
                        $('#check_save_dialog').dialog('open') ;
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
                var message = gettext("Since you chose not to create a new version all comments will be deleted") ;
        		message += '<br />' ;
        		message += gettext( 'Do you want to continue?') ;
                $('#check_save_dialog').html(message) ;
                $('#check_save_dialog').dialog('open') ;
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

    $('#check_save_dialog').dialog({
        bgiframe: true, 
        autoOpen: false,        
        title :gettext('Warning'),
        modal: true,
        buttons:buttons
    }) ;
    
    $("#save").click(function() { check_save() ;}) ;
}) ;
