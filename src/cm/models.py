from cm.converters.pandoc_converters import \
    CHOICES_INPUT_FORMATS as CHOICES_INPUT_FORMATS_PANDOC, \
    DEFAULT_INPUT_FORMAT as DEFAULT_INPUT_FORMAT_PANDOC, pandoc_convert
from cm.models_base import PermanentModel, KeyManager, Manager, KeyModel, AuthorModel
from cm.models_utils import *
from cm.utils.dj import absolute_reverse
from cm.utils.date import datetime_to_user_str
from cm.utils.comment_positioning import compute_new_comment_positions
from django import forms
from django.db.models import Q
from django.template.loader import render_to_string
from django.conf import settings
from django.template import RequestContext
from django.contrib.auth.models import Permission
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.core.files.base import ContentFile
from django.core.urlresolvers import reverse
from django.template.defaultfilters import timesince
from django.db import models
from django.utils.translation import ugettext as _, ugettext_lazy, ugettext_noop
from tagging.fields import TagField
import pickle
from django.db import connection



class TextManager(Manager):
    def create_text(self, title, format, content, note, name, email, tags, user=None, state='approved', **kwargs):
        text = self.create(name=name, email=email, user=user, state=state)
        text_version = TextVersion.objects.create(title=title, format=format, content=content, text=text, note=note, name=name, email=email, tags=tags, user=user)
        return text
    
    def create_new_version(self, text, title, format, content, note, name, email, tags, user=None, **kwargs):
        text_version = TextVersion.objects.create(title=title, format=format, content=content, text=text, note=note, name=name, email=email, tags=tags, user=user)
        return text_version
    
class Text(PermanentModel, AuthorModel):
    modified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    private_feed_key = models.CharField(max_length=20, db_index=True, unique=True, blank=True, null=True, default=None)

    # denormalized fields
    last_text_version = models.ForeignKey("TextVersion", related_name='related_text', null=True, blank=True)
    title = models.TextField()

    objects = TextManager()
    
    def get_latest_version(self):
        return self.last_text_version
    
    def fetch_latest_version(self):
        versions = self.get_versions()
        if versions:
            return versions[0]
        else:
            return None
    
    def update_denorm_fields(self):
        real_last_text_version = self.fetch_latest_version()
    
        modif = False
        if real_last_text_version and real_last_text_version != self.last_text_version:
            self.last_text_version = real_last_text_version
            modif = True
            
        if real_last_text_version and real_last_text_version.title and real_last_text_version.title != self.title:
            self.title = real_last_text_version.title
            modif = True
        
        if real_last_text_version and real_last_text_version.modified != self.modified:
            self.modified = real_last_text_version.modified
            modif = True
            
        if modif:
            self.save()

                
    def get_title(self):
        return self.get_latest_version().title
    
    def get_versions(self):
        """
        Versions with most recent first
        """
        versions = TextVersion.objects.filter(text__exact=self).order_by('-created')
        # TODO: use new postgresql 8.4 row_number as extra select to do that
        for index in xrange(len(versions)):
            v = versions[index]
            # version_number is 1-based
            setattr(v, 'version_number', len(versions) - index)
        #for v in versions:
        #    print v.created,v.id,v.version_number
        return versions

    def get_version(self, version_number):        
        """
        Get version number 'version_number' (1-based)
        """
        version = TextVersion.objects.filter(text__exact=self).order_by('created')[version_number - 1:version_number][0]
        return version
        
    def get_inversed_versions(self):
        versions = TextVersion.objects.filter(text__exact=self).order_by('created')
        # TODO: use new postgresql 8.4 row_number as extra select to do that
        for index in xrange(len(versions)):
            v = versions[index]
            # version_number is 1-based
            setattr(v, 'version_number', index + 1)
        return versions

    def get_versions_number(self):
        return self.get_versions().count()

    def is_admin(self, adminkey=None):
        if adminkey and self.adminkey == adminkey:
            return True
        else:
            return False

    def revert_to_version(self, v_id):
        text_version = self.get_version(int(v_id))
        new_text_version = TextVersion.objects.duplicate(text_version, True)
        return new_text_version
        
    def edit(self, new_title, new_format, new_content, new_tags=None, new_note=None, keep_comments=True, new_version=True):
        text_version = self.get_latest_version()
            
        if new_version:        
            text_version = TextVersion.objects.duplicate(text_version, keep_comments)
        text_version.edit(new_title, new_format, new_content, new_tags, new_note, keep_comments)        
        return text_version 
        
    def __unicode__(self):
        return self.title    

