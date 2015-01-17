from django.contrib import admin

from cm.models import Text, Role, UserProfile, UserRole, TextVersion, \
    Activity, Notification
from cm.models_utils import Email


admin.site.register(Text)
admin.site.register(Role)
admin.site.register(UserProfile)
admin.site.register(UserRole)
admin.site.register(TextVersion)
admin.site.register(Email)
admin.site.register(Activity)
admin.site.register(Notification)
