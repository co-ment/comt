import os


DEBUG = True
CLIENT_DEBUG = DEBUG
TEMPLATE_DEBUG = DEBUG
TESTING = os.environ.get('TESTING', False)

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Paris'  #UTC

# base timezone used for client
DEFAULT_TIME_ZONE = TIME_ZONE

# it's not the format js client users will see the dates in !
# it's the format that's used to communicate dates to js client (python date -> JSON str -> parsed to js date)
CLIENT_DATE_FMT = {'python_output': '%Y-%m-%dT%H:%M:%S',
                   'js_parse': "Y-m-d\\\\TH:i:s"}
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

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    #          'django.template.loaders.eggs.load_template_source',
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

TEMPLATE_DIRS = ()

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'cm',
    'tagging',
)


_ = lambda s: s

LANGUAGES = (
    ('fr', _(u'French')),
    ('en', _(u'English')),
    ('es', _('Spanish')),
    ('it', _('Italian')),
    ('de', _('German')),
    ('pt_BR', _('Brazilian Portuguese')),
    ('nb', _('Norwegian')),
    ('bg', _('Bulgarian')),
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'filters': {
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'WARNING',
        }
    }
}

AUTH_PROFILE_MODULE = 'cm.UserProfile'

# always upload file to disk to pipe them through converters
FILE_UPLOAD_HANDLERS = (
"django.core.files.uploadhandler.TemporaryFileUploadHandler",)

# comt settings
PISTON_IGNORE_DUPE_MODELS = True


#
# YUI settings
#
# YUI version : set to js/lib/ version directory to be used  
YUI_VERSION = 'yui3-3.15.0'
YUI_DEBUG = DEBUG  # use expanded yui version (i.e. not -min)
YUI_DISTANT = False

CACHE_BACKEND = 'locmem:///?timeout=3600&max_entries=400'


###############################################################################

#
# Override defaults with more default (?!).
#

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'comt.db',
    }
}

SITE_URL = "http://127.0.0.1:8000"  # YOUR_SETTINGS

DEFAULT_FROM_EMAIL = "me@example.com"  # YOUR_SETTINGS

# destination email for the contact page
CONTACT_DEST = DEFAULT_FROM_EMAIL

# smtp host
EMAIL_HOST = "localhost"  # YOUR_SETTINGS

TEMPLATE_STRING_IF_INVALID = "NNNNNNNNNOOOOOOOOOOOOOOO" if DEBUG else ''

# Insert some random text here,
# it will be used to add some randomness to every crypto operation Comt does
SECRET_KEY = 'TODO FIXME'  # YOUR_SETTINGS

CM_MEDIA_PREFIX = '/cmmedia/'
ADMINS = (
    ('Comt admin', CONTACT_DEST),
)

MANAGERS = ADMINS
SEND_BROKEN_LINK_EMAILS = False

SERVER_EMAIL = DEFAULT_FROM_EMAIL


# Do not use name/email of co-ment users but rather
# those passed in the request.
# Set this parameter to True when using co-ment from
# a third-party CMS throuch co-ment API.
DECORATED_CREATORS = False

# Set to TRUE to use Abiword for convertion from and to legacy formats.
# Set to False to use LibreOffice for convertion from and to legacy formats.
USE_ABI = True

# Set to False to avoid appearing in Sopinspace Piwik statistics
TRACKING_ID = False

# FIXME: temp value to make karma tests passe
TRACKING_ID = 17


#
# Even more overrides
#
DEFAULT_FROM_EMAIL = "me@example.com"  # YOUR_SETTINGS

# destination email for the contact page
CONTACT_DEST = DEFAULT_FROM_EMAIL

ADMINS = (
    ('Comt admin', CONTACT_DEST),
)

# Set to True if you don't want to appear in Sopinspace Piwik statistics
DISABLE_TRACKING = True

# disable email reporting by piston
PISTON_EMAIL_ERRORS = False

#
# Override with local settings
#
try:
    from settings_local import *
except ImportError:
    pass

