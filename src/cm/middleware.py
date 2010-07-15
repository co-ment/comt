from cm.exception import UnauthorizedException 
from django.conf import settings
from django.http import HttpResponseServerError,HttpResponseRedirect
from django.core.urlresolvers import reverse
from urllib import urlencode

class CmMiddleware(object):
    
    def process_exception(self, request, exception):
        if settings.DEBUG:
            import sys, traceback
            traceback.print_exc()
        if type(exception) == UnauthorizedException:
            if request.user.is_anonymous():
                query = urlencode({'next': request.META['PATH_INFO'], 'q' : request.META['QUERY_STRING'] })
                login_url = reverse('login') + '?'  + query
                return HttpResponseRedirect(login_url)
            else:
                redirect_url = reverse('unauthorized')
                return HttpResponseRedirect(redirect_url)
        raise
