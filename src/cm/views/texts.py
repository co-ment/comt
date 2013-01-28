from cm.utils.embed import embed_html
from cm.activity import register_activity
from cm.client import jsonize, get_filter_datas, edit_comment, remove_comment, \
    add_comment, RequestComplexEncoder, comments_thread, own_notify
from cm.cm_settings import NEW_TEXT_VERSION_ON_EDIT
from cm.exception import UnauthorizedException
from cm.message import *
from cm.models import *
from django.forms.util import ErrorList
from cm.models_base import generate_key
from cm.security import get_texts_with_perm, has_perm, get_viewable_comments, \
    has_perm_on_text
from cm.utils import get_among, get_among, get_int
from cm.utils.html import on_content_receive
from cm.utils.comment_positioning import compute_new_comment_positions, \
    insert_comment_markers
from cm.utils.spannifier import spannify
from cm.views import get_keys_from_dict, get_textversion_by_keys_or_404, get_text_by_keys_or_404, redirect
from cm.views.export import content_export2, xml_export
from cm.views.user import AnonUserRoleForm, cm_login
from difflib import unified_diff
from django import forms
from django.conf import settings
from django.contrib.auth import login as django_login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.forms import ModelForm
from django.forms.models import BaseModelFormSet, modelformset_factory
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils.translation import ugettext as _, ugettext_lazy
from django.views.generic.list_detail import object_list
from tagging.models import Tag
import difflib
import logging
import mimetypes
import simplejson
import sys
import re
import imghdr
import base64
import cssutils
from os.path import basename
from django.db.models.sql.datastructures import EmptyResultSet

def get_text_and_admin(key, adminkey, assert_admin = False):
    """
    assert_admin => redirect to unauthorized if not admin 
    """
    admin = False
    if adminkey:
        text = Text.objects.get(key = key, adminkey = adminkey)
        if text:
            admin = True
    else:
        text = Text.objects.get(key=key)
    if assert_admin and not admin:
        raise UnauthorizedException('Is not admin')        
    return text, admin



ACTIVITY_PAGINATION = 10
RECENT_TEXT_NB = 5
RECENT_COMMENT_NB = RECENT_TEXT_NB

MODERATE_NB = 5

def dashboard(request):
    request.session.set_test_cookie()
    if request.user.is_authenticated():
        act_view = {
                    'view_texts' : get_int(request.GET, 'view_texts',1),
                    'view_comments' : get_int(request.GET, 'view_comments',1),
                    'view_users' : get_int(request.GET, 'view_users',1),
                    }
            
        paginate_by = get_int(request.GET, 'paginate', ACTIVITY_PAGINATION)
                
        # texts with can_view_unapproved_comment perms
        moderator_texts = get_texts_with_perm(request, 'can_view_unapproved_comment')
        viewer_texts = get_texts_with_perm(request, 'can_view_approved_comment')
        all_texts_ids = [t.id for t in moderator_texts] + [t.id for t in viewer_texts]
                    
        span = get_among(request.GET, 'span', ('day','month','week',),'week')        
        template_dict = { 
                         'span' : span,
                         'last_texts' : get_texts_with_perm(request, 'can_view_text').order_by('-modified')[:RECENT_TEXT_NB],
                         'last_comments' : Comment.objects.filter(text_version__text__in=all_texts_ids).order_by('-created')[:RECENT_COMMENT_NB],# TODO: useful?
                         #'last_users' : User.objects.all().order_by('-date_joined')[:5],
                         }
        template_dict.update(act_view)
        
        all_activities = {
                               'view_comments' : ['comment_created','comment_removed'],
                               'view_users' : ['user_created', 'user_activated', 'user_suspended','user_enabled',],
                               'view_texts' : ['text_created','text_removed', 'text_edited', 'text_edited_new_version'],
                               }
        
        selected_activities = []
        [selected_activities.extend(all_activities[k]) for k in act_view.keys() if act_view[k]]
        
        activities = Activity.objects.filter(type__in = selected_activities)
        if not has_perm(request,'can_manage_workspace'):
            texts = get_texts_with_perm(request, 'can_view_text')
            activities = activities.filter(Q(text__in=texts))
            
            comments = [] 
            [comments.extend(get_viewable_comments(request, t.last_text_version.comment_set.all(), t)) for t in texts]

            activities = activities.filter(Q(comment__in=comments) | Q(comment=None) )
            template_dict['to_mod_profiles'] = []
        else:
            template_dict['to_mod_profiles'] = UserProfile.objects.filter(user__is_active=False).filter(is_suspended=True).order_by('-user__date_joined')[:MODERATE_NB]
        template_dict['to_mod_comments'] = Comment.objects.filter(state='pending').filter(text_version__text__in=moderator_texts).order_by('-modified')[:MODERATE_NB-len(template_dict['to_mod_profiles'])]

        activities = activities.order_by('-created')
        return object_list(request, activities,
                           template_name = 'site/dashboard.html',
                           paginate_by = paginate_by,
                           extra_context = template_dict,
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
                         'texts' : public_texts,
                         }
        return render_to_response('site/non_authenticated_index.html', template_dict, context_instance=RequestContext(request))
        
