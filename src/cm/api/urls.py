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
text_feed_handler = Resource(handler=TextFeedHandler, authentication=auth)

tv_revert_handler = Resource(handler=TextVersionRevertHandler, authentication=auth)
tv_delete_handler = Resource(handler=TextVersionDeleteHandler, authentication=auth)

text_export_handler = Resource(handler=TextExportHandler, authentication=auth)
import_handler = Resource(handler=ImportHandler, authentication=auth)

comments_handler = Resource(handler=CommentsHandler, authentication=auth)

convert_handler = Resource(handler=ConvertHandler, authentication=auth)

client_handler = Resource(handler=ClientHandler, authentication=auth)

jsi8n_handler = Resource(handler=JSI18NHandler, authentication=None)

comment_frame_handler = Resource(handler=CommentFrameHandler, authentication=auth)
comment_handler = Resource(handler=CommentHandler, authentication=auth)

#doc_handler = Resource(handler=DocHandler)

urlpatterns = patterns('',
   url(r'^text/(?P<key>\w*)/$', text_handler),
   url(r'^text/$', text_list_handler),

   url(r'^text/(?P<key>\w*)/(?P<version_key>\w*)/revert/$', tv_revert_handler),
   url(r'^text/(?P<key>\w*)/(?P<version_key>\w*)/delete/$', tv_delete_handler),
   
   url(r'^text/(?P<key>\w*)/comments_frame/$', comment_frame_handler),
   url(r'^text/(?P<key>\w*)/comments/(?P<version_key>\w*)/$', comment_handler),
   
   url(r'^text/(?P<key>\w*)/export/(?P<format>\w*)/(?P<download>\w*)/(?P<whichcomments>\w*)/(?P<withcolor>\w*)/$', text_export_handler),
   url(r'^import/$', import_handler),

   url(r'^text/(?P<key>\w*)/feed/$', text_feed_handler),
   url(r'^text/(?P<key>\w*)/delete/$', text_delete_handler),
   url(r'^text/(?P<key>\w*)/pre_edit/$', text_pre_edit_handler),
   url(r'^text/(?P<key>\w*)/edit/$', text_edit_handler),
   url(r'^text/(?P<key>\w*)/(?P<version_key>\w*)/$', textversion_handler),
   url(r'^comments/$', comments_handler),
   url(r'^convert/$', convert_handler),
   url(r'^client/$', client_handler),
   url(r'^jsi18n/$', jsi8n_handler),
   url(r'^doc/$', documentation),
)
