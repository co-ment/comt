from django.views.generic import list_detail
from django.views.generic import create_update
from django.contrib.auth.models import User
from django.conf.urls.defaults import *
from django.conf import settings
from cm.views import *
from cm.views.create import *
from cm.views.export import *
from cm.views.texts import *
from cm.views.user import *
from cm.views.timezone import *
from cm.views.site import *
from cm.views.feeds import *
from cm.views.followup import *
from cm.views import i18n

 
urlpatterns = patterns('',
)

urlpatterns += patterns('',
     url(r'^$', dashboard, name="index"),
     url(r'^text/$', text_list, name="text"),
     url(r'^settings/$', settingss, name="settings"),
     url(r'^settings/design/$', settings_design, name="settings-design"),

     # system pages
     url(r'^i18n/setlang/(?P<lang_code>\w+)/$', i18n.set_language, name="setlang"),
     url(r'^unauthorized/$', unauthorized, name="unauthorized"),
     url(r'^timezone_set/$', timezone_set, name="timezone_set"),     
     
     # user login/logout/profile pages
     url(r'^login/$', login, name="login"),
     url(r'^register/$', register, name="register"),
     url(r'^logout/$', logout, name="logout"),
     url(r'^profile/$', profile, name="profile"),    
     url(r'^profile-pw/$', profile_pw, name="profile-pw"),    
     
     # users
     url(r'^user/$', user_list, name="user"),
     url(r'^user/(?P<key>\w*)/activate/$', user_activate, name="user-activate"),
     url(r'^user/(?P<key>\w*)/suspend/$', user_suspend, name="user-suspend"),
     url(r'^user/(?P<key>\w*)/enable/$', user_enable, name="user-enable"),
     url(r'^user/(?P<key>\w*)/edit/$', user_edit, name="user-edit"),
     url(r'^user/-/edit/$', user_anon_edit, name="user-anon-edit"),     
     url(r'^user/(?P<key>\w*)/contact/$', user_contact, name="user-contact"),
     url(r'^user/(?P<key>\w*)/send_invitation/$', user_send_invitation, name="user-send-invitation"),
     url(r'^user/add/$', user_add, name="user-add"),
     url(r'^user/mass-add/$', user_mass_add, name="user-mass-add"),
     
     # new texts
     url(r'^text/(?P<key>\w*)/share/$', text_share, name="text-share"),

     # text create
     url(r'^create/content/$', text_create_content, name="text-create-content"),
     url(r'^create/upload/$', text_create_upload, name="text-create-upload"),
     url(r'^create/import/$', text_create_import, name="text-create-import"),

     # text
     url(r'^text/(?P<key>\w*)/view/$', text_view, name="text-view"),
     url(r'^text/(?P<key>\w*)/view/\?comment_id_key=(?P<id>\w*)$', text_view, name="text-view-show-comment"), 
     
     url(r'^text/(?P<key>\w*)/edit/$', text_edit, name="text-edit"),
     url(r'^text/(?P<key>\w*)/pre_edit/$', text_pre_edit, name="text-preedit"),
     url(r'^text/(?P<key>\w*)/settings/$', text_settings, name="text-settings"),
     url(r'^text/(?P<key>\w*)/history/$', text_history, name="text-history"),
     url(r'^text/(?P<key>\w*)/history-version/(?P<version_key>\w*)/$', text_history_version, name="text-history-version"),
     url(r'^text/(?P<key>\w*)/history-compare/(?P<v1_version_key>\w*)/(?P<v2_version_key>\w*)/$', text_history_compare, name="text-history-compare"),
     url(r'^text/(?P<key>\w*)/history-compare/(?P<v1_version_key>\w*)/(?P<v2_version_key>\w*)/(?P<mode>\d*)$', text_history_compare, name="text-history-compare2"),
     url(r'^text/(?P<key>\w*)/revert/(?P<text_version_key>\w*)/$', text_revert, name="text-revert"),
     url(r'^text/(?P<key>\w*)/attach/(?P<attach_key>\w*)/$', text_attach, name="text-attach"),
     url(r'^text/(?P<key>\w*)/delete/$', text_delete, name="text-delete"),
     url(r'^text/(?P<key>\w*)/(?P<text_version_key>\w*)/delete/$', text_version_delete, name="text-version-delete"),        
     url(r'^text/(?P<key>\w*)/export/(?P<format>\w*)/(?P<download>\w*)/(?P<whichcomments>\w*)/(?P<withcolor>\w*)/$', text_export, name="text-export"),
     url(r'^text/(?P<key>\w*)/history/$', text_history, name="text-history"),

     # detached attachements! (used for saving images when just converting to HTML, without creating a text)
     url(r'^attach/(?P<attach_key>\w*)/$', notext_attach, name="notext-attach"),
     
     # main client frame
     url(r'^text/(?P<key>\w*)/comments_frame/$', text_view_frame, name="text-view-comments-frame"),
     url(r'^text/(?P<key>\w*)/comments_frame/(?P<version_key>\w*)/$', text_view_frame, name="text-view-comments-frame-version"),

     # included in text_view_frame
     url(r'^text/(?P<key>\w*)/comments/$', text_view_comments, name="text-view-comments"),
     url(r'^text/(?P<key>\w*)/comments/(?P<version_key>\w*)/$', text_view_comments, name="text-view-comments-version"),

     url(r'^text/(?P<key>\w*)/user/add/$', user_add, name="user-add-text"),
     url(r'^text/(?P<key>\w*)/user/mass-add/$', user_mass_add, name="user-mass-add-text"),
     
     # site
     url(r'^contact/$', contact, name="contact"),
     url(r'^help/$', help, name="help"),
     
     # notifications
     ## workspace followup
     url(r'^followup/$', followup, name="followup"),
     url(r'^followup/(?P<adminkey>\w*)/deactivate/$', desactivate_notification, name="desactivate-notification"),
     ## text notifications
     url(r'^text/(?P<key>\w*)/followup/$', text_followup, name="text-followup"),
     ## embed
     url(r'^text/(?P<key>\w*)/embed/$', text_embed, name="text-embed"),

     # feeds
     ## workspace feeds
     url(r'^feed/(?P<key>\w*)/$', private_feed, name="private-feed"),
     url(r'^feed/$', public_feed, name="public-feed"),
     ## text feeds
     url(r'^text/(?P<key>\w*)/feed/$', text_feed, name="text-feed"),
     url(r'^text/(?P<key>\w*)/feed/(?P<private_feed_key>\w*)/$', text_feed_private, name="text-private-feed"),

     url(r'^wysiwyg-preview/(?P<format>\w*)/$', text_wysiwyg_preview, name="text-wysiwyg-preview"),
)

