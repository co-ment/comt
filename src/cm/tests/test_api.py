from django.test import TestCase
from django.test.client import Client
from django.core import management
from datetime import datetime
from cm.activity import *
from cm.models import *
from cm.security import *

from django.http import HttpRequest, HttpResponse
from django.utils import simplejson

from cm.api.handlers import *

#from piston.test import TestCase
from piston.models import Consumer
from piston.handler import BaseHandler
from piston.utils import rc
from piston.resource import Resource

class FalseRequest(object):
    def __init__(self, user):
        self.user = user

class APITest(TestCase):
    fixtures = ['initial_data','roles_generic', 'test_content', ]
    
    def test_text_get(self):
        """
        Anonymous api call
        """
        
        resource = Resource(AnonymousTextHandler)
        request = HttpRequest()
        setattr(request, 'user' , None)
        request.method = 'GET'
        
        # get public text
        response = resource(request, key='text_key_4', emitter_format='json')
        self.assertEquals(200, response.status_code) # 401: forbidden
        response_data = simplejson.loads(response.content)
        self.assertEquals(response_data.get('created'), '2009-02-13 04:01:12')
        
        # error: private text
        response = resource(request, key='text_key_3', emitter_format='json')
        self.assertEquals(401, response.status_code)


    def test_text_get_logged_in(self):
        """
        Logged in as manager api call
        """

        resource = Resource(AnonymousTextHandler)
        request = HttpRequest()
        user = User.objects.get(pk=1)
        setattr(request, 'user' , user)
        request.method = 'GET'
  
        response = resource(request, key='text_key_3', emitter_format='json')
        self.assertEquals(200, response.status_code)


    def test_text_create(self):
        request = FalseRequest(None) 
        nb_anon_texts = get_texts_with_perm(request, 'can_view_text').count()
        nb_texts = Text.objects.count()
        
        resource = Resource(TextListHandler)
        
        # create one private text 
        request = HttpRequest()
        user = User.objects.get(pk=1)
        setattr(request, 'user' , user)
        request.method = 'POST'
        setattr(request, 'POST' , {'content':'test content', 'format':"markdown", 'title': 'my title'})
        response = resource(request,)

        self.assertEquals(200, response.status_code)
        self.assertTrue('key' in simplejson.loads(response.content).keys())

        request = FalseRequest(None) 
        self.assertEqual(get_texts_with_perm(request, 'can_view_text').count(), nb_anon_texts) # NO more anon text
        
        # create one text with anon observer
        request = HttpRequest()
        user = User.objects.get(pk=1)
        setattr(request, 'user' , user)
        request.method = 'POST'
        setattr(request, 'POST' , {'content':'test content', 'format':"markdown", 'title': 'my title', 'anon_role' : 4})
        response = resource(request,)

        self.assertEquals(200, response.status_code)
        self.assertTrue('key' in simplejson.loads(response.content).keys())
        
        self.assertEquals(nb_texts + 2, Text.objects.count()) # 2 more texts should have been created

        request = FalseRequest(None) 
        self.assertEqual(get_texts_with_perm(request, 'can_view_text').count(), nb_anon_texts + 1) # one more anon accessible text available
        
    def test_list_text_get(self):
        """
        List texts anon
        """
        resource = Resource(AnonymousTextListHandler)
        request = HttpRequest()
        setattr(request, 'user' , None)
        request.method = 'GET'
  
        response = resource(request, emitter_format='json')
        self.assertEquals(200, response.status_code)
        self.assertEquals(2, len(simplejson.loads(response.content)))

    def test_list_text_logged_in(self):
        """
        List texts manager
        """
        resource = Resource(AnonymousTextListHandler)
        request = HttpRequest()
        user = User.objects.get(pk=1)
        setattr(request, 'user' , user)
        request.method = 'GET'
  
        response = resource(request, emitter_format='json')
        self.assertEquals(200, response.status_code)
        self.assertEquals(5, len(simplejson.loads(response.content)))

    def test_delete_text_logged_in_works(self):
        """
        Delete text
        """
        nb_texts = Text.objects.count()
        
        resource = Resource(TextDeleteHandler)
        request = HttpRequest()
        user = User.objects.get(pk=1)
        setattr(request, 'user' , user)
        request.method = 'POST'
        setattr(request, 'POST' , {})
        setattr(request, 'flash' , {})
  
        response = resource(request, key='text_key_3', emitter_format='json')
        self.assertEquals(204, response.status_code)

        # one text deleted
        self.assertEquals(nb_texts - 1, Text.objects.count())
        
    def test_delete_text_logged_in_fail(self):
        """
        Delete text (and fail: insufficient rights)
        """
        nb_texts = Text.objects.count()

        resource = Resource(TextDeleteHandler)
        request = HttpRequest()
        user = User.objects.get(pk=3)
        setattr(request, 'user' , user)
        request.method = 'POST'
        setattr(request, 'POST' , {})
        setattr(request, 'flash' , {})
  
        response = resource(request, key='text_key_3', emitter_format='json')
        self.assertEquals(401, response.status_code)
        
        # no text deleted
        self.assertEquals(nb_texts, Text.objects.count())


    def test_pre_edit(self):
        """
        Pre edit text: should return number of comments to remove
        """
        resource = Resource(TextPreEditHandler)
        request = HttpRequest()
        user = User.objects.get(pk=1) 
        setattr(request, 'user' , user)
        request.method = 'POST'
        setattr(request, 'POST' , {'new_format' : 'markdown', 'new_content' : u'ggg'})
        setattr(request, 'flash' , {})
    
        response = resource(request, key='text_key_2', emitter_format='json')
        self.assertEquals(response.content, '{"nb_removed": 3}')

    def test_edit(self):
        """
        Edit text
        """
        resource = Resource(TextEditHandler)
        request = HttpRequest()
        session = {}
        setattr(request,'session',{})
        
        user = User.objects.get(pk=1) 
        setattr(request, 'user' , user)
        request.method = 'POST'
        setattr(request, 'POST' , {'format' : 'markdown', 'content' : u'ggg', 'keep_comments' : True, 'new_version' : True, 'title' : 'new title'})
        #setattr(request, 'flash' , {})
    
        response = resource(request, key='text_key_2', emitter_format='json')

        self.assertEquals(Text.objects.get(pk=2).last_text_version.content , u'ggg')

    def test_text_version(self):
        """
        Text version operation
        """
        # revert to text version
        self.assertEquals(Text.objects.get(pk=1).get_versions_number() , 2)

        resource = Resource(TextVersionRevertHandler)
        request = HttpRequest()
        request.method = 'POST'
        setattr(request, 'POST' , {})
        
        response = resource(request, key='text_key_1', version_key='textversion_key_0', emitter_format='json')

        self.assertEquals(Text.objects.get(pk=1).get_versions_number() , 3)
        
        # delete text version

        resource = Resource(TextVersionDeleteHandler)
        request = HttpRequest()
        request.method = 'POST'
        setattr(request, 'POST' , {})
        response = resource(request, key='text_key_1', version_key='textversion_key_0', emitter_format='json')
        
        
        self.assertEquals(Text.objects.get(pk=1).get_versions_number() , 2)
