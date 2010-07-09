from django.conf.urls.defaults import *

from piston.resource import Resource
from piston.authentication import HttpBasicAuthentication

from cm.api.handlers import * 
auth = HttpBasicAuthentication(realm='Comt API')

text_handler = Resource(handler=TextHandler, authentication=auth)
textversion_handler = Resource(handler=TextVersionHandler, authentication=auth)
text_list_handler = Resource(handler=TextListHandler, authentication=auth)
text_delete_handler = Resource(handler=TextDeleteHandler, authentication=auth)
text_pre_edit_handler = Resource(handler=TextPreEditHandler, authentication=auth)
text_edit_handler = Resource(handler=TextEditHandler, authentication=auth)
setuser_handler = Resource(handler=SetUserHandler, authentication=None)

#doc_handler = Resource(handler=DocHandler)

urlpatterns = patterns('',
   url(r'^text/(?P<key>\w*)/$', text_handler),
   url(r'^text/$', text_list_handler),
   url(r'^text/(?P<key>\w*)/delete/$', text_delete_handler),
   url(r'^text/(?P<key>\w*)/pre_edit/$', text_pre_edit_handler),
   url(r'^text/(?P<key>\w*)/edit/$', text_edit_handler),
   url(r'^text/(?P<key>\w*)/(?P<version_key>\w*)/$', textversion_handler),
   url(r'^setuser/$', setuser_handler),
   url(r'^doc/$', documentation),
)
