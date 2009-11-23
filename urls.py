from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^admin/', include(admin.site.urls)),    
    
    (r'', include('cm.urls')),
)

try :
    import urls_local
except ImportError :
    pass 
