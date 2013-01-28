from django import forms
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template.loader import render_to_string
from django.template import RequestContext
from django.utils.translation import ugettext as _, ugettext_lazy
from django.contrib.auth.models import User
from django.conf import settings
from cm.converters.pandoc_converters import pandoc_convert, do_tidy
from cm.models import Text, TextVersion, Attachment, Comment
from cm.security import get_viewable_comments
import mimetypes
import simplejson
import imghdr
import base64
import re
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
'epub' :{'mimetype': 'application/epub+zip', 'extension':'epub'},
'raw' : {'mimetype': 'text/plain', 'extension':'txt'},
'xml' : {'mimetype': 'text/xml', 'extension':'xml'},
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
          if format in ('pdf', 'odt', 'docx', 'doc') and USE_ABI:
            html_content = pandoc_convert(content, content_format, 'html', full=True)
            from cm.converters.abi_converters import AbiFileConverter
            converter = AbiFileConverter()
            fix_content = converter.add_html_header(html_content)
            export_content = converter.convert_from_html(fix_content, format)
          else:
            export_content = pandoc_convert(content, content_format, format, full=True)
        else :
            fix_content = content
            if content_format == 'html':
                if USE_ABI:
                  from cm.converters.abi_converters import AbiFileConverter
                  converter = AbiFileConverter()
                  fix_content = converter.add_html_header(content)
                else:
                  from cm.converters.oo_converters import combine_css_body                
                  fix_content = combine_css_body(content, '')
            if USE_ABI:
              from cm.converters.abi_converters import AbiFileConverter
              converter = AbiFileConverter()
              try:
                export_content = converter.convert_from_html(fix_content, format)
              except:
                if content_format == 'html':
                  from cm.converters.oo_converters import combine_css_body                
                  fix_content = combine_css_body(content, '')
                from cm.converters.oo_converters import convert_html as oo_convert                
                export_content = oo_convert(fix_content, format)
            else:
              from cm.converters.oo_converters import convert_html as oo_convert                
              export_content = oo_convert(fix_content, format)
    
    export_infos = EXPORT2_INFOS[format]
     
    if download_response:
        return _response_download(export_content, title, export_infos['mimetype'], export_infos['extension']) ;
    else:
        return _response_write(export_content)    
    

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

def xml_export(request, text_version, whichcomments):
  # Text version infos
  template_dict = { 'title': text_version.title, 'created': text_version.created, 'modified': text_version.modified, 'format': text_version.format, 'content': text_version.content, 'tags': text_version.tags, }
  
  # Comments
  comments = [] # whichcomments=="none"
  if whichcomments == "filtered" or whichcomments == "all":
    _comments = text_version.comment_set.all()
    if whichcomments == "filtered" :
      filteredIds = []
      if request.method == 'POST' :
        ll = request.POST.get('filteredIds',[]).split(",")
        filteredIds = [ int(l) for l in ll if l]
      _comments = text_version.comment_set.filter(id__in=filteredIds)
    comments = get_viewable_comments(request, _comments, text_version, order_by=('start_wrapper','start_offset','end_wrapper','end_offset'))
    # Add user name/email if missing comment name/email
    for comment in comments:
      users = User.objects.filter(id=comment.user_id)
      if not(comment.name):
        comment.name = users[0].username
      if not(comment.email):
        comment.email = users[0].email
      
    template_dict['comments'] = comments

  # Author
  users = User.objects.filter(id=text_version.user_id)
  if text_version.name:
    template_dict['name'] = text_version.name
  else:
    template_dict['name'] = users[0].username
  if text_version.email:
    template_dict['email'] = text_version.email
  else:
    template_dict['email'] = users[0].email

  # Attachments
  attachments = []
  template_dict['content'] = re.sub("%s" %settings.SITE_URL, '', template_dict['content']) # replaces absolute urls by relative urls
  attach_re = r'(?:/text/(?P<key>\w*))?/attach/(?P<attach_key>\w*)/'
  attach_str_textversion = r'/text/%s/attach/%s/'
  attach_str = r'/attach/%s/'
  for match in re.findall(attach_re, template_dict['content']):
    if match[0]: # removes text_version, attachements do not need it
      template_dict['content'] = template_dict['content'].replace(attach_str_textversion %match, attach_str %match[1])

    attach = Attachment.objects.get(key=match[1])
    img_fmt = imghdr.what(attach.data.path)
    img = open(attach.data.path, 'rb')
    attachments.append({'key': match[1], 'data': base64.b64encode(img.read())})
    img.close()
  template_dict['attachments'] = attachments

  # Renders template
  export_content = render_to_string('site/export.xml', template_dict, context_instance=RequestContext(request))

  # Returns HTTP response
  export_infos = EXPORT2_INFOS['xml']
  return _response_download(export_content, text_version.title, export_infos['mimetype'], export_infos['extension']) ;
