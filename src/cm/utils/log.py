from django.conf import settings
from django.core.mail import mail_admins
import sys

def _get_traceback(exc_info):
    import traceback
    return '\n'.join(traceback.format_exception(*(exc_info or sys.exc_info())))

def error_mail_admins(subject='Error', request=None):
    if request:        
        subject = 'Error (%s IP): %s' % ((request.META.get('REMOTE_ADDR') in settings.INTERNAL_IPS and 'internal' or 'EXTERNAL'), request.path)
        
    try:
        request_repr = repr(request)
    except:
        request_repr = "Request repr() unavailable"
        
    exc_info = sys.exc_info()
    message = "%s\n\n%s" % (_get_traceback(exc_info), request_repr)
    
    mail_admins(subject, message, fail_silently=True)