TEXT_PAGINATION = 10
# security check inside view
# TODO: set global access perm
def text_list(request):
    paginate_by = get_int(request.GET,'paginate',TEXT_PAGINATION)
    tag_selected = request.GET.get('tag_selected', 0)
        
    order_by = get_among(request.GET,'order',('title','author','modified','-title','-author','-modified'),'-modified')

    if request.method == 'POST':
        action = request.POST.get('action',None)
        text_keys = get_keys_from_dict(request.POST, 'check-').keys()        
        if action == 'delete':
            for text_key in text_keys:
                text = Text.objects.get(key=text_key)
                if has_perm(request, 'can_delete_text', text=text):
                    text.delete()
                else:
                    raise UnauthorizedException('No perm can_delete_text on comment') 
            display_message(request, _(u'%(nb_texts)i text(s) deleted') %{'nb_texts':len(text_keys)})
            return HttpResponseRedirect(reverse('text'))

    texts = get_texts_with_perm(request, 'can_view_text').order_by(order_by)

    try:
        tag_list = Tag.objects.usage_for_queryset(TextVersion.objects.filter(id__in = [t.last_text_version_id for t in get_texts_with_perm(request, 'can_view_text')]))
    except EmptyResultSet:
        tag_list = []
    context = {    
               'tag_list' : tag_list,
               'tag_selected': tag_selected,
               }

    if tag_selected:     
        tag_ids = Tag.objects.filter(name=tag_selected)
        if tag_ids:   
            content_type_id = ContentType.objects.get_for_model(TextVersion).pk
            # table cm_userprofile is not present if display_suspended_users: fix this 
            texts = texts.extra(where=['tagging_taggeditem.object_id = cm_text.last_text_version_id', 
                                       'tagging_taggeditem.content_type_id = %i' %content_type_id,
                                       'tagging_taggeditem.tag_id = %i' %tag_ids[0].id],
                                tables=['tagging_taggeditem'],
                                )
    
    return object_list(request, texts,
                       template_name = 'site/text_list.html',
                       paginate_by = paginate_by,
                       extra_context=context,
                       )
    
@has_perm_on_text('can_view_text')
def text_view(request, key, adminkey=None):
    text = get_text_by_keys_or_404(key)
    register_activity(request, "text_view", text=text)    
    text_version = text.get_latest_version()
    embed_code = embed_html(key, 'id="text_view_frame" name="text_view_frame" onload="if (window.iframe_onload) iframe_onload();"', None, request.META.get('QUERY_STRING'))
    template_dict = { 'embed_code':embed_code, 'text' : text, 'text_version' : text_version, 'title' : text_version.title}
    return render_to_response('site/text_view.html', template_dict, context_instance=RequestContext(request))

@has_perm_on_text('can_delete_text')
def text_delete(request, key):
    text = Text.objects.get(key=key)
    if request.method != 'POST':
        raise UnauthorizedException('Unauthorized')
    display_message(request, _(u'Text %(text_title)s deleted') %{'text_title':text.title})
    register_activity(request, "text_removed", text=text)    
    text.delete()
    return HttpResponse('') # no redirect because this is called by js

@has_perm_on_text('can_delete_text')
def text_version_delete(request, key, text_version_key):
    text_version = TextVersion.objects.get(key=text_version_key)
    text=text_version.text
    if request.method != 'POST':
        raise UnauthorizedException('Unauthorized')
    display_message(request, _(u'Text version %(text_version_title)s deleted') %{'text_version_title':text_version.title})
    register_activity(request, "text_version_removed", text=text)
    text_version.delete()
    return HttpResponse('') # no redirect because this is called by js


