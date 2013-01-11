from django.db.models import Q
from django.contrib.auth.decorators import login_required
from cm.security import get_viewable_comments, get_viewable_activities
from cm.message import display_message
from cm.models import Comment, Activity, UserProfile, Notification
from cm.models_utils import Email
from cm.security import has_global_perm
from cm.security import get_texts_with_perm, has_perm
from cm.utils import get_among, get_int
from cm.utils.mail import send_mail
from cm.views.user import cm_login
from django import forms
from django.conf import settings
from django.contrib.auth.forms import AuthenticationForm
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils.translation import get_language, ugettext as _, ugettext_lazy
from django.views.generic.list_detail import object_list
from django.contrib.auth.models import User
from cm.models import Text, TextVersion, Attachment, Comment, Configuration, Activity

ACTIVITY_PAGINATION = 10
RECENT_TEXT_NB = 5
RECENT_COMMENT_NB = RECENT_TEXT_NB

MODERATE_NB = 5


def dashboard(request):
    request.session.set_test_cookie()
    if request.user.is_authenticated():
        act_view = {
                    'view_texts' : get_int(request.GET, 'view_texts', 1),
                    'view_comments' : get_int(request.GET, 'view_comments', 1),
                    'view_users' : get_int(request.GET, 'view_users', 1),
                    }

        paginate_by = get_int(request.GET, 'paginate', ACTIVITY_PAGINATION)

        # texts with can_view_unapproved_comment perms
        moderator_texts = get_texts_with_perm(request, 'can_view_unapproved_comment')
        viewer_texts = get_texts_with_perm(request, 'can_view_approved_comment')
        all_texts_ids = [t.id for t in moderator_texts] + [t.id for t in viewer_texts]

        span = get_among(request.GET, 'span', ('day', 'month', 'week',), 'week')
        template_dict = {
                         'span' : span,
                         'last_texts' : get_texts_with_perm(request, 'can_view_text').order_by('-modified')[:RECENT_TEXT_NB],
                         'last_comments' : Comment.objects.filter(text_version__text__in=all_texts_ids).order_by('-created')[:RECENT_COMMENT_NB], # TODO: useful?
                         #'last_users' : User.objects.all().order_by('-date_joined')[:5],
                         }
        template_dict.update(act_view)

        #selected_activities = []
        #[selected_activities.extend(Activity.VIEWABLE_ACTIVITIES[k]) for k in act_view.keys() if act_view[k]]
        activities = get_viewable_activities(request, act_view)

        if not has_perm(request, 'can_manage_workspace'):
            template_dict['to_mod_profiles'] = []
        else:
            template_dict['to_mod_profiles'] = UserProfile.objects.filter(user__is_active=False).filter(is_suspended=True).order_by('-user__date_joined')[:MODERATE_NB]

        template_dict['to_mod_comments'] = Comment.objects.filter(state='pending').filter(text_version__text__in=moderator_texts).order_by('-modified')[:MODERATE_NB - len(template_dict['to_mod_profiles'])]

        activities = activities.order_by('-created')
        return object_list(request, activities,
                           template_name='site/dashboard.html',
                           paginate_by=paginate_by,
                           extra_context=template_dict,
                           )

    else:
        if request.method == 'POST':
            form = AuthenticationForm(request, request.POST)
            if form.is_valid():
                user = form.get_user()
                user.backend = 'django.contrib.auth.backends.ModelBackend'
                cm_login(request, user)
                display_message(request, _(u"You're logged in!"))
                return HttpResponseRedirect(reverse('index'))
        else:
            form = AuthenticationForm()


        public_texts = get_texts_with_perm(request, 'can_view_text').order_by('-modified')

        template_dict = {
                         'form' : form,
                         'public_texts' : public_texts,
                         }
        return render_to_response('site/non_authenticated_index.html', template_dict, context_instance=RequestContext(request))


class HeaderContactForm(forms.Form):
    name = forms.CharField(
                           max_length=100,
                           label=ugettext_lazy(u"Your name"),
                           )
    email = forms.EmailField(label=ugettext_lazy(u"Your email address"),)

