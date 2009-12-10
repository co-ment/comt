from django.core import management
from django.db.models import Q
from django.db.models import Max
from django.utils.translation import ugettext as _, ugettext_lazy
import random

role_models_choices = [('generic', ugettext_lazy(u'Generic')), ('teacher', ugettext_lazy(u'Class (education)'))]


def change_role_model(role_model):
    TEMP_MANAGER_ID = random.randint(1000,10000000) 
    TEMP_MANAGER_NAME = str(random.randint(1000,10000000))
    
    TEMP_USER_ID = random.randint(1000,10000000)
    TEMP_USER_NAME = str(random.randint(1000,10000000))

    from cm.models import Role, UserRole

    # create fake manager/usr role to remember managers/users _roles
    temp_manager = Role.objects.create(id=TEMP_MANAGER_ID, name=TEMP_MANAGER_NAME)
    temp_user = Role.objects.create(id=TEMP_USER_ID, name=TEMP_USER_NAME)
    
    manager = Role.objects.get(id=1)
    
    for user_userrole in UserRole.objects.filter(~Q(role=manager) & ~Q(role=None)):
        user_userrole.role = temp_user
        user_userrole.save()

    for manager_userrole in UserRole.objects.filter(role=manager):
        manager_userrole.role = temp_manager
        manager_userrole.save()

    Role.objects.filter(~Q(id=TEMP_MANAGER_ID) & ~Q(id=TEMP_USER_ID)).delete()
    
    management.call_command('loaddata', 'roles_' + role_model, verbosity=0)

    new_manager = Role.objects.get(id=1)
    id_max = Role.objects.filter(~Q(id=TEMP_MANAGER_ID) & ~Q(id=TEMP_USER_ID)).aggregate(Max('id'))['id__max']
    new_user = Role.objects.get(id=id_max)
    
    for user_userrole in UserRole.objects.filter(role=temp_user):
        user_userrole.role = new_user
        user_userrole.save()

    for manager_userrole in UserRole.objects.filter(role=temp_manager):
        manager_userrole.role = new_manager
        manager_userrole.save()
    
    # cleanup
    Role.objects.get(id=TEMP_MANAGER_ID).delete()
    Role.objects.get(id=TEMP_USER_ID).delete()
    
