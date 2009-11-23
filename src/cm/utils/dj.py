# django helpers collections
from django.conf import settings
from django.core.urlresolvers import reverse

def absolute_reverse(view_id, args):
    return settings.SITE_URL + reverse(view_id, args=args)
    
    