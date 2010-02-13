from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render_to_response
from django.template.loader import render_to_string
from django.utils import feedgenerator
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.contrib.auth.models import AnonymousUser  
from cm.security import get_viewable_activities
from cm.models import ApplicationConfiguration, Activity, Configuration
import time
from cm.exception import UnauthorizedException
import re
from urlparse import urlparse
# taken from django's feedgenerator.py and changed to support multiple posts in minute
def get_tag_uri(url, date):
    "Creates a TagURI. See http://diveintomark.org/archives/2004/05/28/howto-atom-id"
    parsed_url = urlparse(url)
    time_stp = time.mktime(date.timetuple()) if date is not None else ''
    return u'tag:%s,%s:%s' %(parsed_url.hostname, time_stp, parsed_url.path) # + '/' + parsed_url.fragment


def public_feed(request):
    feed_title = _(u"%(workspace_name)s's public feed" % {'workspace_name' : ApplicationConfiguration['workspace_name']})
    feed_description = _(u"Workspace %(workspace_name)s public activity feed") % {'workspace_name' : ApplicationConfiguration['workspace_name']}
    request.user = AnonymousUser()
    activitites = get_viewable_activities(request, {'view_comments' : 1, 'view_texts' : 1})
    return _feed(request, activitites, feed_title, feed_description)

def private_feed(request, key):
    private_feed_key = Configuration.objects.get_key('private_feed_key', None)
    if private_feed_key != key:
        raise Http404

    feed_title = _(u"%(workspace_name)s's private feed" % {'workspace_name' : ApplicationConfiguration['workspace_name']})
    feed_description = _(u"Workspace %(workspace_name)s private feed") % {'workspace_name' : ApplicationConfiguration['workspace_name']}
    activities = Activity.objects.filter(type__in=Activity.ACTIVITIES_TYPES).order_by('-created')
    return _feed(request, activities, feed_title, feed_description)

def _feed(request, activities, feed_title, feed_description):
    feed = feedgenerator.Atom1Feed(
        title=feed_title,
        link=settings.SITE_URL,
        description=feed_description,
        language='en' # TODO: something better to do?
    )    

    for activity in activities:
        item_data = activity.printable_data()
        item_data_text = activity.printable_data(html=False, link=False)
        item_metadata = activity.created # TODO dateformat
        item_body = render_to_string('feed/feed_item.txt',
                                   { 'title': item_data,
                                     'body' : item_metadata,
                                     }, context_instance = RequestContext(request))
        feed.add_item(title=item_data_text,
               link=settings.SITE_URL,
               description=item_body,
               pubdate=activity.created,
               unique_id=get_tag_uri(settings.SITE_URL, activity.created),
               author_name=activity.user.username if activity.user else '-',
               )
    
    response = HttpResponse(mimetype=feed.mime_type)
    feed.write(response, 'utf-8')
    return response
    
def text_feed(request, key):
    from cm.views import get_text_by_keys_or_404    
    text = get_text_by_keys_or_404(key)
    feed_title = _(u"Text %(text_title)s's public feed" % {'text_title' : text.title})
    feed_description = _(u"Public activity feed for text %(text_title)s") % {'text_title' : text.title}
    request.user = AnonymousUser()
    activitites = get_viewable_activities(request, {'view_comments' : 1, 'view_texts' : 1}, text=text)
    return _feed(request, activitites, feed_title, feed_description)

def text_feed_private(request, key, private_feed_key):
    from cm.views import get_text_by_keys_or_404    
    text = get_text_by_keys_or_404(key)
    if text.private_feed_key != private_feed_key:
        raise Http404

    feed_title = _(u"Text %(text_title)s's private feed" % {'text_title' : text.title})
    feed_description = _(u"Private activity feed for text %(text_title)s") % {'text_title' : text.title}
    activities = Activity.objects.filter(type__in=Activity.ACTIVITIES_TYPES, text=text).order_by('-created')
    return _feed(request, activities, feed_title, feed_description)
