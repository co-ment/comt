from cm.cm_settings import VALID_EMAIL_FOR_PUBLISH, SITE_NAME
from cm.converters import convert_from_mimetype
from cm.converters.pandoc_converters import pandoc_convert
from cm.models import Text, TextVersion, Attachment
from cm.utils.files import remove_extension
from cm.utils.mail import EmailMessage
from cm.views import get_text_by_keys_or_404
from django import forms
from cm.message import display_message
from django.conf import settings
from django.core.urlresolvers import reverse
from django.forms import ModelForm
from django.forms.util import ErrorList
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils.translation import ugettext as _, ugettext_lazy
from mimetypes import guess_type
from cm.activity import register_activity
from cm.security import has_global_perm
import os

class CreateTextUploadForm(ModelForm):
    file = forms.FileField(required=False,
                           label=ugettext_lazy("Upload file (optional)"),
                           help_text=ugettext_lazy("Upload a file from your computer instead of using the direct input above"),)

    title = forms.CharField(required=False,
                                  label=ugettext_lazy("Title"))
    class Meta:
        model = TextVersion
        fields = ('title', 'format', 'tags') #, 'note'

    def clean(self):
        cleaned_data = self.cleaned_data
        if not cleaned_data.get('file', None) :
            msg = _("You should specify a file to upload.")
            self._errors["file"] = ErrorList([msg])
              
        return cleaned_data

class CreateTextContentForm(ModelForm):
    title = forms.CharField(required=True,
                            label=ugettext_lazy("Title"),
                            help_text=ugettext_lazy("The title of your text"),
                            widget=forms.TextInput)
    
    class Meta:
        model = TextVersion
        fields = ('title', 'format', 'content','tags') #, 'note'

@has_global_perm('can_create_text')
def text_create_content(request):
    return _text_create_content(request, CreateTextContentForm)
    
def redirect_post_create(text) :
    return HttpResponseRedirect(reverse('text-view', args=[text.key]))

def _text_create_content(request, createForm):
#    CreateForm = CreateTextContentForm
    document = ""
        
    if request.method == 'POST':
        form = createForm(request.POST)
        if form.is_valid():
                text = create_text(request.user, form.cleaned_data)
                
                register_activity(request, "text_created", text)
                
                display_message(request, _(u'Text "%(text_title)s" has been created' %{"text_title":text.get_latest_version().title}))
                return redirect_post_create(text)
    else:
        form = createForm()
        
    return render_to_response('site/text_create_content.html', {'document':document, 'form' : form}, context_instance=RequestContext(request))

def _text_create_upload(request, createForm):
    
#    CreateForm = CreateTextUploadForm if request.user.is_authenticated() else CreateTextUploadFormAnon

    if request.method == 'POST':
        form = createForm(request.POST, request.FILES)
        if form.is_valid():
            # should convert?
            if form.cleaned_data['file']:
                try:
                    uploaded_file = form.cleaned_data['file']
                    content, attachs = convert_from_mimetype(uploaded_file.temporary_file_path(),
                                                    uploaded_file.content_type,
                                                    format=form.cleaned_data['format'],
                                                    )
                    form.cleaned_data['content'] = content
                    form.cleaned_data['attachs'] = attachs
                    
                    # set title if not present
                    if not form.cleaned_data.get('title', None):
                        form.cleaned_data['title'] = remove_extension(uploaded_file.name)
                        
                    del form.cleaned_data['file']
                except:
                    raise
                
            text = create_text(request.user, form.cleaned_data)
            
            register_activity(request, "text_created", text)
            
            display_message(request, _(u'Text "%(text_title)s" has been created' %{"text_title":text.get_latest_version().title}))
            return redirect_post_create(text)

    else:
        form = createForm()
        
    return render_to_response('site/text_create_upload.html', {'form' : form}, context_instance=RequestContext(request))

@has_global_perm('can_create_text')
def text_create_upload(request):
    return _text_create_upload(request, CreateTextUploadForm)

def create_text(user, data):
    text_content = data['content']
    text = Text.objects.create_text(title=data['title'],
                                    format=data['format'],
                                    content=text_content,
                                    note=data.get('note', None),
                                    name=data.get('name', None),
                                    email=data.get('email', None),
                                    tags=data.get('tags', None),
                                    user=user
                                    )
    text.update_denorm_fields()
    text_version = text.get_latest_version()

    for attach_file in data.get('attachs',  []):
        attach_data = file(attach_file, 'rb').read()
        filename = os.path.basename(attach_file)
        attachment = Attachment.objects.create_attachment(filename=filename, data=attach_data, text_version=text_version)
        attach_url = reverse('text-attach', args=[text.key, attachment.key])
        text_content = text_content.replace(filename, attach_url)
            
    # save updated (attach links) text content
    text_version.content = text_content
    text_version.save()
    return text