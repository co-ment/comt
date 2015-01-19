import os
import re
from base64 import b64decode

from django import forms
from django.conf import settings
from django.core.urlresolvers import reverse
from django.forms import ModelForm
from django.forms.util import ErrorList
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils.translation import ugettext as _, ugettext_lazy as _l
from django.db import connection, transaction
from BeautifulSoup import BeautifulStoneSoup

from cm.converters import convert_from_mimetype
from cm.models import Text, TextVersion, Comment, Attachment
from cm.utils.files import remove_extension
from cm.message import display_message
from cm.activity import register_activity
from cm.security import has_global_perm


class CreateTextUploadForm(ModelForm):
    file = forms.FileField(required=True,
                           label=_l("Upload file"),
                           help_text=_l("Upload a file from your computer instead of using the direct input above"),)

    title = forms.CharField(required=False, label=_l("Title"))

    class Meta:
        model = TextVersion
        fields = ('title', 'format', 'tags') #, 'note'

    def clean(self):
        cleaned_data = self.cleaned_data
        if not cleaned_data.get('file', None) :
            msg = _("You should specify a file to upload.")
            self._errors["file"] = ErrorList([msg])
              
        return cleaned_data


class CreateTextImportForm(ModelForm):
    file = forms.FileField(required=True, label=_l("Upload XML file"),
                           help_text=_l("Upload a previously exported XML file from your computer"),)

    class Meta:
        model = TextVersion
        fields = ()

    def clean(self):
        cleaned_data = self.cleaned_data
        if not cleaned_data.get('file', None) :
          msg = _("You should specify a file to upload.")
          self._errors["file"] = ErrorList([msg])
          return cleaned_data

        uploaded_file = self.cleaned_data['file']
        if (uploaded_file.content_type != 'text/xml'
            and (uploaded_file.content_type != 'application/octet-stream'
                 or cleaned_data.get('mime', 'application/xml') != 'application/xml')):
          msg = _("The imported file should be an XML file generated by co-ment when exporting a text and comments.")
          self._errors["file"] = ErrorList([msg])
          return cleaned_data

        soup = BeautifulStoneSoup(uploaded_file)
        if not soup.co_ment_text:
            msg = _("No co_ment_text node found in XML.")
            self._errors["file"] = ErrorList([msg])
            return cleaned_data
        for mandatory_child in ['title', 'created', 'modified', 'name', 'email',
                                'format', 'content']:
            if not getattr(soup.co_ment_text, mandatory_child):
                msg = _('No %(tag)s node found in XML.'
                        % {"tag": mandatory_child})
                self._errors["file"] = ErrorList([msg])
                return cleaned_data
        cleaned_data['soup'] = soup
        return cleaned_data


class CreateTextContentForm(ModelForm):
    title = forms.CharField(required=True, label=_l("Title"),
                            help_text=_l("The title of your text"),
                            widget=forms.TextInput)
    
    class Meta:
        model = TextVersion
        fields = ('title', 'format', 'content','tags') #, 'note'


@has_global_perm('can_create_text')
def text_create_content(request):
    text, rep = _text_create_content(request, CreateTextContentForm)
    return rep
    

def redirect_post_create(text) :
    return HttpResponseRedirect(reverse('text-view', args=[text.key]))


def _text_create_content(request, createForm):
    document = ""
        
    if request.method == 'POST':
        form = createForm(request.POST)
        if form.is_valid():
                text = create_text(request.user, form.cleaned_data)
                
                register_activity(request, "text_created", text)
                display_message(request,
                                _(u'Text "%(text_title)s" has been created')
                                %{"text_title":text.get_latest_version().title})
                return text, redirect_post_create(text)
    else:
        form = createForm()
        
    return None, render_to_response('site/text_create_content.html',
                                    {'document':document, 'form' : form},
                                    context_instance=RequestContext(request))


def _text_create_upload(request, createForm):
    
    if request.method == 'POST':
        form = createForm(request.POST, request.FILES)
        if form.is_valid():
            # should convert?
            if form.cleaned_data['file']:
                try:
                    uploaded_file = form.cleaned_data['file']
                    content, attachs = convert_from_mimetype(
                        uploaded_file.temporary_file_path(),
                        uploaded_file.content_type,
                        format=form.cleaned_data['format'])
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
            
            display_message(request,
                            _(u'Text "%(text_title)s" has been created')
                            % {"text_title": text.get_latest_version().title})
            return text, redirect_post_create(text)

    else:
        form = createForm()
        
    return None, render_to_response('site/text_create_upload.html',
                                    {'form' : form},
                                    context_instance=RequestContext(request))


