from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import ugettext as _
import random

random.seed()

# no 0,1,o,l,O (difficult to differentiate)
KEY_CHARS = '23456789' + \
            'abcdefghijklmnpqrstuvwxyz' + \
            'ABCDEFGHIJKLMNPQRSTUVWXYZ'  


KEY_SIZE = 11

# database column length
KEY_MAX_SIZE = 20

def generate_key(size=KEY_SIZE):
    key = ''.join([random.choice(KEY_CHARS) for i in range(size)])
    return key

class KeyModel(models.Model):        
    key      = models.CharField(max_length=KEY_MAX_SIZE, db_index=True, unique=True, blank=False)
    adminkey = models.CharField(max_length=KEY_MAX_SIZE, db_index=True, unique=True, blank=False)

    class Meta:
        abstract = True
            
class PermanentModel(KeyModel):
    """
    Permanent model: delete only sets a flag in database 
    """
    deleted = models.BooleanField(default=False, db_index=True)
    state = models.CharField(max_length=16, blank=False)
    class Meta:
        abstract = True

    def delete(self):
        self.deleted = True
        self.save()

    def undelete(self):
        self.deleted = False
        self.save()
        
    def real_delete(self):
        super(KeyModel, self).delete() 


class AuthorModel(models.Model):
    user = models.ForeignKey(User, blank=True, null=True)
    name = models.CharField(_("Name:"), max_length=100, null=True, blank=True)
    email = models.CharField(_("Email:"), max_length=100, null=True, blank=True)

    class Meta:
        abstract = True
    
    def get_name(self):
        from cm.cm_settings import DECORATED_CREATORS
        
        if self.user and (not DECORATED_CREATORS or self.name == None):
            return self.user.username
        else:
            return self.name

    def get_email(self):
        from cm.cm_settings import DECORATED_CREATORS
        
        if self.user and (not DECORATED_CREATORS or self.email == None):
            return self.user.email
        else:
            return self.email

    def set_email_or_user(self, email_or_user):
        if type(email_or_user) == User:
            self.user = email_or_user
        else:
            self.email = email_or_user
        self.save()

class KeyManager(models.Manager):
    """
    Manager for key-models
    """
    def _gen_key(self):
        # generate unique key
        key = generate_key()
        while self.filter(key=key).count():
            key = generate_key()
        return key
        
    def _gen_adminkey(self):
        # generate unique adminkey

        adminkey = generate_key()
        while self.filter(adminkey=adminkey).count():
            adminkey = generate_key()
        return adminkey
        
    def create(self, *args, **kwargs):
        key = self._gen_key()
        adminkey = self._gen_adminkey()

        obj = models.Manager.create(self, key=key, adminkey=adminkey, *args, **kwargs)
        return obj

    def update_keys(self, comment):
        comment.key = self._gen_key()
        comment.adminkey = self._gen_adminkey()

    def real_all(self):
        return super(KeyManager, self).get_query_set()
        
class Manager(KeyManager):
    """
    Manager for permanent- and key- models
    """
    
    def get_query_set(self):
        return super(KeyManager, self).get_query_set().filter(deleted=False)    

