from django.http import HttpResponse

from cm.cm_settings import DEFAULT_TIME_ZONE


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
    
