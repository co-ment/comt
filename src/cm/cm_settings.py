# default cm settings

from django.conf import settings

def get_setting(setting_name, default=None):
    return getattr(settings, setting_name, default)

VALID_EMAIL_FOR_PUBLISH = get_setting('VALID_EMAIL_FOR_PUBLISH', True)

CM_EMAIL_SUBJECT_PREFIX = get_setting('CM_EMAIL_SUBJECT_PREFIX', '[comt] ')

SITE_NAME = get_setting('SITE_NAME', 'comt ')

DEFAULT_TIME_ZONE = get_setting('DEFAULT_TIME_ZONE','Europe/Paris') 

# button for new text version creation checked by default 
NEW_TEXT_VERSION_ON_EDIT = get_setting('NEW_TEXT_VERSION_ON_EDIT', True)

# option to bypass all security checks 
NO_SECURITY = get_setting('NO_SECURITY', False)

# should every contributor be registered to notifications automatically
AUTO_CONTRIB_REGISTER = get_setting('AUTO_CONTRIB_REGISTER', False)