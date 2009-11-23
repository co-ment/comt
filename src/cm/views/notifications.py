from cm.exception import UnauthorizedException
from cm.message import display_message
from cm.models import ApplicationConfiguration, Notification, Configuration, UserRole
from cm.models_base import generate_key
from cm.views import get_text_by_keys_or_404
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

@login_required
def notifications(request):
    notify_check = Notification.objects.filter(text=None,type=None,user=request.user, active=True).count()
    own_check = Notification.objects.filter(text=None,type='own',user=request.user, active=True).count()
    if request.method == 'POST':
        if 'activate' in request.POST:
            Configuration.objects.set_key('private_feed_key', generate_key())
            display_message(request, _(u"Private feed activated."))            
        if 'reset' in request.POST:
            Configuration.objects.set_key('private_feed_key', generate_key())
            display_message(request, _(u"Private feed reseted."))            
        if request.POST.get('notify_check',None) == u'true':
            if not notify_check:            
                notification = Notification.objects.create_notification(text=None, type=None, email_or_user=request.user)
                # ajax display_message(request, _(u"Notifications activated."))
        elif request.POST.get('notify_check',None) == u'false':
            Notification.objects.filter(text=None,type=None,user=request.user).delete()
            notify_check = False
                
        if request.POST.get('own_check',None) == u'true':
            Notification.objects.set_notification_to_own_discussions(text=None,email_or_user=request.user, active=True)
        elif request.POST.get('own_check',None) == u'false':
            Notification.objects.set_notification_to_own_discussions(text=None,email_or_user=request.user, active=False)
            own_check = False
    
    return render_to_response('site/notifications.html', {'notify_check':notify_check,
                                                          'own_check' :own_check, 
                                                          }, context_instance=RequestContext(request))
    

# force a POST (database modifications)
def desactivate_notification(request, adminkey):
    try:
        notification = Notification.objects.get(adminkey=adminkey)
    except Notification.DoesNotExist:        
        display_message(request, _(u"This notification has already been desactivated."))
        return HttpResponseRedirect(reverse('index'))
    
    if request.method == 'POST':
        if request.POST['adminkey'] == adminkey:
            notification.desactivate()
            display_message(request, _(u"Notification desactivated."))                
            return HttpResponseRedirect(reverse('index'))
    return render_to_response('site/notifications_desactivate.html', 
                              {'notification' : notification,
                               'title' : _(u'Desactivate notification?'),                               
                               },
                               context_instance=RequestContext(request))


def text_notifications(request, key):
    text = get_text_by_keys_or_404(key)
    user = request.user if request.user.is_authenticated() else None

    from cm.security import user_has_perm # import here!
    anonymous_can_view_text = user_has_perm(None, 'can_view_text', text=text)
    own_check = Notification.objects.filter(text=text,type='own',user=user).count()
    all_check = Notification.objects.filter(text=text,type=None,user=user).count()
    
    
    embed_code = '<iframe frameborder="0" src="%s%s" style="height: 166px; width: 99.9%%; position: relative; top: 0px;">'%(settings.SITE_URL, reverse('text-view-comments-frame', args=[text.key]))   
    
    if request.method == 'POST':
        if 'activate' in request.POST:
            text.private_feed_key = generate_key()
            text.save()
            display_message(request, _(u"Private feed activated."))            
        if 'reset' in request.POST:
            text.private_feed_key = generate_key()
            text.save()
            display_message(request, _(u"Private notifications feed reseted."))
            
        if request.POST.get('all_check',None) == u'true':            
            if not all_check:          
                notification = Notification.objects.create_notification(text=text, type=None, email_or_user=user)

        if request.POST.get('all_check',None) == u'false':            
            notification = Notification.objects.filter(text=text, type=None, user=user).delete()

    template_dict = {
                     'text' : text,
                     'all_check' : all_check,
                     'anonymous_can_view_text' : anonymous_can_view_text,
                     'embed_code': embed_code
                     }
    return render_to_response('site/text_notifications.html', template_dict , context_instance=RequestContext(request))
