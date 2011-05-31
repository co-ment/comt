from cm.models import Activity, Text
from django.contrib.auth.models import User
from django.db.models import signals
from datetime import datetime, timedelta
from time import mktime
import django.dispatch
import logging
from cm.cm_settings import STORE_ACTIVITY_IP

def register_activity(request, type, text=None, comment=None, user=None, text_version=None):
    signal_activity.send(sender=text, request=request, type=type, comment=comment, user=user, text_version=text_version)
    
# activity signal

signal_activity = django.dispatch.Signal(providing_args=["request", "type", "comment"])

def _save_activity(sender, **kwargs):
    request = kwargs['request']
    type = kwargs['type']
    comment = kwargs['comment']
    user = kwargs['user']
    
    text = sender
    text_version = kwargs.get('text_version', None)
    if not text_version and text:
        text_version = text.last_text_version
        
    if request.user.is_anonymous():
        originator_user = None
    else:
        originator_user = request.user
    
    if STORE_ACTIVITY_IP:
        ip = request.META['REMOTE_ADDR']
    else:
        ip = None
    
    Activity.objects.create(text=text, user=user, text_version=text_version, comment=comment, type=type, ip=ip, originator_user=originator_user)
    
def connect_all():
    signal_activity.connect(_save_activity)

connect_all()

# activity processing

def seconds(t_delta):
    return abs(t_delta.seconds + t_delta.days * 86400)

VISIT_DURATION = timedelta(seconds=30 * 60) # 30 minutes

from cm.utils.cache import memoize, dj_memoize

@dj_memoize
def get_activity(text='all', user='all', reference_date=None, nb_slots=31, slot_timedelta=timedelta(days=1), action="all", kind=''):
    """
    text : text: specific text
           'all': all texts
    user : user: specific user
           None: anonymous users
           'all': all users
    """
    # calc activities used    
    if not reference_date:
        reference_date = datetime.now()
    from_date = reference_date - slot_timedelta * nb_slots
    activities = Activity.objects.filter(created__gt=from_date)
    if action != 'all':
        activities = activities.filter(type=action)
    if text != 'all':
        activities = activities.filter(text=text)
    if user != 'all':
        activities = activities.filter(originator_user=user)
    activities = activities.order_by('created').only('created', 'originator_user', 'text')
    #print 'got %d activities' % len(activities), [a.created for a in activities]
    
    if kind == 'raw':
        visits = activities
    else:
        # calc visits
        visits = []
        if activities:
            for i in range(len(activities)):
                activity = activities[i]
                found = False
                for j in range(i - 1, -1, -1):
                    prev_act = activities[j]                
                    if activity.created > prev_act.created + VISIT_DURATION: # out of session bounds: add act
                        visits.append(activity)
                        found = True
                        break
                    else:
                        if not activity.is_same_user(prev_act): # another user: just ignore prev_act
                            continue
                        else: # in session: do not count act
                            found = True
                            break
                if not found:                    
                    visits.append(activity)
        #print 'got %d visits' % len(visits), [(v.created, v.user) for v in visits]
    
    # hist by slot_timedelta
    slots = [seconds(from_date - v.created) // seconds(slot_timedelta) for v in visits]
    
    # TODO: could be more efficient...
    res = [slots.count(index) for index in range(nb_slots)]
    return res
        
        
