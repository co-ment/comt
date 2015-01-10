#
# A settings config intended to be used with the Travis CI build.
#

DEBUG = True
TEMPLATE_DEBUG = DEBUG
CLIENT_DEBUG = DEBUG

YUI_DEBUG = DEBUG # use expanded yui version (i.e. not -min)
YUI_DISTANT = False

DATABASES = {
	'default': {
		'ENGINE':	'postgresql_psycopg2',
		'NAME':		'comt',
		'USER':		'postgres',
		'PASSWORD':	'',
		'HOST':		'',
		'PORT':		'',
	}
}

# DATABASES = {
# 	'default': {
#         'ENGINE':	'sqlite3',
#         'NAME':		'com.db',
#         }
# }


SITE_URL = "http://127.0.0.1:8000" # YOUR_SETTINGS

DEFAULT_FROM_EMAIL = "me@example.com" # YOUR_SETTINGS

# destination email for the contact page
CONTACT_DEST = DEFAULT_FROM_EMAIL

# smtp host
EMAIL_HOST = "localhost" # YOUR_SETTINGS

TEMPLATE_STRING_IF_INVALID = "NNNNNNNNNOOOOOOOOOOOOOOO" if DEBUG else ''

# web server writable directory to store Comt uploaded content (text images etc.)
MEDIA_ROOT = '/the/path/' # YOUR_SETTINGS

# Insert some random text here,
# it will be used to add some randomness to every crypto operation Comt does
SECRET_KEY = 'NOT FOR PRODUCTION' # YOUR_SETTINGS

MEDIA_URL = '/site_media/'

INSTALLED_APPS = (
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.sites',
	'django.contrib.admin',
	'cm',
#	 'django_extensions',
	'tagging',
	'south',
)

CM_MEDIA_PREFIX = '/cmmedia/'

ADMIN_MEDIA_PREFIX = '/media/'

ADMINS = (
	('Comt admin', CONTACT_DEST),
)

MANAGERS = ADMINS
SEND_BROKEN_LINK_EMAILS = False

SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
DEFAULT_TIME_ZONE = "Europe/Paris"

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