@has_perm_on_text('can_view_text') # only protected by text_view / comment filtering done in view
def text_view_comments(request, key, version_key=None, adminkey=None):
    text = get_text_by_keys_or_404(key)
    
    read_only = False
    if version_key :
        text_version = get_textversion_by_keys_or_404(version_key, adminkey, key)
        if settings.ALLOW_CLIENT_MODIF_ON_LAST_VERSION_ONLY :
            read_only = (text.last_text_version_id != text_version.id) 
    else :
        text_version = text.get_latest_version()
    
    comments = get_viewable_comments(request, text_version.comment_set.filter(reply_to__isnull=True),text)
    filter_datas = get_filter_datas(request, text_version, text)
    
    get_params = simplejson.dumps(request.GET)
    wrapped_text_version, _ , _ = spannify(text_version.get_content())
    template_dict = {'text' : text,
                               'text_version' : text_version,
                               'title' : text_version.title, # TODO use it ...
                               'get_params' : get_params,
                               'content' : wrapped_text_version,
                               'client_date_fmt' : settings.CLIENT_DATE_FMT,
                               'read_only' : read_only,
                               }
    template_dict['json_comments'] = jsonize(comments, request)
    template_dict['json_filter_datas'] = jsonize(filter_datas, request)
    from cm.models import ApplicationConfiguration
    custom_css_str = ApplicationConfiguration.get_key('custom_css')
    if custom_css_str:
      custom_css = cssutils.parseString(custom_css_str)
      for css_rule in custom_css:
        if css_rule.type == css_rule.STYLE_RULE and css_rule.wellformed:
          css_rule.selectorText = "#textcontainer %s" %css_rule.selectorText
      template_dict['custom_css'] = custom_css.cssText

    template_dict['custom_font'] = ApplicationConfiguration.get_key('custom_font')
    template_dict['custom_titles_font'] = ApplicationConfiguration.get_key('custom_titles_font')
    return render_to_response('site/text_view_comments.html',
                              template_dict,
                              context_instance=RequestContext(request))
def client_exchange(request):
    ret = None
    if request.method == 'POST' :
        function_name = request.POST['fun']# function called from client
        user = request.user
        if function_name == 'experiment' :
            ret = experiment()
        elif function_name == 'warn' :
            # TODO: (RBE to RBA) send mail withinfos
            ret = "warn test"
            #print request.POST
        else :
            key = request.POST['key']
            version_key = request.POST['version_key']
    
            text = Text.objects.get(key=key)
            #TODO: stupid why restrict to latest ? 
            text_version = text.get_latest_version()
            
            if (text != None) :
                if function_name == 'ownNotify' : 
                    ret = own_notify(request=request, key=key)
                if function_name in ('editComment', 'addComment', 'removeComment',) :
                    if function_name == 'editComment' :
                        ret = edit_comment(request=request, key=key, comment_key=request.POST['comment_key'])
                    elif function_name == 'addComment' :
                        ret = add_comment(request=request, key=key, version_key=version_key)
                    elif function_name == 'removeComment' :
                        ret = remove_comment(request=request, key=key, comment_key=request.POST['comment_key'])
                        
                    ret['filterData'] = get_filter_datas(request, text_version, text)
                    #ret['tagCloud'] = get_tagcloud(key)
    if ret :
        if type(ret) != HttpResponseRedirect and type(ret) != HttpResponse:
            ret = HttpResponse(simplejson.dumps(ret, cls=RequestComplexEncoder, request=request))        
    else :
        ret = HttpResponse()
        ret.status_code = 403 
    return ret 


def from_html_links_to_inline_imgs(content, inline=True, full_path=True):
  """
  Replaces (html) links to attachs with embeded inline images
  """
  content = re.sub("%s" %settings.SITE_URL, '', content) # changes absolute urls to relative urls
  attach_re = r'"(?:/text/(?P<key>\w*))?/attach/(?P<attach_key>\w*)/'
  attach_str_textversion = r'/text/%s/attach/%s/'
  attach_str = r'/attach/%s/'
  for match in re.findall(attach_re, content):
    if match[0]:
      link = attach_str_textversion %match
    else:
      link = attach_str %match[1]
    
    attach = Attachment.objects.get(key=match[1])                
    if inline:
      img_fmt = imghdr.what(attach.data.path)
      img = open(attach.data.path, 'rb')
      data = base64.b64encode(img.read())
      img.close()
      content = content.replace(link, 'data:image/'+img_fmt+';base64,'+data)
    else:
      if full_path:
        content = content.replace(link, attach.data.path)
      else:
        img_fmt = imghdr.what(attach.data.path)
        content = content.replace(link, match[1]+'.'+img_fmt)
  return content

