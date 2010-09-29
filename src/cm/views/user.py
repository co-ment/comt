from django.forms.models import inlineformset_factory
from cm.models import *
from cm.message import *
from django.contrib.auth import authenticate
from django.contrib.auth import login as django_login  
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.forms.formsets import formset_factory
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.translation import ugettext as _, ugettext_lazy, ungettext
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.forms.util import ErrorList
from django.shortcuts import get_object_or_404
from cm.activity import register_activity
from cm.views import get_text_by_keys_or_404
from cm.message import display_message
from cm.utils import get_among, get_int
from cm.models import ApplicationConfiguration
from django.views.generic.list_detail import object_list
from django.contrib.auth.decorators import login_required
from cm.views import get_keys_from_dict
from cm.security import has_global_perm
from cm.exception import UnauthorizedException
from cm.cm_settings import SHOW_EMAILS_IN_ADMIN
from tagging.models import Tag
import sys
import re

USER_PAGINATION = 10

@has_global_perm('can_manage_workspace')
def user_list(request):    
    display_suspended_users = get_int(request.GET, 'display', 0)
    tag_selected = request.GET.get('tag_selected', 0)
    paginate_by = get_int(request.GET, 'paginate', USER_PAGINATION)
    order_by = get_among(request.GET, 'order', ('user__username',
                                              'user__email',
                                              '-user__username',
                                              '-user__email',
                                              'role__name',
                                              '-role__name',
                                              'user__date_joined',
                                              '-user__date_joined',
                                              ),
                          'user__username')
    
    UserRole.objects.create_userroles_text(None)
    
    if request.method == 'POST':
        # bulk apply
        if 'apply' in request.POST and not 'save' in request.POST:
            action = request.POST.get('action', None)
            user_profile_keys = get_keys_from_dict(request.POST, 'check-').keys()
            if action == 'disable':
                for user_profile_key in user_profile_keys:
                    profile = UserProfile.objects.get(key=user_profile_key)
                    if profile != request.user.get_profile():
                        profile.is_suspended = True
                        profile.save()             
                display_message(request, _(u"%(count)i User's access suspended") % {'count':len(user_profile_keys)})

            if action == 'enable':
                for user_profile_key in user_profile_keys:
                    profile = UserProfile.objects.get(key=user_profile_key)
                    profile.is_suspended = False
                    profile.save()             
                display_message(request, _(u"%(count)i User's access enabled") % {'count':len(user_profile_keys)})
            
            ROLE_RE = re.compile('role_(\d*)')
            match = ROLE_RE.match(action)
              
            if match:
                role_id = match.group(1)
                for user_profile_key in user_profile_keys:
                    user_role = UserRole.objects.get(user__userprofile__key=user_profile_key, text=None)
                    user_role.role_id = role_id
                    user_role.save()
                display_message(request, _(u"%(count)i user(s) role modified") % {'count':len(user_profile_keys)})
                
            return HttpResponseRedirect(reverse('user'))
        
        if 'save' in request.POST:
            user_profile_keys_roles = get_keys_from_dict(request.POST, 'user-role-')
            count = 0
            for user_profile_key in user_profile_keys_roles:
                role_id = user_profile_keys_roles[user_profile_key]
                if not user_profile_key:
                    user_role = UserRole.objects.get(user=None, text=None)
                else:                    
                    user_role = UserRole.objects.get(user__userprofile__key=user_profile_key, text=None)
                if (role_id != u'' or user_role.role_id != None) and role_id != unicode(user_role.role_id):
                    if role_id:
                        user_role.role_id = int(role_id)
                    else:
                        user_role.role_id = None
                    user_role.save()
                    count += 1
            display_message(request, _(u"%(count)i user(s) role modified") % {'count':count})                
            return HttpResponseRedirect(reverse('user'))
    try:
        anon_role = UserRole.objects.get(user=None, text=None).role
    except UserRole.DoesNotExist:
        anon_role = None
        
    context = {
               'anon_role' : anon_role,
               'all_roles' : Role.objects.all(),
               'anon_roles' : Role.objects.filter(anon=True),
               'display_suspended_users' : display_suspended_users,
               'tag_list' : Tag.objects.usage_for_model(UserProfile),
               'tag_selected': tag_selected,
               'SHOW_EMAILS_IN_ADMIN': SHOW_EMAILS_IN_ADMIN,
               }
    
    query = UserRole.objects.select_related().filter(text=None).filter(~Q(user=None)).order_by(order_by)
    if not display_suspended_users:
        query = query.exclude(Q(user__userprofile__is_suspended=True) & Q(user__is_active=True))
    else:
        # trick to include userprofile table anyway (to filter by tags)
        query = query.filter(Q(user__userprofile__is_suspended=True) | Q(user__userprofile__is_suspended=False))

    if tag_selected:     
        tag_ids = Tag.objects.filter(name=tag_selected)
        if tag_ids:   
            content_type_id = ContentType.objects.get_for_model(UserProfile).pk
            query = query.extra(where=['tagging_taggeditem.object_id = cm_userprofile.id', 
                                       'tagging_taggeditem.content_type_id = %i' %content_type_id,
                                       'tagging_taggeditem.tag_id = %i' %tag_ids[0].id],
                                tables=['tagging_taggeditem'],
                                )

    return object_list(request, query,
                       template_name='site/user_list.html',
                       paginate_by=paginate_by,
                       extra_context=context,
                       )