DEFAULT_INPUT_FORMAT = getattr(settings, 'DEFAULT_INPUT_FORMAT', DEFAULT_INPUT_FORMAT_PANDOC)
CHOICES_INPUT_FORMATS = getattr(settings, 'CHOICES_INPUT_FORMATS', CHOICES_INPUT_FORMATS_PANDOC)

class TextVersionManager(models.Manager):

    def duplicate(self, text_version, duplicate_comments=True):
        #import pdb;pdb.set_trace()
        old_comment_set = set(text_version.comment_set.all())
        text_version.id = None
        #import pdb;pdb.set_trace()
        text_version.save()
        
        duplicate_text_version = text_version
        
        if duplicate_comments:
            old_comment_map = {}
            while len(old_comment_set):
                for c in old_comment_set:
                    if not c.reply_to or c.reply_to.id in old_comment_map:
                        old_id = c.id
                        old_comment_set.remove(c)
                        reply_to = None
                        if c.reply_to:                            
                            reply_to = old_comment_map[c.reply_to.id]  
                        c2 = Comment.objects.duplicate(c, duplicate_text_version, reply_to)
                        old_comment_map[old_id] = c2
                        break
                 
        return duplicate_text_version
        
class TextVersion(AuthorModel):
    modified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    title = models.TextField(ugettext_lazy("Title"))
    format = models.CharField(ugettext_lazy("Format"), max_length=20, blank=False, default=DEFAULT_INPUT_FORMAT, choices=CHOICES_INPUT_FORMATS)
    content = models.TextField(ugettext_lazy("Content"))
    tags = TagField(ugettext_lazy("Tags"), max_length=1000)

    note = models.CharField(ugettext_lazy("Note"), max_length=100, null=True, blank=True)

    mod_posteriori = models.BooleanField(ugettext_lazy('Moderation a posteriori?'), default=True)

    text = models.ForeignKey("Text")

    objects = TextVersionManager()
    
    def get_content(self, format='html'):
        converted_content = pandoc_convert(self.content, self.format, format)
        return converted_content 

#    def _get_comments(self, user = None, filter_reply = 0):        
#        """
#        get comments viewable by this user (user = None or user = AnonymousUser => everyone)
#        filter_reply = 0: comments and replies
#                       1: comments
#                       2: replies
#        """        
#        from cm.security import has_perm_on_text # should stay here to avoid circular dependencies
#        
#        if has_perm(user, 'can_view_unapproved_comment', self.text):
#            comments = self.comment_set.all()
#        elif has_perm(user, 'can_view_approved_comment', self.text):
#            comments = self.comment_set.filter(visible=True)
#        elif has_perm(user, 'can_view_comment_own', self.text):
#            comments = self.comment_set.filter(user=user)
#        else:
#            return Comment.objects.none() # empty queryset
#        if filter_reply:
#            comments = comments.filter)
#        return comments
#
#    def get_comments_as_json(self, user = None):
#        return simplejson.dumps(self._get_comments(user, filter_reply=0))
#
#    def get_comments_and_replies(self, user = None):
#        return (self.get_comments(user),
#                self.get_replies(user))
#
    def get_comments(self):
        "Warning: data access without security"
        return self.comment_set.filter(reply_to=None, deleted=False)

    def get_replies(self):
        "Warning: data access without security"
        return self.comment_set.filter(~Q(reply_to == None), Q(deleted=False))
    
    def __unicode__(self):
        return '<%d> %s' % (self.id, self.title)    

    def edit(self, new_title, new_format, new_content, new_tags=None, new_note=None, keep_comments=True): # TODO : tags
        if not keep_comments :
            self.comment_set.all().delete()
        elif self.content != new_content or new_format != self.format:
            comments = self.get_comments() ;
            tomodify_comments, toremove_comments = compute_new_comment_positions(self.content, self.format, new_content, new_format, comments)
            #print "tomodify_comments",len(tomodify_comments)
            #print "toremove_comments",len(toremove_comments)
            [comment.save() for comment in tomodify_comments]
            [comment.delete() for comment in toremove_comments]
        self.title = new_title
        if new_tags:
            self.tags = new_tags
        if new_note:
            self.note = new_note
        self.content = new_content
        self.format = new_format
        self.save()
        
