from django.conf import settings
import os
import os.path


def pytest_configure(config):
    if not settings.configured:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'cm.settings'

    test_db = os.environ.get('DB', 'sqlite')
    if test_db == 'mysql':
        settings.DATABASES['default'].update({
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'comt',
            'USER': 'root',
        })
    elif test_db == 'postgres':
        settings.DATABASES['default'].update({
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'comt',
            'USER': 'postgres',
            'OPTIONS': {
                'autocommit': True,
            },
        })
    elif test_db == 'sqlite':
        settings.DATABASES['default'].update({
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        })

    settings.TEMPLATE_DEBUG = True