class UserForm(ModelForm):
    email = forms.EmailField(label=ugettext_lazy(u'E-mail address'), required=True)
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')
        

    def clean_email(self):
        """
        Validates that the supplied email is new to the site
        """
        if 'email' in self.cleaned_data:
            email = self.cleaned_data['email']
            try:
                if self.instance:
                    user = User.objects.exclude(email__iexact=self.instance.email).get(email__iexact=email)
                else:
                    user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return email
            raise forms.ValidationError(_(u'This user is already a member.'))
        
class MassUserForm(forms.Form):
    email = forms.CharField(label=ugettext_lazy(u'Emails'),
                           help_text=ugettext_lazy(u'Add multiples emails one per line (or separated by "," or ";")'),
                           widget=forms.Textarea,
                           required=True)
    
class UserRoleForm(ModelForm):
    class Meta:
        model = UserRole
        fields = ('role',)

    def __init__(self, data=None, files=None, auto_id='id_%s', prefix=None,
                 initial=None, error_class=ErrorList, label_suffix=':',
                 empty_permitted=False, instance=None):
        ModelForm.__init__(self, data, files, auto_id, prefix, initial, error_class, label_suffix, empty_permitted, instance)

        # override manually
        role_field = self.fields['role']
        #role_field.required = True
        role_field.label = _(u'Workspace level role')
        role_field.help_text = _(u'This role will apply to every text in the workspace. To share only a (few) texts with this user, you can leave this blank and delegate roles on texts once the user is created.')
        self.fields['role'] = role_field
        
class UserRoleTextForm(ModelForm):
    class Meta:
        model = UserRole
        fields = ('role',)

    def __init__(self, data=None, files=None, auto_id='id_%s', prefix=None,
                 initial=None, error_class=ErrorList, label_suffix=':',
                 empty_permitted=False, instance=None):
        ModelForm.__init__(self, data, files, auto_id, prefix, initial, error_class, label_suffix, empty_permitted, instance)

        # override manually
        role_field = self.fields['role']
        #role_field.required = True
        role_field.label = _(u'Text level role')
        role_field.help_text = _(u'This role will apply only to this text.')
        self.fields['role'] = role_field
        
class UserProfileForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ('allow_contact', 'preferred_language', 'is_suspended', 'tags')

class MyUserProfileForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ('allow_contact', 'preferred_language', 'tags')

class UserProfileAddForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ('preferred_language', 'tags')
        
class UserProfileRegisterForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ('preferred_language', )        

class UserAddForm(forms.Form):
    note = forms.CharField(label=ugettext_lazy(u'Note'),
                           help_text=ugettext_lazy(u'Optional text to add to invitation email'),
                           widget=forms.Textarea,
                           required=False)


SEPARATORS_RE = re.compile('[;,\n]+')

@has_global_perm('can_manage_workspace')
def user_mass_add(request, key=None):
    return user_add(request, key=key, mass=True)

