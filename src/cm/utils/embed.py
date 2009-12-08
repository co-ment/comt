from django.core.urlresolvers import reverse
from django.conf import settings

def embed_html(text_key, attrs='', version_key=None) :
    if version_key :
        url =  reverse('text-view-comments-frame-version', args=[text_key, version_key])
    else :
        url =  reverse('text-view-comments-frame', args=[text_key])

    embed_code = '<iframe %s frameborder="0" src="%s%s" style="height: 200px; width: 99.9%%; position: relative; top: 0px;">'%(attrs, settings.SITE_URL, url)
    
    return embed_code
