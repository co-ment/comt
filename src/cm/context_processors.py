from django.conf import settings
from cm.models import ApplicationConfiguration

def static(request):
    """
    add static data to be used in templates
    """
    return {
            'SITE_URL' : settings.SITE_URL,
            'CLIENT_DEBUG' : settings.CLIENT_DEBUG,
            'YUI_VERSION' : settings.YUI_VERSION,
            'CONF': ApplicationConfiguration
            }



def tz(request):
    """
    Add tz info
    """
    return {
        # TODO: set tz to user timezone if logged in
        'tz': request.session.get('tz',None),
        'tz_installed' : True,
    }
    

from cm.utils.i18n import translate_to
LOCAL_LANGUAGES = []
for code, value in settings.LANGUAGES:
    trans_value = translate_to(value, code)
    LOCAL_LANGUAGES.append((code, trans_value))

def utils(request):
    """
    all utils objects:
    - 'intelligent' language object
    """
    return {
            'LOCAL_LANGUAGES' : LOCAL_LANGUAGES,
            }    