class BodyContactForm(forms.Form):
    title = forms.CharField(label=ugettext_lazy(u"Subject of the message"), max_length=100)
    body = forms.CharField(label=ugettext_lazy(u"Body of the message"), widget=forms.Textarea)
    copy = forms.BooleanField(
                              label=ugettext_lazy(u"Send me a copy of the email"),
                              #help_text=ugettext_lazy(u"also send me a copy of the email"),
                              required=False)

class ContactForm(HeaderContactForm, BodyContactForm):
    pass

def contact(request):
    if request.method == 'POST':
        form = BodyContactForm(request.POST) if request.user.is_authenticated() else ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data.get('name', None) or request.user.username
            email = form.cleaned_data.get('email', None) or request.user.email
            message = render_to_string('email/site_contact_email.txt',
                                       {
                                         'body' : form.cleaned_data['body'],
                                         'name' : name,
                                         'email' : email,
                                         'referer' : request.META.get('HTTP_REFERER', None),
                                          }, context_instance=RequestContext(request))
            subject = form.cleaned_data['title']
            # Email subject *must not* contain newlines
            subject = ''.join(subject.splitlines())
            dest = settings.CONTACT_DEST
            send_mail(subject, message, email, [dest])
            if form.cleaned_data['copy']:
                my_subject = _(u"Copy of message:") + u" " + subject
                send_mail(my_subject, message, email, [email])
            display_message(request, _(u"Email sent. We will get back to you as quickly as possible."))
            redirect_url = reverse('index')
            return HttpResponseRedirect(redirect_url)
    else:
        form = BodyContactForm() if request.user.is_authenticated() else ContactForm()
    return render_to_response('site/contact.html', {'form': form}, context_instance=RequestContext(request))

def global_feed(request):
    pass

from cm.role_models import role_models_choices
from django.utils.safestring import mark_safe

class BaseSettingsForm(forms.Form):
    def __init__(self, data=None, initial=None):
        forms.Form.__init__(self, data=data, initial=initial)
        for field in self.fields:
            if field in self.conf_fields:
                self.fields[field].initial = Configuration.objects.get_key(field)

                self.fields[field].initial = Configuration.objects.get_key(field)

    def save(self):
        for field in self.fields:
            if field in self.conf_fields:
                val = self.cleaned_data[field]
                Configuration.objects.set_key(field, val)

class SettingsForm(BaseSettingsForm):
    workspace_name = forms.CharField(label=ugettext_lazy("Workspace name"),
                                     widget=forms.TextInput,
                                     required=False,
                                     )

    workspace_tagline = forms.CharField(label=ugettext_lazy("Workspace tagline"),
                                        widget=forms.TextInput,
                                        required=False,
                                        )

    workspace_registration = forms.BooleanField(label=ugettext_lazy("Workspace registration"),
                                                help_text=ugettext_lazy("Can users register themselves into the workspace? (if not, only invitations by managers can create new users)"),
                                                required=False,
                                                )

    workspace_registration_moderation = forms.BooleanField(label=ugettext_lazy("Workspace registration moderation"),
                                                           help_text=ugettext_lazy("Should new users be moderated (registration will require manager's approval)?"),
                                                           required=False,
                                                           )

    workspace_role_model = forms.ChoiceField(label=ugettext_lazy("Role model"),
                                             help_text=(ugettext_lazy("Change the roles available in the workspace")),
                                             choices=role_models_choices,
                                             required=False,
                                             )


    # fields to save in the Configuration objects
    conf_fields = ['workspace_name', 'workspace_tagline', 'workspace_registration', 'workspace_registration_moderation', 'workspace_role_model']


