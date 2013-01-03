DEBUG = False
CLIENT_DEBUG = DEBUG
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
#TIME_ZONE = 'America/Chicago'
TIME_ZONE = 'Europe/Paris' #UTC

# it's not the format js client users will see the dates in !
# it's the format that's used to communicate dates to js client (python date -> JSON str -> parsed to js date)
CLIENT_DATE_FMT = {'python_output' : '%Y-%m-%dT%H:%M:%S', 'js_parse' : "Y-m-d\\\\TH:i:s"}
ALLOW_CLIENT_MODIF_ON_LAST_VERSION_ONLY = True

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = ''

import os
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), "src/cm/site_media/")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/site_media/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/media/'

LOGIN_URL = '/login/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
#MEDIA_URL = SITE_URL + '/themedia/'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.load_template_source',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'cm.context_processors.static',
    'cm.context_processors.tz',
    'cm.context_processors.utils',    
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    "django.core.context_processors.i18n",    
    "django.core.context_processors.media",    
    'djangoflash.context_processors.flash',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',        
    'djangoflash.middleware.FlashMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'cm.middleware.CmMiddleware',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'cm',
    'tagging',
    'django_extensions', # http://code.google.com/p/django-command-extensions/
    'south',    
)

_ = lambda s: s

LANGUAGES = (
    ('fr', _(u'French')),
    ('en', _(u'English')),
    ('no', _('Norwegian')),
    ('pt_BR', _('Brazilian Portuguese')),
    ('es', _('Spanish')),
    ('bg', _('Bulgarian')),
    ('it', _('Italian')),
)

AUTH_PROFILE_MODULE = 'cm.UserProfile'

# always upload file to disk to pipe them through converters
FILE_UPLOAD_HANDLERS = ("django.core.files.uploadhandler.TemporaryFileUploadHandler",)

# comt settings
PISTON_IGNORE_DUPE_MODELS = True

# YUI version : set to js/lib/ version directory to be used  
YUI_VERSION = 'yui3.0.0'


# base timezone used for client
DEFAULT_TIME_ZONE = TIME_ZONE 

CACHE_BACKEND = 'locmem:///?timeout=3600&max_entries=400'

try:
    from settings_local import *
except ImportError:
    pass
