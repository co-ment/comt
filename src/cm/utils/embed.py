from django.core.urlresolvers import reverse
from django.conf import settings

def embed_html(text_key, attrs='', version_key=None, query_string="") :
    if version_key :
        url =  reverse('text-view-comments-frame-version', args=[text_key, version_key])
    else :
        url =  reverse('text-view-comments-frame', args=[text_key])
    url += '?' + query_string
    embed_code = '<iframe %s frameborder="0" src="%s%s" style="height: 600px; width: 99.9%%; position: relative; top: 0px;"></iframe>'%(attrs, settings.SITE_URL, url)
    
    return embed_code