class CommentManager(Manager):
    
    def duplicate(self, comment, text_version, reply_to=None):
        comment.id = None
        comment.text_version = text_version
        if reply_to:
            comment.reply_to = reply_to
        self.update_keys(comment)
        comment.save()
        return comment
    
class Comment(PermanentModel, AuthorModel):
    modified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    text_version = models.ForeignKey("TextVersion")

    # comment_set will be replies
    reply_to = models.ForeignKey("Comment", null=True, blank=True)

    title = models.TextField()
    content = models.TextField()
    content_html = models.TextField()
    
    format = models.CharField(_("Format:"), max_length=20, blank=False, default=DEFAULT_INPUT_FORMAT, choices=CHOICES_INPUT_FORMATS)

    tags = TagField()
        
    start_wrapper = models.IntegerField(null=True, blank=True)
    end_wrapper = models.IntegerField(null=True, blank=True)
    start_offset = models.IntegerField(null=True, blank=True)
    end_offset = models.IntegerField(null=True, blank=True)

    objects = CommentManager()
    
    def __unicode__(self):
        return '<%d> %s' % (self.id, self.title)    
        
    def is_reply(self):
        return self.reply_to != None
    
    def is_thread_full_visible(self, own_user=None):
        """
        own_user: comment belonging to this user are also visible 
        """
        if self.state == 'approved' or (own_user and self.user == own_user):
            if self.reply_to==None:
                return True
            else:                
                return self.reply_to.is_thread_full_visible(own_user)
        return False
               
    def top_comment(self):
        if self.reply_to == None :
            return self
        else : 
            return self.reply_to.top_comment()
    
    def depth(self):
        if self.reply_to == None :
            return 0
        else : 
            return 1 + self.reply_to.depth()
    
    def delete(self):
        PermanentModel.delete(self)
        # delete replies
        [c.delete() for c in self.comment_set.all()]
    
# http://docs.djangoproject.com/en/dev/topics/files/#topics-files

# default conf values
DEFAULT_CONF = {
                'workspace_name' : 'Workspace',
                'site_url' : settings.SITE_URL,
                'email_from' : settings.DEFAULT_FROM_EMAIL,
                }

from cm.role_models import change_role_model

class ConfigurationManager(models.Manager):
    def set_workspace_name(self, workspace_name):
        if workspace_name and not self.get_key('workspace_name')!=u'Workspace':
            self.set_key('workspace_name', _(u"%(workspace_name)s's workspace") %{'workspace_name':workspace_name})

    def get_key(self, key, default_value=None):
        try:
            return self.get(key=key).value
        except Configuration.DoesNotExist:
            return DEFAULT_CONF.get(key, default_value)
        
    def set_key(self, key, value):
        conf, created = self.get_or_create(key=key)
        if created or conf.value != value:
            conf.value = value
            conf.save()
            if key == 'workspace_role_model':
                change_role_model(value)

    def __getitem__(self, key):
        return self.get_key(key, None)
    
import base64

class Configuration(models.Model):
    key = models.TextField(blank=False) # , unique=True cannot be added: creates error on mysql (?)
    raw_value = models.TextField(blank=False)
    
    def get_value(self):
        return pickle.loads(base64.b64decode(self.raw_value.encode('utf8')))
        
    def set_value(self, value):        
        self.raw_value = base64.b64encode(pickle.dumps(value, 0)).encode('utf8')
                
    value = property(get_value, set_value)
                
    objects = ConfigurationManager()
    
    def __unicode__(self):
        return '%s: %s' % (self.key, self.value)    
    
ApplicationConfiguration = Configuration.objects     

class AttachmentManager(KeyManager):
    def create_attachment(self, text_version, filename, data):
        attach = self.create(text_version=text_version)
        ff = ContentFile(data)
        attach.data.save(filename, ff)
        return attach
    
class Attachment(KeyModel):
    data = models.FileField(upload_to="attachments/%Y/%m/%d/", max_length=1000)
    text_version = models.ForeignKey(TextVersion)

    objects = AttachmentManager()
    