def text_export(request, key, format, download, whichcomments, withcolor, adminkey=None):
    text, admin = get_text_and_admin(key, adminkey)
    text_version = text.get_latest_version()

    if format == 'xml':
      return xml_export(request, text_version, whichcomments) 
    
    original_content = text_version.content
    original_format = text_version.format # BD : html or markdown for  now ...

    download_response = download == "1"
    with_color = withcolor == "1"

    comments = [] # whichcomments=="none"
    
    if whichcomments == "filtered" or whichcomments == "all":
        _comments = text_version.comment_set.all()
        if whichcomments == "filtered" :
            filteredIds = []
            if request.method == 'POST' :
                ll = request.POST.get('filteredIds',[]).split(",")
                filteredIds = [ int(l) for l in ll if l]
            _comments = text_version.comment_set.filter(id__in=filteredIds) # security ! TODO CROSS PERMISSIONS WITH POST CONTENT
            
        comments = get_viewable_comments(request, _comments, text, order_by=('start_wrapper','start_offset','end_wrapper','end_offset'))# whichcomments=="all"
        
    # decide to use pandoc or not
    if format in ('markdown', 'latex', 'epub') : 
      use_pandoc = True
    else:
      use_pandoc = (original_format == 'markdown' or original_format == 'rst')

    # attachments
    # for html, inline images only when exporting
    if format != 'html' or download_response :
      # for epub, file paths
      if format == 'epub':
        original_content = from_html_links_to_inline_imgs(original_content, False)
      # for latex, file name
      elif format == 'latex':
        original_content = from_html_links_to_inline_imgs(original_content, False, False)
      # for everything else, inline b64 encoded
      else:
        original_content = from_html_links_to_inline_imgs(original_content)
            
    if len(comments) == 0 : #want to bypass html conversion in this case
      # Prepends title
      if original_format == 'html':
        original_content = "<h1>%s</h1>%s" %(text_version.title, original_content)
      elif original_format == 'markdown':
        original_content = "%s\n======\n%s" %(text_version.title, original_content)
      elif original_format == 'rst':
        underline = '=' * len(text_version.title)
        original_content = "%s\n%s\n%s" %(text_version.title, underline, original_content)

      return content_export2(request, original_content, text_version.title, original_format, format, use_pandoc, download_response)
    else : # case comments to be added  
        html = pandoc_convert(original_content, original_format, 'html')
        wrapped_text_version, _ , _ = spannify(html)
        with_markers = True
        marked_content = insert_comment_markers(wrapped_text_version, comments, with_markers, with_color)
        # Prepends title
        marked_content = "<h1>%s</h1>%s" %(text_version.title, marked_content)
        viewable_comments = [x for x in comments_thread(request, text_version, text) if x in comments]
        extended_comments = {}
        nb_children = {}
        for cc in viewable_comments :
            id = 0 #<-- all top comments are children of comment with id 0
            if cc.is_reply() :
                id = cc.reply_to_id
                
            nb_children[id] = nb_children.get(id, 0) + 1
            
            cc.num = "%d"%nb_children[id]
            
            extended_comments[cc.id] = cc
        
            if cc.is_reply() :
                cc.num = "%s.%s"%(extended_comments[cc.reply_to_id].num, cc.num)
        
        html_comments=render_to_string('site/macros/text_comments.html',{'comments':viewable_comments }, context_instance=RequestContext(request))
        
        content = "%s%s"%(marked_content, html_comments)
        content_format = "html" 
        
        return content_export2(request, content, text_version.title, content_format, format, use_pandoc, download_response)

@has_perm_on_text('can_view_text')
def text_view_frame(request, key, version_key=None, adminkey=None):
    text = get_text_by_keys_or_404(key)
    
    if version_key :
        text_version = get_textversion_by_keys_or_404(version_key, adminkey, key)
    else :
        text_version = text.get_latest_version()
    template_dict = {'text' : text, 'text_version' : text_version}
    return render_to_response('site/text_view_frame.html',
                              template_dict,
                              context_instance=RequestContext(request))


@has_perm_on_text('can_view_text')
def text_history_version(request, key, version_key):
    text = get_text_by_keys_or_404(key)
    text_version = get_textversion_by_keys_or_404(version_key, key=key)
    text_versions = text.get_versions()
    first_version = text_versions[len(text_versions) - 1]
    template_dict = {'text' : text,
                     'text_version' : text_version,
                     'embed_code' : embed_html(key, 'id="text_view_frame" name="text_view_frame"', version_key),
                     'first_version':first_version,
                      }
    return render_to_response('site/text_history_version.html',
                              template_dict,
                              context_instance=RequestContext(request))

@has_perm_on_text('can_view_text')
def text_history_compare(request, key, v1_version_key, v2_version_key, mode=''):
    text = get_text_by_keys_or_404(key)
    v1 = get_textversion_by_keys_or_404(v1_version_key, key=key)
    v2 = get_textversion_by_keys_or_404(v2_version_key, key=key)

    content = get_uniffied_inner_diff_table(v1.title,
                                            v2.title, 
                                            _("by %(author)s") %{'author' : v1.get_name()},
                                            _("by %(author)s") %{'author' : v2.get_name()},
                                            v1.content,
                                            v2.content)
    if mode=='1':
        # alternate diff
        #from cm.utils.diff import text_diff
        from cm.utils.diff import diff_match_patch2        
        dif = diff_match_patch2()
        content = dif.diff_prettyHtml_one_way(dif.diff_main(v1.get_content(), v2.get_content()), mode='ins_del')

    text_versions = text.get_versions()
    first_version = text_versions[len(text_versions) - 1]
    template_dict = {
                     'text' : text,
                     'v1': v1,
                     'v2': v2,
                     'content' : content.strip(),
                     'empty' : '<table class="diff"><tbody></tbody></table>'==content,
                     'first_version':first_version,
                     }
    return render_to_response('site/text_history_compare.html',
                              template_dict,
                              context_instance=RequestContext(request))
    
