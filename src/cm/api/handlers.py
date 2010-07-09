from piston.handler import AnonymousBaseHandler, BaseHandler
from piston.utils import rc

from cm.models import Text,TextVersion, Role, UserRole
from cm.views import get_keys_from_dict, get_textversion_by_keys_or_404, get_text_by_keys_or_404, get_textversion_by_keys_or_404, redirect
from cm.security import get_texts_with_perm, has_perm, get_viewable_comments, \
    has_perm_on_text_api
from cm.security import get_viewable_comments
from cm.utils.embed import embed_html
from cm.views.create import CreateTextContentForm, create_text
from piston.utils import validate
from settings import SITE_URL

URL_PREFIX = SITE_URL + '/api'
 
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
    allowed_methods = ('GET',)  
    no_display = True 

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
    allowed_methods = ('POST', )    
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

    def create(self, request):
        """
        Delete text identified by `key`.
        """
        try:
            key = request.POST.get('key')
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
`keep_comments`: boolean: should existing comments be keep (if possible)?<br />
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/text/{key}/edit/'
    
    
    def create(self, request, key):
        res = text_edit(request, key=key)
        text = get_text_by_keys_or_404(key)
        text_version = text.last_text_version
        return {'version_key' : text_version.key , 'created': text_version.created}

from django.contrib.auth import authenticate
    
class SetUserHandler(AnonymousBaseHandler):
    allowed_methods = ('POST',)    
    type = "User methods"
    title = "Set username and email"    
    desc = "Set username and email to use when commenting."
    args = """<br />
`user_name`: user's name<br />
`user_email`: user's email<br />
    """ 
    
    @staticmethod
    def endpoint():
        return URL_PREFIX + '/setuser/'
    
    def create(self, request):
        user_name = request.POST.get('user_name', None)
        user_email = request.POST.get('user_email', None)
        if user_name and user_email: 
            response = rc.ALL_OK
            response.set_cookie('user_name', user_name)
            response.set_cookie('user_email', user_email)
            return response
        else:
            return rc.BAD_REQUEST    
                         


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