class NotificationManager(KeyManager):
    def create_notification(self, text, type, active, email_or_user):
        notification = self.create(text=text, type=type, active=active)
        notification.set_email_or_user(email_or_user)
        return notification

    def get_notifications(self, text, type, email_or_user):
        if isinstance(email_or_user,unicode):
            prev_notifications = Notification.objects.filter(text=text, type=type, email=email_or_user)
        else:
            prev_notifications = Notification.objects.filter(text=text, type=type, user=email_or_user)
            
        if prev_notifications:
            return prev_notifications[0]
        else:
            return None
     
    def set_notification(self, text, type, active, email_or_user):
        notification = self.get_notifications(text, type, email_or_user)
        if notification == None :
            self.create_notification(text, type, active, email_or_user)
        else : 
            notification.active = active
            notification.save()                
    
class Notification(KeyModel, AuthorModel):
    text = models.ForeignKey(Text, null=True, blank=True)
    type = models.CharField(max_length=30, null=True, blank=True)
    active = models.BooleanField(default=True) # active = False means user desactivation
    
    objects = NotificationManager()
    
    def desactivate_notification_url(self):
        return reverse('desactivate-notification', args=[self.adminkey])

    def desactivate(self):    
        if self.type=='own':
            self.active = False
            self.save()
        else:
            self.delete()
    
# right management
class UserRoleManager(models.Manager):
    def create_userroles_text(self, text):
        # make sure every user has a userrole on this text
        for user in User.objects.all():
            userrole, _ = self.get_or_create(user=user, text=text)
        # anon user
        userrole, _ = self.get_or_create(user=None, text=text)
        # anon global user
        global_userrole, _ = self.get_or_create(user=None, text=None)
            
class UserRole(models.Model):
    role = models.ForeignKey("Role", null=True, blank=True)
    
    # user == null => anyone
    user = models.ForeignKey(User, null=True, blank=True)
    
    # text == null => any text (workspace role)
    text = models.ForeignKey(Text, null=True, blank=True)
    
    objects = UserRoleManager()
    
    class Meta:
        unique_together = (('role', 'user', 'text',))

    def __unicode__(self):
        if self.role:
            rolename = _(self.role.name)
        else:
            rolename = ''
            
        if self.user:
            return u"%s: %s %s %s" % (self.__class__.__name__, self.user.username, self.text, rolename)
        else:
            return u"%s: *ALL* %s %s" % (self.__class__.__name__, self.text, rolename)
    
    def __repr__(self):
        return self.__unicode__()

from cm.models_base import generate_key
from cm.utils.misc import update

class Role(models.Model):
    """
    'Static' application roles 
    """
    name = models.CharField(ugettext_lazy('name'), max_length=50, unique=True)
    description = models.TextField(ugettext_lazy('description'))
    #order = models.IntegerField(unique=True)
    permissions = models.ManyToManyField(Permission, related_name="roles")

    global_scope = models.BooleanField('global scope', default=False) # applies to global scope only
    anon = models.BooleanField('anonymous', default=False) # role possible for anonymous users?
    
    def __unicode__(self):
        return _(self.name)
    
    def __hash__(self):
        return self.id

    def name_i18n(self):
        return _(self.name)
    
from django.utils.safestring import mark_safe
 
class RegistrationManager(KeyManager):
    def activate_user(self, activation_key):
        """
        Validates an activation key and activates the corresponding
        ``User`` if valid.
        If the key is valid , returns the ``User`` as second arg
        First is boolean indicating if user has just been activated
        """
        # Make sure the key we're trying conforms to the pattern of a
        # SHA1 hash; if it doesn't, no point trying to look it up in
        # the database.
        try:
            profile = self.get(admin_key=activation_key)
        except self.model.DoesNotExist:
            return False, False
        user = profile.user
        activated = False
        if not user.is_active:
            user.is_active = True
            user.save()
            activated = True
        return (activated, user)

    def _create_manager(self, email, username, password, first_name, last_name):
        if username and email and password and len(User.objects.filter(username=username)) == 0:
            user = User.objects.create(username=username, email=email, first_name=first_name, last_name=last_name, is_active=True)
            user.set_password(password)
            user.save()
            
            profile = UserProfile.objects.create(user=user)
                    
            manager = Role.objects.get(name='Manager')
            UserRole.objects.create(text=None, user=user, role=manager)
            return user
        else:
            return None
    
        
    def create_inactive_user(self, email, send_invitation, **kwargs):
        #prevent concurrent access 
        cursor = connection.cursor()
        sql = "LOCK TABLE auth_user IN EXCLUSIVE MODE"
        cursor.execute(sql)
        
        try:
            user_with_email = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            user = User.objects.create(username=email, email=email)
            profile = UserProfile.objects.create(user=user)
            update(user, kwargs)
            update(profile, kwargs)
            
            user.is_active = False
            user.save()
            profile.save()
            
            note = kwargs.get('note', None) 
            if send_invitation:
                profile.send_activation_email(note)
            return user
        else:
            return user_with_email
        