@has_perm_on_text('can_view_text')
def text_history(request, key):
    text = get_text_by_keys_or_404(key)
    
    if request.method == 'POST':
        v1_key = request.POST.get('newkey',None)
        v2_key = request.POST.get('oldkey',None)
        if v1_key and v2_key:  
            return redirect(request, 'text-history-compare', args=[text.key, v2_key, v1_key ])
        
    text_versions = text.get_versions()
    paginate_by = get_int(request.GET,'paginate',TEXT_PAGINATION)

    last_last_version = text_versions[1] if len(text_versions)>1 else None 
    first_version = text_versions[len(text_versions) - 1]
    context = {'text':text, 'last_version':text.last_text_version, 'last_last_version':last_last_version, 'first_version':first_version}
    return object_list(request, text_versions,
                       template_name = 'site/text_history.html',
                       paginate_by = paginate_by,
                       extra_context=context,
                       )
    

# taken from trac
def _get_change_extent(str1, str2):
    """
    Determines the extent of differences between two strings. Returns a tuple
    containing the offset at which the changes start, and the negative offset
    at which the changes end. If the two strings have neither a common prefix
    nor a common suffix, (0, 0) is returned.
    """
    start = 0
    limit = min(len(str1), len(str2))
    while start < limit and str1[start] == str2[start]:
        start += 1
    end = -1
    limit = limit - start
    while - end <= limit and str1[end] == str2[end]:
        end -= 1
    return (start, end + 1)

def diff_decorate(minus, plus):
    return minus, plus

def get_uniffied_inner_diff_table(title1, title2, author1, author2, text1, text2):
    """
    Return the inner of the html table for text1 vs text2 diff
    """
    gen = unified_diff(text1.replace('\r\n','\n').split('\n'), text2.replace('\r\n','\n').split('\n'), n=3)
    index = 0
    res = ['<table class="diff"><col class="diff-marker"/><col class="diff-content"/><col class="diff-separator"/><col class="diff-marker"/><col class="diff-content"/><tbody>']
    res.append('<tr><td></td><td class="diff-title">%s</td><td></td><td></td><td class="diff-title">%s</td></tr>' %(title1, title2))
    res.append('<tr><td></td><td class="diff-author">%s</td><td></td><td></td><td class="diff-author">%s</td></tr>' %(author1, author2))
    res.append('<tr><td colspan="5"></td></tr>')
    #res.append('<tr><td width="50%" colspan="2"></td><td width="50%" colspan="2"></td></tr>')
    
    for g in gen:
        if index > 1:
            col_in = None
            if g.startswith('@@'):
                line_number = g.split(' ')[1][1:].split(',')[0]
                if index != 2:
                    res.append('<tr><td></td>&nbsp;<td></td><td></td><td>&nbsp;</td></tr>')                    
                res.append('<tr><td class="diff-lineno" colspan="2">Line %s</td><td class="diff-separator"></td><td class="diff-lineno" colspan="2">Line %s</td></tr>' % (line_number, line_number))
            if g.startswith(' '):
                res.append('<tr><td class="diff-marker"></td><td class="diff-context">%s</td><td class="diff-separator"></td><td class="diff-marker"></td><td class="diff-context">%s</td></tr>' % (g, g))
            if g.startswith('-') or g.startswith('+'):
                plus = []
                minus = []
                while g.startswith('-') or g.startswith('+'):
                    if g.startswith('-'):
                        minus.append(g[1:])
                    else:
                        plus.append(g[1:])
                    try:
                        g = gen.next()
                    except StopIteration:
                        break
                minus, plus = diff_decorate(minus, plus)
                
                
                minus, plus = '<br />'.join(minus), '<br />'.join(plus)
                from cm.utils.diff import diff_match_patch2
                dif = diff_match_patch2()
                res_diff1 = dif.diff_main(minus, plus)
                dif.diff_cleanupSemantic(res_diff1)
                p = dif.diff_prettyHtml_one_way(res_diff1, 1)
                minus = dif.diff_prettyHtml_one_way(res_diff1, 2)
                plus = p
                res.append('<tr><td class="diff-marker">-</td><td class="diff-deletedline"><div>%s</div></td><td class="diff-separator"></td><td class="diff-marker">+</td><td class="diff-addedline"><div>%s</div></td></tr>' % (minus, plus))
             
        index += 1
    res.append('</tbody></table>')
    return ''.join(res)

