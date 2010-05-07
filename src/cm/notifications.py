from cm.models import Activity, Text, Notification, Comment, ApplicationConfiguration
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.db.models import Q, signals
from django.utils.translation import ugettext as _
from django.template.loader import render_to_string
from time import mktime
from django.conf import settings
from cm.utils.mail import send_mail
import django.dispatch
import logging


class FakeRequest(object):
    def __init__(self, user):
        self.user = user

def notify(sender, **kwargs):
    from cm.security import get_viewable_comments, has_perm
    allready_notified = set() # avoid sending multiple notifications to same user
    
    activity = kwargs['instance']
    if activity.type in Activity.VIEWABLE_ACTIVITIES.get('view_users'): # user activity: only viewed by managers
        notifications = Notification.objects.filter(text=None, active=True).exclude(type='own')
        for notification in notifications:
            if notification.user:
                from cm.security import user_has_perm # import here!
                if user_has_perm(notification.user, 'can_manage_workspace'):
                    send_notification(activity, notification)
                    allready_notified.add(notification.user)
    elif activity.type in Activity.VIEWABLE_ACTIVITIES.get('view_comments'):
        notifications = Notification.objects.filter(Q(text=activity.text) | Q(text=None), active=True)
        for notification in notifications:            
            viewable = get_viewable_comments(FakeRequest(notification.user),
                                             Comment.objects.filter(id__in = [activity.comment.id]),
                                             text=activity.text)
            if viewable and \
                ((notification.type == 'own' and activity.comment.user != notification.user and activity.comment.top_comment().user == notification.user) or
                 (notification.type != 'own')):
                if not notification.user in allready_notified:
                    send_notification(activity, notification)
                    allready_notified.add(notification.user)            
    elif activity.type in Activity.VIEWABLE_ACTIVITIES.get('view_texts'):
        notifications = Notification.objects.filter(Q(text=activity.text) | Q(text=None), active=True).exclude(type='own')
        for notification in notifications:
            if notification.user:
                from cm.security import user_has_perm # import here!
                if user_has_perm(notification.user, 'can_view_text', text=activity.text) and not notification.user in allready_notified:
                    send_notification(activity, notification)
                    allready_notified.add(notification.user)
            else:
                if has_perm(None, 'can_view_text', text=activity.text) and not notification.email in allready_notified:
                    send_notification(activity, notification)
                    allready_notified.add(notification.email)                

signals.post_save.connect(notify, sender=Activity)

def send_notification(activity, notification):
    email = notification.user.email if notification.user else notification.email
    subject = _('Notification:') + " " + activity.printable_data(html=False, link=False)
    message = render_to_string('email/activity_notification.txt',
                                   { 
                                     'activity' : activity,
                                     'notification' : notification,
                                     'SITE_URL' : settings.SITE_URL,
                                     'CONF' : ApplicationConfiguration,
                                      })
    
    send_mail(subject, message, ApplicationConfiguration['email_from'], [email], fail_silently=True)
    
    #logging.debug(u"Notification sent [%s] => %s" %(activity,notification.user) if notification.user else u"sending (email) %s => %s" %(activity,notification.email))