# this is to make django.contrib.auth.views work with our templates
from django.contrib.sites.models import Site
Site._meta.installed = False

urlpatterns += patterns('django.contrib.auth.views',    
    (r'^password_reset/$', 'password_reset', {'template_name': 'site/forgot_pw.html', 'email_template_name':'email/forgot_pw.txt', 'post_reset_redirect':'/password_reset/done/'}, 'forgot-pw'),
    (r'^password_reset/done/$', password_reset_done),
    (r'^reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', 'password_reset_confirm', {'template_name': 'site/forgot_pw.html', 'post_reset_redirect':'/reset/done/'}),
    (r'^reset/done/$', password_reset_complete),
)

# static pages
urlpatterns += patterns('django.views.generic.simple',
    url(r'^help/format/$', 'direct_to_template', {'template': 'static/help_format.html'}, name='help-format'),
)


if settings.DEBUG: # client experiments
    urlpatterns += patterns('django.views.generic.simple',
        url(r'anim_io_sync/$','direct_to_template', {'template': 'static/experiment/anim_io_sync.html'}, name='experiment-anim_io_sync'),
        url(r'test0/$','direct_to_template', {'template': 'static/experiment/test0.html'}, name='test0'),
    )

urlpatterns += patterns('',
    url(r'^client/$', client_exchange, name="text-client-exchange"),
)

if settings.DEBUG:
     urlpatterns += patterns('',
     (r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),

     (r'^cmmedia/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'src/cm/media/'}),
     (r'^robots.txt$', 'django.views.static.serve', {'document_root': 'src/cm/media/', 'path':'robots.txt'}),
     (r'^favicon.ico$', 'django.views.static.serve', {'document_root': 'src/cm/media/', 'path':'favicon.ico'}),
     
)
     
js_info_dict = {
    'packages': ('cm', ),
}

urlpatterns += patterns('',
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),
)

urlpatterns += patterns('',
   (r'^api/', include('cm.api.urls')),
)
