from piston.handler import AnonymousBaseHandler, BaseHandler
from piston.utils import rc

from cm.models import Text,TextVersion, Role, UserRole, Comment, Attachment
from cm.views import get_keys_from_dict, get_textversion_by_keys_or_404, get_text_by_keys_or_404, get_textversion_by_keys_or_404, redirect
from cm.security import get_texts_with_perm, has_perm, get_viewable_comments, \
    has_perm_on_text_api
from cm.security import get_viewable_comments
from cm.utils.embed import embed_html
from cm.views.create import CreateTextContentForm, create_text, CreateTextImportForm, _text_create_import
from cm.views.texts import client_exchange, text_view_frame, text_view_comments, text_export
from cm.views.feeds import text_feed
from piston.utils import validate
from django.conf import settings
from django.db.models import F

URL_PREFIX = settings.SITE_URL + '/api'
 
class AnonymousTextHandler(AnonymousBaseHandler):
    type = "Text methods"
    title = "Read text info"
    fields = ('key', 'title', 'format', 'content', 'created', 'modified', 'nb_comments', 'nb_versions', 'embed_html', ('last_text_version', ('created','modified', 'format', 'title', 'content')))   
    allowed_methods = ('GET', )   
    model = Text
    desc = """ Read text identified by `key`."""
    args = None

    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/'


    @has_perm_on_text_api('can_view_text')
    def read(self, request, key):
        
        text = get_text_by_keys_or_404(key)
        setattr(text,'nb_comments',len(get_viewable_comments(request, text.last_text_version.comment_set.all(), text)))
        setattr(text,'nb_versions',text.get_versions_number())
        setattr(text,'embed_html',embed_html(text.key))

        return text

class TextHandler(BaseHandler):
    type = "Text methods"    
    anonymous = AnonymousTextHandler
    allowed_methods = ('GET',)  
    no_display = True 

class AnonymousTextVersionHandler(AnonymousBaseHandler):
    type = "Text methods"
    title = "Read text version info"
    fields = ('key', 'title', 'format', 'content', 'created', 'modified', 'nb_comments',)   
    allowed_methods = ('GET', )   
    model = Text
    desc = """ Read text version identified by `version_key` inside text identified by `key`."""
    args = None

    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/{version_key}/'


    @has_perm_on_text_api('can_view_text')
    def read(self, request, key, version_key):
        text_version = get_textversion_by_keys_or_404(version_key, key=key)
        setattr(text_version,'nb_comments',len(get_viewable_comments(request, text_version.comment_set.all(), text_version.text)))

        return text_version

class TextVersionHandler(BaseHandler):
    type = "Text methods"    
    anonymous = AnonymousTextVersionHandler
    fields = ('key', 'title', 'format', 'content', 'created', 'modified', 'nb_comments',)   
    allowed_methods = ('GET', )   
    model = Text
    no_display = True 

    @has_perm_on_text_api('can_view_text')
    def read(self, request, key, version_key):
        text_version = get_textversion_by_keys_or_404(version_key, key=key)
        setattr(text_version,'nb_comments',len(get_viewable_comments(request, text_version.comment_set.all(), text_version.text)))

        return text_version

class AnonymousTextListHandler(AnonymousBaseHandler):
    title = "List texts"    
    type = "Text methods"    
    fields = ('key', 'title', 'created', 'modified', 'nb_comments', 'nb_versions',)   
    allowed_methods = ('GET',)   
    model = Text
    desc = """Lists texts on workspace."""        

    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/'

    def read(self, request):
        order_by = '-id'
        texts = get_texts_with_perm(request, 'can_view_text').order_by(order_by)        
        return texts

