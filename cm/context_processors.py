from django.conf import settings

from cm.cm_settings import TRACKING_ID
from cm.models import ApplicationConfiguration
from cm.converters.pandoc_converters import PANDOC_VERSION
from cm.utils.i18n import translate_to


def static(request):
    """
    add static data to be used in templates
    """
    return {
        'SITE_URL': settings.SITE_URL,
        'CLIENT_DEBUG': settings.CLIENT_DEBUG,
        'TRACKING_ID': TRACKING_ID,
        'YUI_VERSION': settings.YUI_VERSION,
        'CONF': ApplicationConfiguration,
        'CM_MEDIA_PREFIX': settings.CM_MEDIA_PREFIX,
        'PANDOC_VERSION': PANDOC_VERSION,
    }


def tz(request):
    """
    Add tz info
    """
    # print "proutch %s" %request.session.get('tz', None)
    #	-> proutch None
    #	pas content...
    return {
        # TODO: set tz to user timezone if logged in
        'tz': request.session.get('tz', None),
        'tz_installed': True,
    }


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
        'LOCAL_LANGUAGES': LOCAL_LANGUAGES,
    }