@has_global_perm('can_manage_workspace')
def user_add(request, key=None, mass=False):
    text = get_text_by_keys_or_404(key) if key else None
    if request.method == 'POST':
        userform = UserForm(request.POST) if not mass else MassUserForm(request.POST)
        userroleform = UserRoleForm(request.POST)
        noteform = UserAddForm(request.POST)
        userprofileform = UserProfileAddForm(request.POST)
        localroleform = UserRoleTextForm(request.POST, prefix="local") if key else None
        if userform.is_valid() and userroleform.is_valid() and noteform.is_valid() and userprofileform.is_valid() and (not localroleform or localroleform.is_valid()):
            data = userform.cleaned_data
            data.update(userprofileform.cleaned_data)
            data.update(noteform.cleaned_data)
            emails = data['email']
            del data['email']
            email_created = set()
            for email in [s.strip() for s in SEPARATORS_RE.split(emails)]:
                if email and not User.objects.filter(email__iexact=email) and email not in email_created:
                    user = UserProfile.objects.create_inactive_user(email, True, **data)
                    userrole = UserRole.objects.create(user=user, role=userroleform.cleaned_data['role'], text=None)
                    if key:
                        localuserrole = UserRole.objects.create(user=user, role=localroleform.cleaned_data['role'], text=text)
                    email_created.add(email)
                    register_activity(request, "user_created", user=user)
            display_message(request, ungettext(u'%(nb_users)d user added', u'%(nb_users)d users added', len(email_created)) % {'nb_users': len(email_created)})
            if key:
                return HttpResponseRedirect(reverse('text-share', args=[text.key]))
            else:
                return HttpResponseRedirect(reverse('user'))
    else:
        userform = UserForm() if not mass else MassUserForm()
        userroleform = UserRoleForm()
        userprofileform = UserProfileAddForm({'preferred_language' : request.LANGUAGE_CODE})
        noteform = UserAddForm()
        localroleform = UserRoleTextForm(prefix="local") if key else None
    
    if key:
        template = 'site/user_mass_add_text.html' if mass else 'site/user_add_text.html'
    else:
        template = 'site/user_mass_add.html' if mass else 'site/user_add.html'

    return render_to_response(template, {'forms' : [userform, userprofileform , userroleform, noteform, localroleform],
                                                               'save_name' : ungettext(u'Add user', u'Add users', 2 if mass else 1),
                                                               'mass' : mass,
                                                               'text' : text,
                                                                }, context_instance=RequestContext(request))