def _text_create_import(request, createForm):
  if request.method == 'POST':
    form = createForm(request.POST, request.FILES)
    if form.is_valid():
      soup = form.cleaned_data['soup']
      if not soup.co_ment_text:
        raise Exception('Bad Soup')

      # Process attachments first to create new keys.
      attachments_keys_map = {}
      if soup.co_ment_text.attachments:
        for imported_attachement in soup.co_ment_text.attachments.findAll('attachment'):
          # Creates attachment object.
          filename = 'imported_attachment'
          attachment = Attachment.objects.create_attachment(filename=filename, data=b64decode(imported_attachement.data.renderContents()), text_version=None)
          # Stores key mapping.
          attachments_keys_map[imported_attachement.key.renderContents()] = attachment.key

      # Process text.
      form.cleaned_data['title'] = soup.co_ment_text.title.renderContents()
      form.cleaned_data['format'] = soup.co_ment_text.format.renderContents()
      form.cleaned_data['content'] = re.sub(r'^<!\[CDATA\[|\]\]>$', '', soup.co_ment_text.content.renderContents())
      form.cleaned_data['name'] = soup.co_ment_text.find('name').renderContents()
      form.cleaned_data['email'] = soup.co_ment_text.email.renderContents()
      if soup.co_ment_text.tags:
        form.cleaned_data['tags'] = soup.co_ment_text.tags.renderContents()

      # Replaces attachements keys in content.
      for old_key in attachments_keys_map.keys():
        form.cleaned_data['content'] = re.sub(old_key, attachments_keys_map[old_key], form.cleaned_data['content'])
      form.cleaned_data['content'] = re.sub(r'src="/attach/', 'src="' + settings.SITE_URL + '/attach/', form.cleaned_data['content'])

      # Creates text.
      text = create_text(request.user, form.cleaned_data)

      # Brute updates of dates (cannot do it through django models since
      # fields are set with auto_now or auto_now_add).
      created = soup.co_ment_text.created.renderContents()
      modified = soup.co_ment_text.modified.renderContents()
      cursor = connection.cursor()
      cursor.execute("UPDATE cm_textversion SET created = %s, modified = %s WHERE id = %s",
                     [created, modified, text.last_text_version_id])
      cursor.execute("UPDATE cm_text SET created = %s, modified = %s WHERE id = %s",
                     [created, modified, text.id])
      transaction.commit_unless_managed()

      # Process comments.
      if soup.co_ment_text.comments:
        comments_ids_map = {}
        all_comments = soup.co_ment_text.comments.findAll('comment')
        # Sort by id in order to have parent processed before reply_to
        for imported_comment in sorted(all_comments, key=lambda cid: cid.id.renderContents()):
          # Creates each comment.
          comment = Comment.objects.create(
              text_version=text.get_latest_version(),
              title=imported_comment.title.renderContents(),
              state=imported_comment.state.renderContents(),
              name=imported_comment.find('name').renderContents(),
              email=imported_comment.email.renderContents(),
              format=imported_comment.format.renderContents(),
              content=re.sub(r'^<!\[CDATA\[|\]\]>$', '', imported_comment.content.renderContents()),
              content_html=re.sub(r'^<!\[CDATA\[|\]\]>$', '', imported_comment.content_html.renderContents()),
              )

          # Stores id for reply_to mapping.
          comments_ids_map[imported_comment.id.renderContents()] = comment

          # Process boolean and potentially null integer/foreign key attributes.
          save = False
          if imported_comment.deleted.renderContents() == 'True':
            comment.deleted = True
            save = True
          if imported_comment.start_wrapper.renderContents() != 'None':
            comment.start_wrapper = imported_comment.start_wrapper.renderContents()
            save = True
          if imported_comment.end_wrapper.renderContents() != 'None':
            comment.end_wrapper = imported_comment.end_wrapper.renderContents()
            save = True
          if imported_comment.start_offset.renderContents() != 'None':
            comment.start_offset = imported_comment.start_offset.renderContents()
            save = True
          if imported_comment.end_offset.renderContents() != 'None':
            comment.end_offset = imported_comment.end_offset.renderContents()
            save = True
          if imported_comment.find('parent'):
            comment.reply_to = comments_ids_map.get(imported_comment.find('parent').renderContents())
            save = True
          if save:
            comment.save()

          # Brute updates of dates (cannot do it through django models since
          # fields are set with auto_now or auto_now_add).
          created=imported_comment.created.renderContents(),
          modified=imported_comment.modified.renderContents(),
          cursor.execute("UPDATE cm_comment SET created = %s, modified = %s WHERE id = %s",
                         [created, modified, comment.id])
          transaction.commit_unless_managed()

      # Logs on activity.
      register_activity(request, "text_imported", text)
      display_message(request, _(u'Text "%(text_title)s" has been imported')
                      %{"text_title":text.get_latest_version().title})
      return text, HttpResponseRedirect(reverse('text-view', args=[text.key]))
  else:
    form = createForm()

  return None, render_to_response('site/text_create_import.html',
                                  {'form' : form},
                                  context_instance=RequestContext(request))


@has_global_perm('can_create_text')
def text_create_upload(request):
    text, rep = _text_create_upload(request, CreateTextUploadForm)
    return rep


def text_create_import(request):
    text, rep = _text_create_import(request, CreateTextImportForm)
    return rep


def create_text(user, data):
    text = Text.objects.create_text(title=data['title'],
                                    format=data['format'],
                                    content=data['content'],
                                    note=data.get('note', None),
                                    name=data.get('name', None),
                                    email=data.get('email', None),
                                    tags=data.get('tags', None),
                                    user=user)
    text.update_denorm_fields()
    text_version = text.get_latest_version()
    text_content = text_version.content

    for attach_file in data.get('attachs',  []):
        attach_data = file(attach_file, 'rb').read()
        filename = os.path.basename(attach_file)
        attachment = Attachment.objects.create_attachment(filename=filename,
                                                          data=attach_data,
                                                          text_version=text_version)
        attach_url = reverse('text-attach', args=[text.key, attachment.key])
        text_content = text_content.replace(filename, attach_url)
            
    # save updated (attach links) text content
    text_version.content = text_content
    text_version.save()
    return text
