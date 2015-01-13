//http://jqueryui.com/demos/dialog/modal-form.html

// TODO ? : get from the server 
// extension : label 
gFormats = [{'actions':['print'], 'extension':'html', 'label': gettext('print from the browser')},
            {'actions':['export'], 'extension':'html', 'label': gettext('download html file (.html)')},
            {'actions':['export'], 'extension':'markdown', 'label': gettext('download markdown file (.mkd)')},
            {'actions':['print'], 'extension':'pdf', 'label': gettext('print in PDF format')},
            {'actions':['export'], 'extension':'pdf', 'label': gettext('download portable object format file (.pdf)')},
            {'actions':['export'], 'extension':'latex', 'label': gettext('download latex file (.tex)')},
            {'actions':['export'], 'extension':'odt', 'label': gettext('download open document file (.odt)')},
            {'actions':['export'], 'extension':'doc', 'label': gettext('download microsoft word file (.doc)')},
            {'actions':['export'], 'extension':'docx', 'label': gettext('download microsoft word 2007 file (.docx)')}
            ];

var pandoc_version_ary = sv_pandoc_version.split('.');
if (parseInt(pandoc_version_ary[0]) > 1 || (parseInt(pandoc_version_ary[0]) == 1 && parseInt(pandoc_version_ary[1]) > 8)) {
  gFormats.push({'actions':['export'], 'extension':'epub', 'label': gettext('download ebook (.epub)')});
}

gFormats.push({'actions':['export'], 'extension':'xml', 'label': gettext('download XML file for re-importing text and comments')});

gActions = {'print':{'dialogTitle':gettext('Print text'), 'chooseFormatLabel':gettext('How do you want to print?'), 'defaultMethod':'pdf', 'defaultWithColors':"no", 'defaultWhichComments':'all'}, 
      'export':{'dialogTitle':gettext('Export text'), 'chooseFormatLabel':gettext('Choose file format'), 'defaultMethod':'pdf', 'defaultWithColors':"no", 'defaultWhichComments':'all'}} ; 
gCurrentAction = null ; 
  
_populateMethod = function(withColors) {
  var val = $("#p_method").val();
  
  $("#p_method").html("");
  
  for (var i = 0, ilen = gFormats.length ; i < ilen ; i++) {
    var actions = gFormats[i]['actions'] ;
    for (var j = 0, jlen = gFormats.length ; j < jlen ; j++) {
      if (actions[j] == gCurrentAction)
        $("<option value='" + gFormats[i]['extension'] + "'>" + gFormats[i]['label'] + "</option>").appendTo("#p_method");
    }
  }
  if (val)
    $("#p_method").val(val);
  else
    $("#p_method").val(gActions[gCurrentAction]['defaultMethod']);
  
} ;

_populateMarkersColorsChoice = function(withColors) {
  var val = $("#p_color").val();
  
  $("#p_color").html("");
  
  $("<option value='0'>" + gettext("using markers only, no background colors") + "</option>").appendTo("#p_color");
  $("<option value='1'>" + gettext("using markers and background colors") + "</option>").appendTo("#p_color");

  if (val)
    $("#p_color").val(val);
  else 
    $("#p_color").val(gActions[gCurrentAction]['defaultWithColors']);
} ;

_populateWhichComments = function() {
  var val = $("#p_comments").val();

  $("#p_comments").html("");
  var all = interpolate(gettext("all (%(nb_comments)s)"), {'nb_comments':frames['text_view_comments'].gDb.getCommentsNb(true)}, true) ;
  var currents = interpolate(gettext("current filtered ones (%(nb_comments)s)"), {'nb_comments':frames['text_view_comments'].gDb.getCommentsNb(false)}, true) ;
  $("<option value='all' >" + all +"</option>").appendTo($("#p_comments")) ;
  $("<option value='none' >" + gettext("none (0)") + "</option>").appendTo($("#p_comments")) ;
  $("<option value='filtered' >" + currents + "</option>").appendTo($("#p_comments")) ;
  
  if (val)
    $("#p_comments").val(val);
  else 
    $("#p_comments").val(gActions[gCurrentAction]['defaultWhichComments']);
} ;

_manageMarkersColorsChoice = function() {
  var method = $("#p_method").val();
  var which = $("#p_comments").val();
  var all = frames['text_view_comments'].gDb.getCommentsNb(true);
  var currents = frames['text_view_comments'].gDb.getCommentsNb(false);
  var nb_comments = (which == 'all') ? all : currents;
  
  var disableMarkersColorsChoice ;
  if (gCurrentAction == 'print') 
    disableMarkersColorsChoice = ((nb_comments == 0) || (which == 'none'));
  if (gCurrentAction == 'export') 
    // No colors for:
    // 1. no comments
    // 2. pandoc generated formats (markdown, latex, epub)
    // 3. odt and doc, for some reasons abiword cannot export background-color for these formats
    // 4. XML export (used for re-import)
    disableMarkersColorsChoice = ((nb_comments == 0) || (which == 'none') || (method == 'markdown') || (method == 'latex') || (method == 'epub') || (method == 'odt') || (method == 'doc') || (method == 'xml')) ;
  
  if (disableMarkersColorsChoice)
    $("#p_color").val('no');

  $("#p_color").prop("disabled", disableMarkersColorsChoice);
  
} ;

_initPrintDialog = function() {
  $('#p_comments').add($('#p_method')).change(function() {
    _manageMarkersColorsChoice() ;
    _prepareOpenInNewWindow() ;
  }) ;

  var buttons = {} ;
  buttons[gettext('Go !')] = function() {
    var whichComments = $("#p_comments").val() ;
    var withColor = $("#p_color").val() ;
    var format = $("#p_method").val() ;
    var download = (gCurrentAction == "export") ? "1" : (format == "html") ? "0" : "1" ;
    var targetUrl = $("#print_export_form").attr('target_action').replace(/FoRmAt/,format).replace(/DoWnLoAd/, download).replace(/WhIcHCoMmEnT/, whichComments).replace(/WiThCoLoR/, withColor) ;
    $("#print_export_form").attr('action', targetUrl) ;
    
    document['print_export_form'].submit();
    $(this).dialog('close');
  } ;
  buttons[gettext('Cancel')] = function() {
    $(this).dialog('close');
  } ;

  
  $("#dialog_print_export").dialog({
    bgiframe: true,
    autoOpen: false,
    width: 500,
/*    height: 300,
    autoResize: false,*/    
    modal: true,
    buttons: buttons,
    close: function() {
      ; // empty
    }
  });
}

openPrintDialog = function() {
  _openPrintExportDialog('print') ;
}

openExportDialog = function() {
  _openPrintExportDialog('export') ;
}

_prepareOpenInNewWindow = function() {
  var method = $("#p_method").val();
  if ((method == "html") && (gCurrentAction == 'print'))
    $("#print_export_form").attr("target", "_blank") ;
  else
    $("#print_export_form").removeAttr("target") ;
}

_openPrintExportDialog = function(action) {
  gCurrentAction = action ;
  $("#ui-dialog-title-dialog_print_export").html(gActions[gCurrentAction]['dialogTitle']) ;
  $("#how").html(gActions[gCurrentAction]['chooseFormatLabel']) ;
  $("#print_export_action").val(action) ; // TODO check this still usefull
  
  
  _populateWhichComments() ;
  _populateMarkersColorsChoice() ;  
  _populateMethod() ;
  
  _manageMarkersColorsChoice() ;
  _prepareOpenInNewWindow() ;

  $('#dialog_print_export').dialog('open');
}

/*    
      tips.text(t).effect("highlight",{},1500);
*/
