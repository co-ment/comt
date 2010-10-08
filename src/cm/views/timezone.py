from django import forms
from django.core.urlresolvers import reverse
from django.forms import ModelForm
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.translation import ugettext as _, ugettext_lazy
from cm.models import Text, TextVersion, Attachment, Comment
from cm.cm_settings import DEFAULT_TIME_ZONE
import mimetypes
import simplejson
from cm.utils.timezone import tz_convert

def timezone_set(request):
    if request.method == 'POST':
        #if request.user.is_authenticated():
        try:
            tz = request.POST.get('tz', DEFAULT_TIME_ZONE)
            request.session['tz'] = tz
        except IOError:
            # silently swallow IOError
            pass
    
    return HttpResponse('')
    