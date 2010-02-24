from cm.exception import UnauthorizedException
from cm.message import display_message
from cm.models import ApplicationConfiguration, Notification, Configuration, UserRole
from cm.models_base import generate_key
from cm.views import get_text_by_keys_or_404
from cm.utils.embed import embed_html
from cm.security import get_request_user
from django import forms
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils import feedgenerator
from django.utils.translation import ugettext as _

import re
import time

#@login_required
def followup(request):
    user = get_request_user(request)
    workspace_notify_check = Notification.objects.filter(text=None,type='workspace',user=user, active=True).count()
    own_notify_check = Notification.objects.filter(text=None,type='own',user=user, active=True).count()
    
    if request.method == 'POST':
        if 'activate' in request.POST:
            Configuration.objects.set_key('private_feed_key', generate_key())
            display_message(request, _(u"Private feed activated."))            
        if 'reset' in request.POST:
            Configuration.objects.set_key('private_feed_key', generate_key())
            display_message(request, _(u"Private feed reseted."))            
        if request.POST.get('notif_id',None):
            notif_id = request.POST.get('notif_id')
            notif_type = 'own' if notif_id == 'own_notify_check' else 'workspace' 
            notif_val = request.POST.get(notif_id,None)
            if notif_val != None :
                Notification.objects.set_notification(text=None, type=notif_type, active=(notif_val == 'true'), email_or_user=user)
    
    return render_to_response('site/followup.html', {'workspace_notify_check':workspace_notify_check,
                                                          'own_notify_check' :own_notify_check, 
                                                          }, context_instance=RequestContext(request))
    

# force a POST (database modifications)
def desactivate_notification(request, adminkey):
    try:
        notification = Notification.objects.get(adminkey=adminkey)
    except Notification.DoesNotExist:        
        display_message(request, _(u"This notification has already been deactivated."))
        return HttpResponseRedirect(reverse('index'))
    
    if request.method == 'POST':
        if request.POST['adminkey'] == adminkey:
            notification.desactivate()
            display_message(request, _(u"Notification deactivated."))                
            return HttpResponseRedirect(reverse('index'))
    return render_to_response('site/notifications_desactivate.html', 
                              {'notification' : notification,
                               'title' : _(u'Deactivate notification?'),                               
                               },
                               context_instance=RequestContext(request))


def text_followup(request, key):
    text = get_text_by_keys_or_404(key)
    user = request.user if request.user.is_authenticated() else None

    from cm.security import user_has_perm # import here!
    anonymous_can_view_text = user_has_perm(None, 'can_view_text', text=text)
    text_notify_check = Notification.objects.filter(text=text,type='text',user=user, active=True).count()
    workspace_notify_check = Notification.objects.filter(text=None,type='workspace',user=user, active=True).count()
    
    if request.method == 'POST':
        if 'activate' in request.POST:
            text.private_feed_key = generate_key()
            text.save()
            display_message(request, _(u"Private feed activated."))            
        if 'reset' in request.POST:
            text.private_feed_key = generate_key()
            text.save()
            display_message(request, _(u"Private notifications feed reseted."))
            
        if request.POST.get('notif_id',None):
            notif_id = request.POST.get('notif_id')
            notif_val = request.POST.get(notif_id,None)
            if notif_val != None :
                Notification.objects.set_notification(text=text, type='text', active=(notif_val == 'true'), email_or_user=request.user)

    template_dict = {
                     'text' : text,
                     'workspace_notify_check' : workspace_notify_check,
                     'text_notify_check' : text_notify_check,
                     'anonymous_can_view_text' : anonymous_can_view_text,
                     }
    return render_to_response('site/text_followup.html', template_dict , context_instance=RequestContext(request))

def text_embed(request, key):
    text = get_text_by_keys_or_404(key)
    embed_code = embed_html(text.key) ;   
    template_dict = {
                     'text' : text,
                     'embed_code': embed_code
                     }
    return render_to_response('site/text_embed.html', template_dict , context_instance=RequestContext(request))
    
    