from cm.utils.mail import send_mail

class UserProfile(KeyModel):
    modified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    
    user = models.ForeignKey(User, unique=True)

    allow_contact = models.BooleanField(ugettext_lazy(u'Allow contact'), default=True, help_text=ugettext_lazy(u"Allow email messages from other users"))    
    preferred_language = models.CharField(ugettext_lazy(u'Preferred language'), max_length=2, default="en")
    is_temp = models.BooleanField(default=False)
    is_email_error = models.BooleanField(default=False)
    is_suspended = models.BooleanField(ugettext_lazy(u'Suspended access'), default=False) # used to disable access or to wait for approval when registering

    objects = RegistrationManager()

    class Meta:
        permissions = (
            ("can_create_user", "Can create user"),
            ("can_delete_user", "Can delete user"),
        )
        
    def __unicode__(self):
        return unicode(self.user)

    def global_userrole(self):
        try:
            return UserRole.objects.get(user=self.user, text=None)
        except UserRole.DoesNotExist:
            return None

    def global_userrole(self):
        try:
            return UserRole.objects.get(user=self.user, text=None)
        except UserRole.DoesNotExist:
            return None

    def admin_print(self):
        if self.is_suspended:
            if self.user.is_active:
                return mark_safe('%s (%s)' % (self.user.username, _(u'suspended'),))
            else:
                return mark_safe('%s (%s)' % (self.user.username, _(u'waiting approval'),))
        else:
            if self.user.is_active:
                return mark_safe('%s' % self.user.username) 
            else:
                email_username = self.user.email.split('@')[0]
                return mark_safe('%s (%s)' % (self.user.username, _(u'pending'),))

    def simple_print(self):
        if self.user.is_active:
            return self.user.username 
        else:
            return self.user.email

    def send_activation_email(self, note=None):
        self._send_act_invit_email(note=note, template='email/activation_email.txt')

    def send_invitation_email(self, note=None):
        self._send_act_invit_email(note=note, template='email/invitation_email.txt')
        
    def _send_act_invit_email(self, template, note=None):
        subject = _(u'Invitation')
    
        activate_url = reverse('user-activate', args=[self.adminkey])
        message = render_to_string(template,
                                   { 
                                     'activate_url' : activate_url,
                                     'note' : note,
                                     'CONF': ApplicationConfiguration
                                      })
    
        send_mail(subject, message, ApplicationConfiguration['email_from'], [self.user.email])
        
from django.db.models import signals

#def create_profile(sender, **kwargs):
#    created = kwargs['created']
#    if created:
#        user = kwargs['instance']
#        UserProfile.objects.create(user = user)

def delete_profile(sender, **kwargs):
    user_profile = kwargs['instance']
    user = user_profile.user
    user.delete()
    
#signals.post_save.connect(create_profile, sender=User)
signals.post_delete.connect(delete_profile, sender=UserProfile)

class ActivityManager(models.Manager):
    pass