class TextListHandler(BaseHandler):
    title = "Create text"    
    type = "Text methods"    
    allowed_methods = ('GET', 'POST')    
    fields = ('key', 'title', 'created', 'modified', 'nb_comments', 'nb_versions',)   
    model = Text
    anonymous = AnonymousTextListHandler
    desc = "Create a text with the provided parameters."
    args = """<br/>
`title`: title of the text<br/>
`format`: format content ('markdown', 'html')<br/>
`content`: content (in specified format)<br/>
`anon_role`: role to give to anon users: null, 4: commentator, 5: observer<br/>
        """
     
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/'

    def read(self, request):
        order_by = '-id'
        texts = get_texts_with_perm(request, 'can_view_text').order_by(order_by)        
        return texts

    def create(self, request):
        form = CreateTextContentForm(request.POST)
        if form.is_valid():
            text = create_text(request.user, form.cleaned_data)
            anon_role = request.POST.get('anon_role', None)
            if anon_role:
                userrole = UserRole.objects.create(user=None, role=Role.objects.get(id=anon_role), text=text)         
            return {'key' : text.key , 'version_key' : text.last_text_version.key, 'created': text.created}
        else:
            resp = rc.BAD_REQUEST
        return resp
    
from cm.converters import _convert_from_mimetype
import os
from django.core.urlresolvers import reverse

class ConvertHandler(BaseHandler):    
  type = "Text methods"
  allowed_methods = ('POST', )    
  title = "Convert a legacy file"    
  desc = "Returns the HTLM file."
  args = """<br />
`file`: the file in legacy format<br />        
    """ 

  @staticmethod
  def endpoint():
    return URL_PREFIX + '/convert/'
    
  def create(self, request):
    mime = request.POST.get('mime', None)
    the_file = request.FILES['file'];
    html, attachs = _convert_from_mimetype(the_file.read(), mime, 'html')
    for attach_file in attachs:
      attach_data = file(attach_file, 'rb').read()
      filename = os.path.basename(attach_file)
      attachment = Attachment.objects.create_attachment(filename=filename, data=attach_data, text_version=None)
      attach_url = reverse('notext-attach', args=[attachment.key])
      html = html.replace(filename, settings.SITE_URL + attach_url)
    return {'html' : html}

from cm.exception import UnauthorizedException
from cm.views.texts import text_delete

class TextDeleteHandler(BaseHandler):
    type = "Text methods"
    allowed_methods = ('POST', )    
    title = "Delete text"    
    desc = "Delete the text identified by `key`."

    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/delete/'

    def create(self, request, key):
        """
        Delete text identified by `key`.
        """
        try:
            text_delete(request, key=key)
        except UnauthorizedException:
            return rc.FORBIDDEN
        except KeyError:
            return rc.BAD_REQUEST
        return rc.DELETED

from cm.views.texts import text_pre_edit
 
class TextPreEditHandler(BaseHandler):
    type = "Text methods"
    allowed_methods = ('POST', )    
    title = "Ask for edit impact"    
    desc = "Returns the number of impacted comments."
    args = """<br />
`new_format`: new format content ('markdown', 'html')<br />        
`new_content`: new content (in specified format)<br />    
    """ 

    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/pre_edit/'
    
    def create(self, request, key):
        return text_pre_edit(request, key=key)

from cm.views.texts import text_edit

class TextEditHandler(BaseHandler):
    allowed_methods = ('POST', )    
    type = "Text methods"
    title = "Edit text"    
    desc = "Update text identified by `key`."
    args = """<br />
`title`: new title of the text<br />
`format`: new format content ('markdown', 'html')<br />
`content`: new content (in specified format)<br />
`note`: note to add to edit<br />
`new_version`: boolean: should a new version of the text be created?<br />
`keep_comments`: boolean: should existing comments be kept (if possible)?<br />
`cancel_modified_scopes`: if set to 1, existing comments without scope in a new version are detached, otherwise they are deleted<br />
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/edit/'
    
    
    def create(self, request, key):
        prev_text = get_text_by_keys_or_404(key)
        prev_text_version = prev_text.last_text_version
        prev_comments = prev_text_version.get_comments()
        prev_scope_removed = [c for c in prev_comments if c.is_scope_removed()]
        res = text_edit(request, key=key)
        text = get_text_by_keys_or_404(key)
        text_version = text.last_text_version
        comments = text_version.get_comments()
        scope_removed = [c for c in comments if c.is_scope_removed()]
        return {'version_key' : text_version.key , 'created': text_version.created, 'nb_deleted' : len(prev_comments) - len(comments), 'nb_scope_removed' : len(scope_removed) - len(prev_scope_removed)}


class AnonymousTextFeedHandler(AnonymousBaseHandler):
    allowed_methods = ('GET',)    
    type = "Text methods"
    title = "Text feed"
    desc = "Returns text RSS feed."
    args = None
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/feed/?'
    
    def read(self, request, key):
        return text_feed(request, key=key)

class TextFeedHandler(BaseHandler):    
    type = "Text methods"
    anonymous = AnonymousTextFeedHandler
    allowed_methods = ('GET',)  
    no_display = True

    def read(self, request, key):
        return text_feed(request, key=key)
    
class TextVersionRevertHandler(BaseHandler):
    allowed_methods = ('POST', )    
    type = "Text methods"
    title = "Revert to specific text version"    
    desc = "Revert to a text version (i.e. copy this text_version which becomes the last text_version)."
    args = """<br />