class UserValidateForm(ModelForm):
    email = forms.EmailField(label=ugettext_lazy(u'Email'), required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name')

    def clean_username(self):
        """
        Validates that the supplied username is unique for the site.
        """
        if 'username' in self.cleaned_data:
            username = self.cleaned_data['username']
            try:
                user = User.objects.get(username__exact=username)
            except User.DoesNotExist:
                return username
            raise forms.ValidationError(_(u'This username is already in use. Please supply a different username.'))
        
from django.contrib.auth.forms import SetPasswordForm

def user_activate(request, key):
    try:
        profile = UserProfile.objects.get(adminkey=key)
        user = profile.user
        if not user.is_active:
            if request.method == 'POST':
                userform = UserValidateForm(request.POST, instance=user)
                pwform = SetPasswordForm(profile.user, request.POST)
                if userform.is_valid() and pwform.is_valid():
                    userform.save()
                    pwform.save()
                    user.is_active = True
                    user.save()
                    # login
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                    django_login(request, user)
                    register_activity(request, "user_activated", user=user)
                    display_message(request, _(u"Your account has been activated. You're now logged-in."))
                    
                    return HttpResponseRedirect(reverse('index'))
            else:
                user.username = ''
                userform = UserValidateForm(instance=user)
                pwform = SetPasswordForm(user)
            
            return render_to_response('site/activate.html', {
                                                                  'forms' : [userform, pwform],
                                                                  'title': _(u'Activate your account'),
                                                                  'save_name' : _(u'activate account'),
                                                                  }, context_instance=RequestContext(request))
        else:
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            django_login(request, user)
            display_message(request, _(u"Your account has been activated. You're now logged-in."))
            
            return HttpResponseRedirect(reverse('index'))
                        
    except UserProfile.DoesNotExist:
        raise UnauthorizedException('No profile')

#@has_global_perm('can_manage_workspace')
#def user_delete(request, key):
#    try:
#        if request.method == 'POST':
#            profile = UserProfile.objects.get(key=key)
#            profile.delete()
#            display_message(request, "User %s has been deleted." %(profile.simple_print()))
#            return HttpResponse('') # no redirect because this is called by js
#    except UserProfile.DoesNotExist:
#        raise UnauthorizedException('No profile')

@has_global_perm('can_manage_workspace')
def user_suspend(request, key):
    if request.method == 'POST':
        profile = get_object_or_404(UserProfile, key=key)
        profile.is_suspended = True
        profile.save()
        if profile.user.is_active:            
            display_message(request, _(u"User's access %(prof)s has been suspended.") % {'prof':profile.simple_print()})
            register_activity(request, "user_suspended", user=profile.user)
        else:
            # make use active but disabled
            profile.user.is_active = True 
            profile.user.save()
            display_message(request, _(u"User's access %(prof)s has been refused.") % {'prof':profile.simple_print()})
            register_activity(request, "user_refused", user=profile.user)                
        return HttpResponse('') # no redirect because this is called by js
    raise UnauthorizedException('')
    
@has_global_perm('can_manage_workspace')
def user_enable(request, key):
    if request.method == 'POST':
        profile = get_object_or_404(UserProfile, key=key)
        profile.is_suspended = False
        profile.save()
        if profile.user.is_active:
            display_message(request, _(u"User's access %(prof)s has been restored.") % {'prof':profile.simple_print()})
            register_activity(request, "user_enabled", user=profile.user)
        else: # new member approval
            profile.send_activation_email()
            display_message(request, _(u"User's access %(prof)s has been approved.") % {'prof':profile.simple_print()})
            register_activity(request, "user_approved", user=profile.user)                
        return HttpResponse('') # no redirect because this is called by js
    raise UnauthorizedException('')
    
def user_send_invitation(request, key):
    if request.method == 'POST':
        profile = get_object_or_404(UserProfile, key=key)
        profile.send_invitation_email()
        
        display_message(request, _(u"A new invitation has been sent to user %(prof)s.") % {'prof':profile.simple_print()})
        return HttpResponse('') # no redirect because this is called by js
    raise UnauthorizedException('')

from django.contrib.auth.forms import PasswordChangeForm

@login_required()
def profile(request):
    user = request.user
    profile = user.get_profile()
    if request.method == 'POST':
        userform = UserForm(request.POST, instance=user)
        userprofileform = MyUserProfileForm(request.POST, instance=profile)
        
        if userform.is_valid() and userprofileform.is_valid():
            userform.save()
            userprofileform.save()
            display_message(request, _(u'Profile updated'))
            return HttpResponseRedirect(reverse('index'))
    else:
        userform = UserForm(instance=user)
        userprofileform = MyUserProfileForm(instance=profile)
    
    return render_to_response('site/profile.html', {'forms' : [userform, userprofileform],
                                                               'title' : 'Profile',
                                                                }, context_instance=RequestContext(request))

@login_required()
def profile_pw(request):
    user = request.user
    profile = user.get_profile()
    if request.method == 'POST':
        pwform = PasswordChangeForm(profile.user, data = request.POST)
        if pwform.is_valid():
            pwform.save()
            display_message(request, _(u'Password changed'))
            return HttpResponseRedirect(reverse('profile'))
    else:
        pwform = PasswordChangeForm(profile.user)
    return render_to_response('site/profile_pw.html', {'forms' : [pwform],
                                                               'title' : 'Password',
                                                                }, context_instance=RequestContext(request))

class AnonUserRoleForm(UserRoleForm):
    def __init__(self, data=None, files=None, auto_id='id_%s', prefix=None,
                 initial=None, error_class=ErrorList, label_suffix=':',
                 empty_permitted=False, instance=None):
        ModelForm.__init__(self, data, files, auto_id, prefix, initial, error_class, label_suffix, empty_permitted, instance)

        # override manually
        role_field = self.fields['role']
        role_field.required = False
        role_field.choices = [(u'', u'---------')] + [(r.id, str(r)) for r in Role.objects.filter(anon=True)] # limit anon choices
        
        self.fields['role'] = role_field

@has_global_perm('can_manage_workspace')    
def user_anon_edit(request):
    userrole, created = UserRole.objects.get_or_create(user=None, text=None)
    if request.method == 'POST':
        userroleform = AnonUserRoleForm(request.POST, instance=userrole)
        if userroleform.is_valid():
            userroleform.save()
            display_message(request, _(u'Anonymous user role modified.'))
            return HttpResponseRedirect(reverse('user'))
    else:
        userroleform = AnonUserRoleForm(instance=userrole)
    
    return render_to_response('site/user_edit.html', {'form' : userroleform,
                                                               'title' : 'Edit anonymous user',
                                                                }, context_instance=RequestContext(request))

@has_global_perm('can_manage_workspace')    
def user_edit(request, key):
    profile = get_object_or_404(UserProfile, key=key)
    user = profile.user
    userrole = profile.global_userrole()
    if request.method == 'POST':
        userform = UserForm(request.POST, instance=user)
        userprofileform = UserProfileForm(request.POST, instance=profile)
        userroleform = UserRoleForm(request.POST, instance=userrole)
        if userform.is_valid() and userroleform.is_valid() and userprofileform.is_valid():
            userform.save()
            userroleform.save()
            userprofileform.save()
            display_message(request, _(u'User modified'))
            return HttpResponseRedirect(reverse('user'))
    else:
        userform = UserForm(instance=user)
        userprofileform = UserProfileForm(instance=profile)
        userroleform = UserRoleForm(instance=userrole)
    
    return render_to_response('site/user_edit.html', {'forms' : [userform , userprofileform, userroleform],
                                                               'title' : 'Edit user',
                                                               'user_edit' : user,
                                                                }, context_instance=RequestContext(request))

# user contact form (for logged-in users only

class UserContactForm(forms.Form):
    subject = forms.CharField(label=ugettext_lazy(u'Subject'),
                           help_text=ugettext_lazy(u'Subject of the email'),
                           required=True)

    body = forms.CharField(label=ugettext_lazy(u'Body'),
                           help_text=ugettext_lazy(u'Body of the email'),
                           widget=forms.Textarea,
                           required=True)

@login_required
def user_contact(request, key):
    recipient_profile = get_object_or_404(UserProfile, key=key)

    if request.method == 'POST':
        contact_form = UserContactForm(request.POST)
        if contact_form.is_valid():
            data = contact_form.cleaned_data
            message = render_to_string('email/user_contact_email.txt',
                                       { 
                                         'body' : data['body'],
                                         'CONF': ApplicationConfiguration
                                          })
        
            send_mail(data['subject'], message, request.user.email, [recipient_profile.user.email])
            
            display_message(request, _(u'Email sent.'))
            return HttpResponseRedirect(reverse('index'))
    else:
        contact_form = UserContactForm()
    
    return render_to_response('site/user_contact.html', {'form' : contact_form,
                                                         'save_name' : 'send',
                                                         'recipient_profile' : recipient_profile,
                                                                }, context_instance=RequestContext(request))


from django.contrib.auth.forms import AuthenticationForm

def cm_login(request, user):
    # make sure user has a profile
    try:
        user.get_profile()
    except UserProfile.DoesNotExist :
        UserProfile.objects.create(user=user)
        
    if user.get_profile().is_suspended:
        display_message(request, _(u"This account is suspended, contact the workspace administrator."))
        return HttpResponseRedirect(reverse('index'))
                
    user.backend = 'django.contrib.auth.backends.ModelBackend'
    django_login(request, user)
    
    display_message(request, _(u"You're logged in!"))
    next = request.POST.get('next', None)
    q = request.POST.get('q', None)
    if next and next.startswith('/'):
        if q:
            return HttpResponseRedirect(next + '?' + q)
        else:
            return HttpResponseRedirect(next)
    else:
        return HttpResponseRedirect(reverse('index'))

def login(request): 
    request.session.set_test_cookie()
    
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            user = form.get_user()
            
            return cm_login(request, user)            
    else:    
        form = AuthenticationForm()        
    
    return render_to_response('site/login.html', {'form':form}, context_instance=RequestContext(request))

from django.contrib.auth import logout as django_logout

def logout(request):
    django_logout(request)
    display_message(request, _(u"You've been logged out."))
    return HttpResponseRedirect(reverse('index'))

def register(request):
    if request.method == 'POST':
        userform = UserForm(request.POST)
        userprofileaddform = UserProfileRegisterForm(request.POST)
        
        if userform.is_valid() and userprofileaddform.is_valid():
            data = userform.cleaned_data
            data.update(userprofileaddform.cleaned_data)
            user = UserProfile.objects.create_inactive_user(userform.cleaned_data['email'], False, **userprofileaddform.cleaned_data)
            profile = user.get_profile()
            if ApplicationConfiguration.get_key('workspace_registration_moderation', False): # need moderation
                profile.is_suspended = True
                profile.save()
                display_message(request, _(u"You've been registered, you will receive a confirmation mail once a moderator has approved your membership."))                
            else:
                profile.send_activation_email()
                display_message(request, _(u"You've been registered, please check your email for the confirm message."))                
            return HttpResponseRedirect(reverse('index'))
    else:    
        userform = UserForm()
        userprofileaddform = UserProfileRegisterForm({'preferred_language' : request.LANGUAGE_CODE})
    
    return render_to_response('site/register.html', {'forms':[userform, userprofileaddform]}, context_instance=RequestContext(request))