#def text_history_version(request, key):
#    text = get_text_by_keys_or_404(key=key)
#    return _text_history_version(request, text)
#
#def text_history_version_admin(request, key, adminkey):
#    text = get_text_by_keys_or_404(key=key, adminkey=adminkey)
#    return _text_history_version(request, text, True)
#    if admin:
#         template_dict['adminkey'] = text.adminkey
#         template_dict['admin'] = True          
#    return render_to_response('site/text_history.html', template_dict, context_instance=RequestContext(request))
#
class TextVersionForm(ModelForm):
    class Meta:
        model = TextVersion
        fields = ('title', 'content', 'format')

class EditTextForm(ModelForm):
    title = forms.CharField(label=ugettext_lazy("Title"), widget=forms.TextInput)
    #format = forms.CharField(label=_("Format"))
    #content = forms.TextField(label=_("Content"))

    note = forms.CharField(label=ugettext_lazy("Note (optional)"),
                           widget=forms.TextInput,
                           required=False,
                           max_length=100,
                           help_text=ugettext_lazy("Add a note to explain the modifications made to the text")
                           )

    #tags = forms.CharField(label=_("Tags (optional)"),
    #                       widget=forms.TextInput,
    #                       required=False,
    #                       #help_text=_("Add a note to explain the modifications made to the text")
    #                       )


    new_version = forms.BooleanField(label=ugettext_lazy("New version (optional)"),
                           required=False,
                           initial=True,
                           help_text=ugettext_lazy("Create a new version of this text (recommended)")
                           )

    keep_comments = forms.BooleanField(label=ugettext_lazy("Keep comments (optional)"),
                           required=False,
                           initial=True,
                           help_text=ugettext_lazy("Keep comments (if not affected by the edit)")
                           )

    cancel_modified_scopes = forms.BooleanField(label=ugettext_lazy("Detach comments (optional)"),
                           required=False,
                           initial=True,
                           help_text=ugettext_lazy("If some comments were attached to a chunck of text that is modified, check this option to keep these comments with no scope. Leave this option unchecked if you want that such comments be deleted. This option is ignored if the previous 'Keep comment' option is unchecked.")
                           )
    
    class Meta:
        model = TextVersion
        fields = ('title', 'format', 'content', 'new_version', 'tags', 'note')
        
    def save_into_text(self, text, request):
        new_content = request.POST.get('content')
        new_title = request.POST.get('title')
        new_format = request.POST.get('format', text.last_text_version.format)
        new_note = request.POST.get('note',None)
        new_tags = request.POST.get('tags',None)
        keep_comments = bool(request.POST.get('keep_comments',None))
        cancel_modified_scopes = bool(request.POST.get('cancel_modified_scopes',None))
        version = text.get_latest_version()
        version.edit(new_title, new_format, new_content, new_tags, new_note, keep_comments, cancel_modified_scopes)

        return version

    def save_new_version(self, text, request):
        new_content = request.POST.get('content')
        new_title = request.POST.get('title')
        new_format = request.POST.get('format', text.last_text_version.format)        
        new_note = request.POST.get('note',None)
        new_tags = request.POST.get('tags',None)
        
        new_text_version = text.edit(new_title, new_format, new_content, new_tags, new_note, keep_comments=True, cancel_modified_scopes=True, new_version=True)

        keep_comments = bool(request.POST.get('keep_comments',None))
        cancel_modified_scopes = bool(request.POST.get('cancel_modified_scopes',None))
        new_text_version.edit(new_title, new_format, new_content, new_tags, new_note, keep_comments, cancel_modified_scopes)
        new_text_version.user = request.user if request.user.is_authenticated() else None
        new_text_version.note = request.POST.get('note','')
        new_text_version.email = request.POST.get('email','')
        new_text_version.name = request.POST.get('name','')
        new_text_version.save()
        
        return new_text_version

    def __init__(self, data=None, files=None, auto_id='id_%s', prefix=None,
                 initial=None, error_class=ErrorList, label_suffix=':',
                 empty_permitted=False, instance=None):
        ModelForm.__init__(self, data, files, auto_id, prefix, initial, error_class, label_suffix, empty_permitted, instance)

        # override manually to disabled
        format_field = self.fields['format']
        format_field.widget.attrs = {'disabled':'disabled'}
        format_field.required = False

        self.fields['format'] = format_field