`key`: text's key<br />
`version_key`: key of the version to revert to<br />
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/{version_key}/revert/'
    
    
    def create(self, request, key, version_key):
        text_version = get_textversion_by_keys_or_404(version_key, key=key)
        new_text_version = text_version.text.revert_to_version(version_key)
        return {'version_key' : new_text_version.key , 'created': new_text_version.created}

class TextVersionDeleteHandler(BaseHandler):
    allowed_methods = ('POST', )    
    type = "Text methods"
    title = "Delete a specific text version"    
    desc = "Delete a text version."
    args = """<br />
`key`: text's key<br />
`version_key`: key of the version to delete<br />
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/{version_key}/delete/'
    
    
    def create(self, request, key, version_key):
        text_version = get_textversion_by_keys_or_404(version_key, key=key)
        text_version.delete()
        return rc.ALL_OK    

## client methods

class AnonymousClientHandler(AnonymousBaseHandler):
    allowed_methods = ('POST',)    
    type = "Client methods"
    title = "Handles client methods"
    desc = "Handles client (ajax text view) methods."
    args = """<br />
post arguments
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/client/'
    
    def create(self, request):
        return client_exchange(request)

class ClientHandler(BaseHandler):    
    type = "Client methods"
    anonymous = AnonymousClientHandler
    allowed_methods = ('POST',)  
    no_display = True 

    def create(self, request):
        return client_exchange(request)

## embed methods
from django.views.i18n import javascript_catalog
from cm.urls import js_info_dict

class JSI18NHandler(AnonymousBaseHandler):
    allowed_methods = ('GET',)    
    type = "Embed methods"
    title = "Get js i18n dicts"
    desc = ""
    args = None
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/jsi18n/'
    
    def read(self, request):
        return javascript_catalog(request, **js_info_dict)


class AnonymousCommentFrameHandler(AnonymousBaseHandler):
    allowed_methods = ('GET',)    
    type = "Embed methods"
    title = "Displays embedable frame"
    desc = ""
    args = None
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/comments_frame/?prefix=/api'

    @has_perm_on_text_api('can_view_text')    
    def read(self, request, key):
        return text_view_frame(request, key=key)

class CommentFrameHandler(BaseHandler):    
    type = "Embed methods"
    anonymous = AnonymousCommentFrameHandler
    allowed_methods = ('GET',)  
    no_display = True 

    @has_perm_on_text_api('can_view_text')
    def read(self, request, key):
        return text_view_frame(request, key=key)

class AnonymousCommentHandler(AnonymousBaseHandler):
    allowed_methods = ('GET',)    
    type = "Embed methods"
    title = "Displays embedable frame"
    no_display = True 
    desc = ""
    args = None
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/comments/{version_key}/?'
    
    @has_perm_on_text_api('can_view_text')    
    def read(self, request, key, version_key):
        return text_view_comments(request, key=key, version_key=version_key)

class CommentHandler(BaseHandler):    
    type = "Embed methods"
    anonymous = AnonymousCommentHandler
    allowed_methods = ('GET',)  
    no_display = True 

    @has_perm_on_text_api('can_view_text')
    def read(self, request, key, version_key):
        return text_view_comments(request, key=key, version_key=version_key)


