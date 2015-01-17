import os
import sys

from django.core.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cm.settings")

# Needed ? TODO: Check
path = os.environ['PROJECT_PATH']
if path not in sys.path:
    sys.path.append(path)

application = get_wsgi_application()
