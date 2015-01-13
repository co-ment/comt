import os
import sys

os.environ['DJANGO_SETTINGS_MODULE'] = 'cm.settings'

path = os.environ['PROJECT_PATH']
if path not in sys.path:
    sys.path.append(path)

import django.core.handlers.wsgi
app = django.core.handlers.wsgi.WSGIHandler()