class AnonymousTextExportHandler(AnonymousBaseHandler):
    allowed_methods = ('POST',)    
    type = "Embed methods"
    title = "undocumented"
    no_display = True 
    desc = ""
    args = None
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + ' undocumented'
    
    @has_perm_on_text_api('can_view_text')    
    def create(self, request, key, format, download, whichcomments, withcolor):
        return text_export(request, key, format, download, whichcomments, withcolor, adminkey=None)

class TextExportHandler(BaseHandler):    
    type = "Embed methods"
    anonymous = AnonymousTextExportHandler
    allowed_methods = ('POST',)  
    no_display = True 

    @has_perm_on_text_api('can_view_text')
    def create(self, request, key, format, download, whichcomments, withcolor):
        return text_export(request, key, format, download, whichcomments, withcolor, adminkey=None)

class ImportHandler(BaseHandler):
    allowed_methods = ('POST', )    
    type = "Text methods"
    title = "Import text and comments"
    desc = "Import a previously exported text, along with comments and attachments in XML format."
    args = """<br />
`xml`: Previously exported XML file of text, comments and attachments<br />
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/import/'
    
    
    def create(self, request):
      text, res = _text_create_import(request, CreateTextImportForm)
      text_version = text.last_text_version
      return {'key' : text.key , 'version_key' : text.last_text_version.key, 'html': text_version.content}

class AnonymousCommentsHandler(AnonymousBaseHandler):
    allowed_methods = ('GET',)    
    type = "Comment methods"
    fields = ('id_key', 'title', 'format', 'content', 'created', 'name', ('text_version' , ('key', ('text', ('key',))) ))   
    model = Comment    
    title = "Get comments"
    desc = "Get comments from the workspace, most recent first."
    args = """<br />
`keys`: (optional) comma separated keys : limit comments from these texts only<br />
`comment_key`: (optional) get only this comment
`name`: (optional) limit comments from this user only
`limit`: (optional) limit number of comments returned
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/comments/'
    
    def read(self, request):
        name = request.GET.get('name', None)
        limit = request.GET.get('limit', None)
        keys = request.GET.get('keys', None)
        query = Comment.objects.all()
        if keys:            
            query = query.filter(text_version__text__key__in=keys.split(','))
        if name:
            query = query.filter(name=name)
        query = query.order_by('-created')
        if limit:
            query = query[:int(limit)]
        return query

class CommentsHandler(BaseHandler):    
    type = "Comment methods"
    anonymous = AnonymousCommentsHandler
    allowed_methods = ('GET',)  
    fields = ('id_key', 'title', 'format', 'content', 'created', 'name', ('text_version' , ('key', ('text', ('key',))) ))   
    model = Comment
    no_display = True 

    def read(self, request):
        name = request.GET.get('name', None)
        limit = request.GET.get('limit', None)
        comment_key = request.GET.get('comment_key', None)
        keys = request.GET.get('keys', None)
        query = Comment.objects.all()
        if keys:            
            query = query.filter(text_version__text__key__in=keys.split(','))
        if name:
            query = query.filter(name=name)
        if comment_key:
            query = query.filter(id_key=comment_key)
        query = query.filter(text_version__text__last_text_version__exact=F('text_version__id'))
        query = query.order_by('-created')
        if limit:
            query = query[:int(limit)]
        return query

from piston.doc import documentation_view

from piston.handler import handler_tracker
from django.template import RequestContext
from piston.doc import generate_doc
from django.shortcuts import render_to_response

def documentation(request):
    """
    Generic documentation view. Generates documentation
    from the handlers you've defined.
    """
    docs = [ ]

    for handler in handler_tracker:
        doc = generate_doc(handler)
        setattr(doc,'type', handler.type)
        docs.append(doc)

    def _compare(doc1, doc2): 
       #handlers and their anonymous counterparts are put next to each other.
       name1 = doc1.name.replace("Anonymous", "")
       name2 = doc2.name.replace("Anonymous", "")
       return cmp(name1, name2)    
 
    #docs.sort(_compare)
       
    return render_to_response('api_doc.html', 
        { 'docs': docs }, RequestContext(request))

from piston.doc import generate_doc
DocHandler = generate_doc(TextPreEditHandler)
