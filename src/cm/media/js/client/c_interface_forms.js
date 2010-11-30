gNoSelectionYet = gettext("No selection yet") ;
gFormHtml = {
    'formStart'   :'<form id="###" onsubmit="return false;">',
    'nameInput'   :gettext('Username:') + '<center><input id="###" name="name" class="n_name user_input" style="padding:1px;" type="text"></input></center>',
    'emailInput'  :gettext('E-mail address:') + '<center><input id="###" name="email" class="n_email user_input" style="padding:1px;" type="text"></input></center>',
    'titleInput'  :gettext('Title:') + '<center><input id="###" name="title" class="n_title comment_input" style="padding:1px;" type="text"></input></center>',
    'contentInput'  :gettext("Content:") + '<center><textarea id="###" name="content" class="n_content comment_input" rows="10" style="padding:1px;"></textarea></center>',
    'tagsInput'   :gettext("Tag:") + '<center><input id="###" name="tags" class="n_tags comment_input" style="padding:1px;" type="text"></input></center>',
    'hidden'    :'<input id="###" class="comment_input" name="???" type="hidden" value=""></input>',
    'formEnd'     :'</form>',
    'changeScope'   :'<div id="###">' + gettext("Modify comment's scope:") + '<input type="checkbox" name="change_scope"></input></div>',
    'headerTitle' :'<center><div id="###" class="c-header-title"></div></center>',
    'currentSel'  :'<div id="###">' + gettext('Comment will apply to this selection:') + '<br/><div class="current_sel"><div id="???" class="current_sel_ins">' + gNoSelectionYet + '</div></div>#hiddeninput#</div>',
    'btns'      :'<center><input id="###" type="button" value="' + gettext('Save') + '" /><input id="???" type="button" value="' + gettext('Cancel') + '" /></center>',
    'closeIcon'   :'<a id="###" class="c-close" title="' + gettext('close') + '"><em>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em></a>'
    } ;

// returns {'headerContent':headerHtml, 'bodyContent':bodyHtml}
getHtml = function(ids) {
  ret = {} ;
  ret['headerContent'] = '' ;
  
  if ('closeBtnId' in ids)
    ret['headerContent'] += gFormHtml['closeIcon'].replace('###', ids['closeBtnId']) ;
  
  ret['headerContent'] += gFormHtml['headerTitle'].replace('###', ids['formTitleId']) ;

  var selEditChkBoxHtml = "" ;
  if ('changeScopeInputId' in ids)
    selEditChkBoxHtml = gFormHtml['changeScope'].replace('###', ids['changeScopeInputId']) ;
  
  var hiddenInput = '<center>'+gFormHtml['hidden'].replace('###', ids['selectionPlaceId']).replace('???', 'selection_place')+'</center>' ;
  var selectionTitleHtml = gFormHtml['currentSel'].replace('###', ids['currentSelId']).replace('???', ids['currentSelIdI']).replace('#hiddeninput#', hiddenInput) ;
  
  var btnsHtml =   gFormHtml['btns'].replace('###', ids['addBtnId']).replace('???', ids['cancelBtnId']) ;
  
  var html = gFormHtml['formStart'].replace('###', ids['formId']) + selEditChkBoxHtml + selectionTitleHtml ;
  
  if ('nameInputId' in ids)
    html = html + gFormHtml['nameInput'].replace('###', ids['nameInputId'])  ;
  if ('emailInputId' in ids)
    html = html + gFormHtml['emailInput'].replace('###', ids['emailInputId']) ;
  
  html = html + gFormHtml['titleInput'].replace('###', ids['titleInputId']) + gFormHtml['contentInput'].replace('###', ids['contentInputId']) + gFormHtml['tagsInput'].replace('###', ids['tagsInputId']);
  html = html + gFormHtml['hidden'].replace('###', ids['formatInputId']).replace('???', 'format') ;
  html = html + gFormHtml['hidden'].replace('###', ids['startWrapperInputId']).replace('???', 'start_wrapper') ;
  html = html + gFormHtml['hidden'].replace('###', ids['endWrapperInputId']).replace('???', 'end_wrapper') ;
  html = html + gFormHtml['hidden'].replace('###', ids['startOffsetInputId']).replace('???', 'start_offset') ;
  html = html + gFormHtml['hidden'].replace('###', ids['endOffsetInputId']).replace('???', 'end_offset') ;
  html = html + gFormHtml['hidden'].replace('###', ids['keyId']).replace('???', 'comment_key') ;
  html = html + gFormHtml['hidden'].replace('###', ids['editCommentId']).replace('???', 'edit_comment_id') ;
  html = html +  btnsHtml + gFormHtml['formEnd'] ;  
  ret['bodyContent'] = html ;
  return ret ;
} ;

changeFormFieldsWidth = function(formId, val) {
  var fieldWidth = (val - 20) +'px' ;
  var elts = CY.all("#" + formId + " input[type='text']") ;
  if (elts != null)
    elts.setStyle("width", fieldWidth) ;
  elts = CY.all("#" + formId + " textarea") ;
  if (elts != null)
    elts.setStyle("width", fieldWidth) ;
}

addFormErrMsg = function(formId, eltName, errorString) {
  var formElt = document.getElementById(formId) ;
    var i, e, s, ilen ;

    // Iterate over the form elements collection to construct the
    // label-value pairs.
    for (i = 0, ilen = formElt.elements.length; i < ilen; ++i) {
        e = formElt.elements[i];
        if (e.name == eltName) {
          s = document.createElement('DIV') ;
          CY.DOM.addClass(s, 'c-error') ;
          s.id = e.id + '-err';
          s.appendChild(document.createTextNode(errorString)) ;
          if (e.parentNode.nextSibling)
            e.parentNode.parentNode.insertBefore(s, e.parentNode.nextSibling) ;
          else 
            e.parentNode.parentNode.appendChild(s) ;
        }

    }
}

// frames['text_view_frame'].removeFormErrMsg(frames['text_view_frame'].gICommentForm['formId'])
removeFormErrMsg = function(formId) {
  var nodes = CY.all('#'+formId+' .c-error');
  if (nodes != null)
    nodes.each(function (node) {node.get('parentNode').removeChild(node) ;}) ;
}

