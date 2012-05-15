from django import forms
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.translation import ugettext as _, ugettext_lazy
from cm.converters.pandoc_converters import pandoc_convert, do_tidy
from cm.models import Text, TextVersion, Attachment, Comment
import mimetypes
import simplejson
from cm.cm_settings import USE_ABI
EXPORT2_INFOS = {
# key -> { mimetype, extension}
's5' :   {},
'pdf' :  {'mimetype': 'application/pdf', 'extension':'pdf'},
'markdown' :  {'mimetype': 'text/plain', 'extension':'mkd'},
'odt' :  {'mimetype': 'application/vnd.oasis.opendocument.text', 'extension':'odt'},
'doc' :  {'mimetype': 'application/msword', 'extension':'doc'},
'docx' :  {'mimetype': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'extension':'docx'},
'latex' :{'mimetype': 'text/x-tex', 'extension':'tex'},
'html' :{'mimetype': 'text/html', 'extension':'html'},
# raw export
'raw' : {'mimetype': 'text/plain', 'extension':'txt'}
}
def content_export2(request, content, title, content_format, format, use_pandoc, download_response):
    # TODO : formats must be imported from converters
#    import pdb;pdb.set_trace()
    if format == 'raw' :
        export_content = content
    elif content_format == 'html' and format == 'html':
        export_content = HTML_HEADER % content
    elif content_format == 'markdown' and format == 'markdown':
        export_content = content
    else:
        if use_pandoc :
          # markdown2pdf is buggy => convert to HTML and use abiword to export in PDF
          if format == 'pdf' and USE_ABI:
            html_content = pandoc_convert(content, content_format, 'html', full=True)
            from cm.converters.abi_converters import AbiFileConverter
            converter = AbiFileConverter()
            full_content = converter.add_html_header(html_content)
            fix_content = do_tidy(full_content)
            export_content = converter.convert_from_html(fix_content, format)
          else:
            export_content = pandoc_convert(content, content_format, format, full=True)
        else :
            fix_content = content
            if content_format == 'html':
                if USE_ABI:
                  from cm.converters.abi_converters import AbiFileConverter
                  converter = AbiFileConverter()
                  full_content = converter.add_html_header(content)
                  fix_content = do_tidy(full_content)
                else:
                  from cm.converters.oo_converters import combine_css_body                
                  fix_content = combine_css_body(content, '')
            if USE_ABI:
              from cm.converters.abi_converters import AbiFileConverter
              converter = AbiFileConverter()
              export_content = converter.convert_from_html(fix_content, format)
            else:
              from cm.converters.oo_converters import convert_html as oo_convert                
              export_content = oo_convert(fix_content, format)
    
    export_infos = EXPORT2_INFOS[format]
     
    if download_response:
        return _response_download(export_content, title, export_infos['mimetype'], export_infos['extension']) ;
    else:
        return _response_write(export_content)    
    
def content_export_new(request, content, title, src_format, format, use_pandoc, download_response):
    # TODO : formats must be imported from converters
    if format == 'raw' :
        export_content = content
    elif src_format == format and format == 'html':
        export_content = HTML_HEADER % content
    else:
        if use_pandoc :
            export_content = pandoc_convert(content, src_format, format, full=True)
        else :
            fix_content = content
            if src_format == 'html':
                from cm.converters.oo_converters import combine_css_body                
                fix_content = combine_css_body(content, '')
            from cm.converters.oo_converters import convert_html as oo_convert                
            export_content = oo_convert(fix_content, format)
    
    export_infos = EXPORT_INFOS[format]
    format_download = export_infos[0] 
     
    if download_response:
        return _response_download(export_content, export_infos[1], export_infos[2]) ;
    else:
        return _response_write(export_content)    
    

# read conversion chain 
# execute chain 
# ready to send response
#    # TODO : formats must be imported from converters
#    if format == 'raw' :
#        export_content = content
#    elif src_format == format and format == 'html':
#        export_content = HTML_HEADER % content
#    else:
#        if use_pandoc :
#            export_content = pandoc_convert(content, src_format, format, full=True)
#        else :
#            fix_content = content
#            if src_format == 'html':
#                fix_content = combine_css_body(content, '')
#            export_content = oo_convert(fix_content, format)
#    
## send response
#    export_infos = EXPORT_INFOS[format]
#    mimetype = export_infos['mimetype']
#    extension = export_infos['extension']
#    
#    if download:
#        return _response_download(export_content, mimetype, extension)
#    else :
#        return _response_write(export_content)
#
def _response_download(content, title, mimetype, extension):
    response = HttpResponse(mimetype=mimetype)
    file_title = title + '.' + extension
    from email.header import Header
    encoded_name = str(Header(file_title.encode('utf8'), charset='utf8', maxlinelen=500))
    # TODO: find a way to include long (more than 76 chars) into header
    encoded_name = encoded_name.replace('\n','')
    response['Content-Disposition'] = 'attachment; filename=%s' % encoded_name
    response.write(content)
    return response        

def _response_write(content):
    response = HttpResponse()
    response.write(content)
    return response


EXPORT_INFOS = {
# key -> [ download?, mimetype, extension]
's5' :   [False , ],
'pdf' :  [True , 'application/pdf' , 'pdf'],
'markdown' :  [True , 'text/plain' , 'mkd'],
'odt' :  [True , 'application/vnd.oasis.opendocument.text', 'odt'],
'doc' :  [True , 'application/msword', 'odt'],
'docx' :  [True , 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
'latex' :[True , 'text/x-tex', 'tex'],
'html' :[True , 'text/html', 'html'],
# raw export
'raw' : [True, 'text/plain', 'txt']
}
HTML_HEADER = u"""
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html><head>
<STYLE TYPE='text/css'>
div.pagebreakhere {
    page-break-before: always ;
}
</STYLE>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head>
<body>%s</body>
</html>
"""
EXPORT_FORMATS = EXPORT_INFOS.keys()
 
def content_export(request, content, title, src_format, format, use_pandoc):
    # TODO : formats must be imported from converters
    if format == 'raw' :
        export_content = content
    elif src_format == format and format == 'html':
        export_content = HTML_HEADER % content
    else:
        if use_pandoc :
            export_content = pandoc_convert(content, src_format, format, full=True)
        else :
            fix_content = content
            if src_format == 'html':
                from cm.converters.oo_converters import combine_css_body                
                fix_content = combine_css_body(content, '')
            from cm.converters.oo_converters import convert_html as oo_convert                
            export_content = oo_convert(fix_content, format)
    
    export_infos = EXPORT_INFOS[format]
    format_download = export_infos[0] 
     
    if format_download:
        format_mimetype = export_infos[1]
        format_extension = export_infos[2]
        
        response = HttpResponse(mimetype=format_mimetype)
        file_title = title + '.' + format_extension
        from email.header import Header
        encoded_name = str(Header(file_title.encode('utf8'), charset='utf8', maxlinelen=500))
        response['Content-Disposition'] = u'attachment; filename=%s' % encoded_name
        response.write(export_content)
        return response        
    else:
        response = HttpResponse()
        response.write(export_content)
        return response    
    

def text_export(request, key, format):
    # TODO : formats must be imported from converters
    format = format.lower()
    if format not in EXPORT_FORMATS:
        raise Exception("Unsupported format %s (supported formats %s)" % (format, ' '.join(EXPORT_FORMATS)))
    text = Text.objects.get(key=key)
    text_version = text.get_latest_version()
    
    return content_export(request, text_version.content, text_version.title, text_version.format, format)

def text_feed(request, key):
    return ""