@has_global_perm('can_manage_workspace')
def settingss(request):
    if request.method == 'POST':
        if 'delete_logo' in request.POST:
            Configuration.objects.del_key('workspace_logo_file_key')
            display_message(request, _(u'Settings saved'))
            return HttpResponseRedirect(reverse('settings'))
        else:
            form = SettingsForm(data=request.POST)
            if form.is_valid() :
                form.save()
                display_message(request, _(u'Settings saved'))
                return HttpResponseRedirect(reverse('settings'))
    else:
        form = SettingsForm()

    return render_to_response('site/settings.html', {'form' : form, 'help_links' : {'workspace_role_model':'role_model'}}, context_instance=RequestContext(request))

class SettingsDesignForm(BaseSettingsForm):
    workspace_logo_file  = forms.FileField(label=ugettext_lazy("Workspace logo"),required=False)

    custom_css = forms.CharField(label=ugettext_lazy("Custom CSS rules"),
                                     help_text=mark_safe(ugettext_lazy("Add stylesheet rules in CSS format (do not include <code>&lt;style&gt;</code> HTML tags). Warning: this code will be added to all content, make sure you know what you're doing before adding something here.")),
                                     widget=forms.Textarea,
                                     required=False,
                                     )

    custom_font = forms.CharField(label=ugettext_lazy("Custom font"),
                                        widget=forms.TextInput,
                                        help_text=mark_safe(ugettext_lazy("Custom alternative font family to 'modern', 'classic' and 'code' that visitors can chose for the body of co-ment texts. Enter a coma separated list of font families. Font family names including space characters should be enclosed in double quotes. Eg. ") + '<code>"Times New Roman", Times, serif</code>.'),
                                        required=False,
                                        )

    custom_titles_font = forms.CharField(label=ugettext_lazy("Custom font for titles"),
                                        widget=forms.TextInput,
                                        help_text=mark_safe(ugettext_lazy("Custom alternative font family to 'modern', 'classic' and 'code' that visitors can chose for titles (h1 to h6) of co-ment texts. Enter a coma separated list of font families. Font family names including space characters should be enclosed in double quotes. Eg. ") + '<code>"Gill Sans", Helvetica, sans-serif</code>.'),
                                        required=False,
                                        )
    conf_fields = ['custom_css', 'custom_font', 'custom_titles_font']

    def save_file(self, logo_file):
        attach = Attachment.objects.create_attachment(filename='wp_logo', data=logo_file.read(), text_version=None)
        Configuration.objects.set_key('workspace_logo_file_key', attach.key)


@has_global_perm('can_manage_workspace')
def settings_design(request):
    if request.method == 'POST':
        if 'delete_logo' in request.POST:
            Configuration.objects.del_key('workspace_logo_file_key')
            display_message(request, _(u'Settings saved'))
            return HttpResponseRedirect(reverse('settings-design'))
        else:
            form = SettingsDesignForm(data=request.POST)
            if form.is_valid() :
                form.save()
                logo_file = request.FILES.get('workspace_logo_file',None)
                if logo_file:
                    form.save_file(logo_file)
                display_message(request, _(u'Settings saved'))
                return HttpResponseRedirect(reverse('settings-design'))
    else:
      from cm.models import ApplicationConfiguration
      custom_css = ApplicationConfiguration.get_key('custom_css')
      if custom_css:
        default_css = custom_css
      else:
        default_css = '''
.voted {
  color: #008000;
}

.rejected, .fallen, .withdrawn {
  color: #ff0000;
}

div.frame {
  border: 1px solid #000;
  padding: 5px;
}

div.frame .title {
  font-weight: bold;
  text-align: center;
}'''
      form = SettingsDesignForm(initial={'custom_css': default_css})

    return render_to_response('site/settings_design.html', {'form' : form}, context_instance=RequestContext(request))


def password_reset_done(request):
    display_message(request, _(u'A link to reset your password has been sent to the profile email. Please check your email.'))
    return HttpResponseRedirect(reverse('index'))

def password_reset_complete(request):
    display_message(request, _(u'Password changed'))
    return HttpResponseRedirect(reverse('index'))

def help(request):
    return render_to_response('site/help.html', context_instance=RequestContext(request))

