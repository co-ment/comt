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

    """
        This middleware allows cross-domain XHR using the html5 postMessage API.
    """
    def process_request(self, request):

        if 'HTTP_ACCESS_CONTROL_REQUEST_METHOD' in request.META:
            response = http.HttpResponse()
            response['Access-Control-Allow-Origin']  = '*' 
            return response

        return None

    def process_response(self, request, response):
        # Avoid unnecessary work
        if response.has_header('Access-Control-Allow-Origin'):
            return response

        response['Access-Control-Allow-Origin']  = '*' 

        return response
