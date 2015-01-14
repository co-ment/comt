#
# A settings config intended to be used with the Travis CI build.
#
import os

test_db = os.environ.get('DB', 'sqlite')

if test_db == 'postgres':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'comt',
            'USER': 'postgres',
            'OPTIONS': {
                'autocommit': True,
            }
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:'
        }
    }