@has_perm_on_text('can_edit_text')
def text_pre_edit(request, key, adminkey=None):
    text = get_text_by_keys_or_404(key)
    
    text_version = text.get_latest_version()
    comments = text_version.get_comments()
    new_format = request.POST['new_format']
    new_content = on_content_receive(request.POST['new_content'], new_format)

    # TODO: RBE : si commentaire mal forme : (position non existante : boom par key error)
    _tomodify_comments, toremove_comments = compute_new_comment_positions(text_version.content, text_version.format, new_content, new_format, comments)
    return HttpResponse(simplejson.dumps({'nb_removed' : len(toremove_comments) }))

class EditTextFormAnon(EditTextForm):
    name = forms.CharField(label=ugettext_lazy("Name (optional)"), widget=forms.TextInput, required=False)
    email = forms.EmailField(label=ugettext_lazy("Email (optional)"), required=False)
    content = forms.CharField(label=ugettext_lazy("Content"), required=True, widget=forms.Textarea(attrs={'rows':'30', 'cols': '70'}))
    
    class Meta:
        model = TextVersion
        fields = ('title', 'format', 'content', 'tags', 'note', 'name', 'email')

@has_perm_on_text('can_edit_text')
def text_edit(request, key, adminkey=None):
    text = get_text_by_keys_or_404(key)
    text_version = text.get_latest_version()
    if request.method == 'POST':
        if request.user.is_authenticated():
            form = EditTextForm(request.POST)
        else:
            form = EditTextFormAnon(request.POST)

        if form.is_valid():
            if request.POST.get('new_version'):
                new_version = form.save_new_version(text, request)
                register_activity(request, "text_edited_new_version", text=text, text_version=new_version)
            else:
                form.save_into_text(text, request)
                register_activity(request, "text_edited", text=text)    
            return redirect(request, 'text-view', args=[text.key]) 
    else:
        default_data = {
                        'content': text_version.content,
                        'title': text_version.title,
                        'format': text_version.format,
                        'tags': text_version.tags,
                        'new_version': NEW_TEXT_VERSION_ON_EDIT,
                        'note' : '',
                        'keep_comments' : True,
                        'cancel_modified_scopes' : True,
                       }        
        if request.user.is_authenticated():
            form = EditTextForm(default_data)
        else:
            form = EditTextFormAnon(default_data)

    template_dict = {'text' : text, 'form' : form}

    return render_to_response('site/text_edit.html', template_dict , context_instance=RequestContext(request))

@has_perm_on_text('can_edit_text')
def text_revert(request, key, text_version_key):
    if request.method != 'POST':
        raise UnauthorizedException('Unauthorized')
        
    text = get_text_by_keys_or_404(key)

    text_version = text.revert_to_version(text_version_key)
    display_message(request, _(u'A new version (copied from version %(version_title)s) has been created') % {'version_title':text_version.title})

    return HttpResponse('') # no redirect because this is called by js
    
@has_perm_on_text('can_view_text')
def text_attach(request, key, attach_key):
    attach = Attachment.objects.get(key=attach_key, text_version__text__key=key)
    content = file(attach.data.path).read()
    mimetype, _encoding = mimetypes.guess_type(attach.data.path)
    response = HttpResponse(content, mimetype)
    return response

def notext_attach(request, attach_key):
    attach = Attachment.objects.get(key=attach_key)
    content = file(attach.data.path).read()
    mimetype, _encoding = mimetypes.guess_type(attach.data.path)
    response = HttpResponse(content, mimetype)
    return response
    
def fix_anon_in_formset(formset):
    # fix role choice in formset for anon (not all role are allowed)
    role_field = [f.fields['role'] for f in formset.forms if f.instance.user == None][0]
    role_field.choices = [(u'', u'---------')] + [(r.id, str(r)) for r in Role.objects.filter(anon = True)] # limit anon choices

class BaseUserRoleFormSet(BaseModelFormSet):
    def clean(self):
        """Checks that anon users are given roles with anon=True."""
        for i in range(0, self.total_form_count()):
            form = self.forms[i]
            print form.cleaned_data
            user_role = form.cleaned_data['id']
            if user_role.user == None:
                role = form.cleaned_data['role']
                if not role.anon:
                    # nasty stuff: cannot happen so not dealt with in tempate
                    logging.warn('Cannot give such role to anon user.')
                    raise forms.ValidationError, "Cannot give such role to anon user."