class Activity(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    originator_user = models.ForeignKey(User, related_name='originator_activity', null=True, blank=True, default=None)
    text = models.ForeignKey(Text, null=True, blank=True, default=None)
    text_version = models.ForeignKey(TextVersion, null=True, blank=True, default=None)
    comment = models.ForeignKey(Comment, null=True, blank=True, default=None)
    user = models.ForeignKey(User, null=True, blank=True, default=None)
    type = models.CharField(max_length=30)
    ip = models.IPAddressField(null=True, blank=True, default=None)
    
    objects = ActivityManager()
    
    # viewable activities (i.e. now 'text-view')
    VIEWABLE_ACTIVITIES = {
                   'view_comments' : ['comment_created', 'comment_removed'],
                   'view_users' : ['user_created', 'user_activated', 'user_refused', 'user_enabled', 'user_approved', 'user_suspended'],
                   'view_texts' : ['text_created', 'text_removed', 'text_edited', 'text_edited_new_version'],
                   }
    ACTIVITIES_TYPES = reduce(list.__add__, VIEWABLE_ACTIVITIES.values())
    
    IMGS = {
            'text_created' : u'page_add_small.png',
            'text_removed' : u'page_delete_small.png',
            'text_edited'  : u'page_save_small.png',
            'text_edited_new_version' : u'page_save_small.png',
            'user_created' : u'user_add_small.png',
            'user_enabled' : u'user_add_small.png',
            'user_refused': u'user_delete_small.png',
            'user_suspended': u'user_delete_small.png',
            'user_approved': u'user_add_small.png',
            'user_activated' : u'user_go.png',
            'comment_created' : u'note_add_small.png',
            'comment_removed' : u'note_delete_small.png',
        }
    
    #type/msg
    MSGS = {
         'text_edited' : ugettext_lazy(u'Text %(link_to_text)s edited'),
         'text_edited_new_version' : ugettext_lazy(u'Text %(link_to_text)s edited (new version created)'),
         'text_created' :  ugettext_lazy(u'Text %(link_to_text)s added'),
         'text_removed' : ugettext_lazy(u'Text %(link_to_text)s removed'),
         'comment_created' : ugettext_lazy(u'Comment %(link_to_comment)s added on text %(link_to_text)s'),
         'comment_removed' : ugettext_lazy(u'Comment %(link_to_comment)s removed from text %(link_to_text)s'),
         'user_created' : ugettext_lazy(u'User %(username)s added'),
         'user_enabled' : ugettext_lazy(u'User %(username)s access to workspace enabled'),
         'user_refused' : ugettext_lazy(u'User %(username)s access to workspace refused'),
         'user_suspended' : ugettext_lazy(u'User %(username)s access to workspace suspended'),
         'user_activated' : ugettext_lazy(u'User %(username)s access to workspace activated'),
         'user_approved' : ugettext_lazy(u'User %(username)s has activated his account'),
         }
    
    def is_same_user(self, other_activity):
        if (self.originator_user != None or other_activity.originator_user != None) and self.originator_user != other_activity.originator_user:
            return False
        else:
            return self.ip != None and self.ip == other_activity.ip

    def linkable_text_title(self, html=True, link=True):
        # html: whether or not output sould be html
        format_args = {'link':absolute_reverse('text-view', args=[self.text.key]), 'title':self.text.title}
        if html and not self.text.deleted :
            return mark_safe(u'<a href="%(link)s">%(title)s</a>' % format_args)
        else:
            if link and not self.text.deleted:
                return u'%(title)s (%(link)s)' % format_args
            else:             
                return self.text.title ;

    def linkable_comment_title(self, html=True, link=True):
        if self.comment:
            format_args = {'link':absolute_reverse('text-view-show-comment', args=[self.text.key, self.comment.key]), 'title':self.comment.title}
            if html and not self.comment.deleted and not self.text.deleted:
                return mark_safe(u'<a href="%(link)s">%(title)s</a>' % format_args)
            else :
                if link and not self.comment.deleted and not self.text.deleted:
                    return u'%(title)s (%(link)s)' % format_args
                else:
                    return self.comment.title ;
        else:
            return u''

    def __unicode__(self):
        return u"%s %s %s %s %s" % (self.type, self.originator_user, self.text, self.comment, self.user)
    
    def img_name(self):
        return self.IMGS.get(self.type)

    def printable_data_nohtml_link(self):
        return self.printable_data(html=False, link=True)
        
    def printable_data(self, html=True, link=True):
        msg = self.MSGS.get(self.type, None)
        if msg:
            return mark_safe(msg % {
                                     'link_to_text' : self.linkable_text_title(html=html, link=link) if self.text else None,
                                     'link_to_comment' : self.linkable_comment_title(html=html, link=link) if self.comment else None,
                                     'username' : self.user.username if self.user else None,
                                    })
        return ''
    
    def printable_metadata(self, html=True):
        ret = []
        if self.type == 'user_activated':
            ret.append(_(u'by "%(username)s"') % {'username' : self.originator_user.username})
            ret.append(' ')
        ret.append(_(u"%(time_since)s ago") % {'time_since':timesince(self.created)})
        return ''.join(ret)

    def printable_metadata_absolute(self, html=True):
        ret = []
        if self.type == 'user_activated':
            ret.append(_(u'by "%(username)s"') % {'username' : self.originator_user.username})
            ret.append(u' ')
        ret.append(datetime_to_user_str(self.created))
        return u''.join(ret)

import cm.denorm_engine
import cm.admin
import cm.main
import cm.activity
import cm.notifications

# we fill username with email so we need a bigger value 
User._meta.get_field('username').max_length = 75