#@has_perm_on_text('can_manage_text')
#def xtext_share(request, key):
#    text = get_text_by_keys_or_404(key)
#    order_by = get_among(request.GET,'order',('user__username','-user__username','role__name','-role__name'),'user__username')
#        
#    UserRole.objects.create_userroles_text(text)
#    UserRoleFormSet = modelformset_factory(UserRole, fields=('role', ), extra=0, formset = BaseUserRoleFormSet)
#    
#    # put anon users on top no matter what the order says (TODO: ?)
#    userrole_queryset = UserRole.objects.filter(text=text).extra(select={'anon':'"cm_userrole"."user_id">-1'}).order_by('-anon',order_by)
#    if request.method == 'POST':
#        formset = UserRoleFormSet(request.POST, queryset = userrole_queryset)
#
#        if formset.is_valid():
#            formset.save()
#            display_message(request, "Sharing updated.")
#            return HttpResponseRedirect(reverse('text-share',args=[text.key]))
#
#    else:
#        formset = UserRoleFormSet(queryset = userrole_queryset)
#        fix_anon_in_formset(formset)
#         
#    global_anon_userrole = UserRole.objects.get(text=None, user=None)
#    return render_to_response('site/text_share.html', {'text' : text, 
#                                                       'formset' : formset,
#                                                       'global_anon_userrole' : global_anon_userrole,
#                                                       } , context_instance=RequestContext(request))

# TODO: permission protection ? format value check ?
def text_wysiwyg_preview(request, format):
    html_content = ""
    if request.POST : # if satisfied in the no html case, in html case : no POST (cf. markitup) previewTemplatePath and previewParserPath
        html_content = pandoc_convert(request.POST['data'], format, "html", full=False)
        
    return render_to_response('site/wysiwyg_preview.html', {'content':html_content} , context_instance=RequestContext(request))
        #return HttpResponse(pandoc_convert(content, format, "html", full=False))

USER_PAGINATION = 10

@has_perm_on_text('can_manage_text')
def text_share(request, key):
    display_suspended_users = get_int(request.GET, 'display', 0)
    tag_selected = request.GET.get('tag_selected', 0)
    paginate_by = get_int(request.GET, 'paginate', USER_PAGINATION)    
    
    text = get_text_by_keys_or_404(key)
    order_by = get_among(request.GET,'order',('user__username',
                                              'user__email',
                                              '-user__username',
                                              '-user__email',
                                              'role__name',
                                              '-role__name',
                                              ),
                          'user__username')
    
    UserRole.objects.create_userroles_text(text)
    
    if request.method == 'POST':
        if 'save' in request.POST:
            user_profile_keys_roles = get_keys_from_dict(request.POST, 'user-role-')
            count = 0
            for user_profile_key in user_profile_keys_roles:
                role_id = user_profile_keys_roles[user_profile_key]
                if not user_profile_key:
                    user_role = UserRole.objects.get(user = None, text = text)
                else:                    
                    user_role = UserRole.objects.get(user__userprofile__key = user_profile_key, text = text)
                if (role_id != u'' or user_role.role_id!=None) and role_id!=unicode(user_role.role_id):
                    if role_id:
                        user_role.role_id = int(role_id)
                    else:
                        user_role.role_id = None
                    user_role.save()
                    count += 1
            display_message(request, _(u'%(count)i user(s) role modified') %{'count':count})                
            return HttpResponseRedirect(reverse('text-share', args=[text.key]))    
    
    anon_role = UserRole.objects.get(user = None, text = text).role
    global_anon_role = UserRole.objects.get(user = None, text = None).role
        
    context = {
               'anon_role' : anon_role,
               'global_anon_role' : global_anon_role,
               'all_roles' : Role.objects.all(),
               'anon_roles' : Role.objects.filter(anon = True),
               'text' : text,
               'display_suspended_users' : display_suspended_users,
               'tag_list' : Tag.objects.usage_for_model(UserProfile),
               'tag_selected': tag_selected,               
               }

    query = UserRole.objects.filter(text=text).filter(~Q(user=None)).order_by(order_by)
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
                       template_name = 'site/text_share.html',
                       paginate_by = paginate_by,
                       extra_context = context,
                       )
    
    
class SettingsTextForm(ModelForm):
    # example name = forms.CharField(label=_("Name (optional)"), widget=forms.TextInput, required=False)
    
    class Meta:
        model = TextVersion
        fields = ('mod_posteriori',)

@has_perm_on_text('can_manage_text')
def text_settings(request, key):
    text = get_text_by_keys_or_404(key)
        
    text_version = text.get_latest_version()
    if request.method == 'POST':
        form = SettingsTextForm(request.POST, instance = text_version)
        
        if form.is_valid():
            form.save()
            display_message(request, _(u'Text settings updated'))                            
            return redirect(request, 'text-view', args=[text.key])
    else:
        form = SettingsTextForm(instance = text_version)

    template_dict = {'text' : text, 'form' : form}

    return render_to_response('site/text_settings.html', template_dict , context_instance=RequestContext(request))

