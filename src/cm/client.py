from django.forms.fields import email_re
from django.http import HttpResponse, HttpResponseRedirect
from django.core.exceptions import ObjectDoesNotExist
from django.forms import ValidationError
from django.utils import simplejson
from django.utils.translation import ugettext as _
from tagging.models import Tag
from tagging.utils import parse_tag_input, LOGARITHMIC, calculate_cloud
from tagging.models import TaggedItem
from cm.models import *
from cm.utils.timezone import request_tz_convert
from itertools import groupby
from time import mktime, sleep
from cm.converters.pandoc_converters import pandoc_convert
from cm.security import get_viewable_comments, list_viewable_comments, has_perm, has_perm_on_text, has_perm_on_comment, has_own_perm
from cm.activity import register_activity
from cm.utils.date import datetime_to_user_str, datetime_to_epoch
from cm.cm_settings import AUTO_CONTRIB_REGISTER
from settings import CLIENT_DATE_FMT
import re
import time
import operator


selection_place_error_msg = _(u'A selection is required. Select in the text the part your comment applies to.')
comment_states = ('approved', 'unapproved', 'pending')

def is_valid_email(email):
    if email_re.match(email) : 
        return True 
    return False

#
def jsonize(obj, request):
    return simplejson.dumps(obj, cls=RequestComplexEncoder, request=request)

class RequestComplexEncoder(simplejson.JSONEncoder):
    def __init__(self, request, **kw):
        self.request = request
        simplejson.JSONEncoder.__init__(self, **kw)
        
        
    def default(self, obj):
        if isinstance(obj, Comment) :
            comment = obj
            #replies = list(comment.comment_set.order_by('created'))
            text=comment.text_version.text
            replies = get_viewable_comments(self.request, comment.comment_set.all(), text)
            
            # can_view == true because of get_viewable_comments filter
            can_moderate = has_perm(self.request, 'can_edit_comment', text)   
            can_edit = has_perm(self.request, 'can_edit_comment', text) or has_own_perm(self.request, 'can_edit_comment_own', text, comment)  
            can_delete = has_perm(self.request, 'can_delete_comment', text) or has_own_perm(self.request, 'can_delete_comment_own', text, comment)
            
            return {'id' : comment.id, 
                    'key' : comment.key,
                   'created_user_str' : datetime_to_user_str(request_tz_convert(comment.created, self.request)),
                   'modified_user_str' : datetime_to_user_str(request_tz_convert(comment.modified, self.request)),
#                   'created_str' : datetime_to_str(comment.created), # TODO change to a simple number as modified if possible
                   'created' : datetime_to_epoch(comment.created), # TODO change to a simple number as modified if possible
                   'modified' : datetime_to_epoch(comment.modified),  
#                   'modified' : time.mktime(comment.modified.timetuple()),  
#                   'created' : datetime_to_js_date_str(comment.created),
                   'reply_to_id' : comment.reply_to_id,
                   'replies' : replies,
                   'name' : comment.get_name(), 
                   'email' : comment.get_email(), 
                   'logged_author' : (comment.user != None), 
                   'title':comment.title,
                   'content':comment.content, 
                   'content_html':comment.content_html, 
                   'tags': ', '.join(parse_tag_input(comment.tags)), 
                   'format': comment.format, 
                   'start_wrapper' : comment.start_wrapper, 
                   'end_wrapper' : comment.end_wrapper,
                   'start_offset' : comment.start_offset, 
                   'end_offset' : comment.end_offset,
                   'state' : comment.state,
                   'permalink' : reverse('text-view-show-comment', args=[text.key, comment.key]),
                   # permission
                   'can_edit' : can_edit,
                   'can_delete' : can_delete,
                   'can_moderate' : can_moderate,
                   }
        if isinstance(obj, Tag) :
            tag = obj
            # RBE each time issuing a db request to find comments related to this tag !!! TODO  
            return { 'ids' : [t.id for t in tag.items.all()], 'name' : tag.name, 'font_size' : tag.font_size}            

        return simplejson.JSONEncoder.default(self, obj)

def experiment() :
    sleep(5) ;
    return {"key":"value"}

def read_comment_args(request):
    name = request.POST.get('name', None)
    email = request.POST.get('email', None)
    if name != None :
        name = name.lower().strip()
    if email != None :
        email = email.lower().strip()

    title = request.POST['title'].strip()
    content = request.POST['content'].strip() 
    
    tags = request.POST['tags']

    reply_to_id = request.POST.get('reply_to_id', None)
    
    format = request.POST['format'] 

    start_wrapper = request.POST.get('start_wrapper', None)
    end_wrapper = request.POST.get('end_wrapper', None)
    start_offset = request.POST.get('start_offset', None)
    end_offset = request.POST.get('end_offset', None)
    
    if start_wrapper :
        start_wrapper = int(start_wrapper.strip())
    if end_wrapper :
        end_wrapper = int(end_wrapper.strip())
    if start_offset :
        start_offset = int(start_offset.strip())
    if end_offset :
        end_offset = int(end_offset.strip())
    
    return name, email, title, content, tags, reply_to_id, format, start_wrapper, end_wrapper, start_offset, end_offset

def validate_comment_args(name, email, title, content, tags):
    errors = {}
    if name != None : 
        if name == "" :
            errors['name'] = _(u'name is required')   
    if email != None :
        if email == "" :
            errors['email'] = _(u'email is required')
        if not is_valid_email(email) :
            errors['email'] = _('invalid email')
    if title == "" :
        errors['title'] = _(u'title is required')   
    if content == "" :
        errors['content'] = _(u'content is required')
        
    tag_errors = validate_tags(tags)
    if tag_errors != "" :
        errors['tags'] = tag_errors
        
    return errors

@has_perm_on_comment("can_delete_comment")
def remove_comment(request, key, comment_key):
    ret={}
    try:
        text = Text.objects.get(key=key)
        comment = Comment.objects.get(key = comment_key)
        comment.delete()
        ret['msg'] = _(u'comment removed')
        register_activity(request, "comment_removed", text=text, comment=comment)
    except ObjectDoesNotExist: 
        pass
    return ret ;

@has_perm_on_comment("can_edit_comment")
def edit_comment(request, key, comment_key):
    state = request.POST.get('state', None)
    change_state = state and state in comment_states     
    
    errors = {}
    if not change_state : # moderation action
        change_scope = request.POST.get('change_scope', None)
    
        name, email, title, content, tags, reply_to_id, format, start_wrapper, end_wrapper, start_offset, end_offset = read_comment_args(request)
    
        errors = validate_comment_args(name, email, title, content, tags)
         
        if (change_scope) and start_wrapper=="" :
            errors['selection_place'] = selection_place_error_msg   
            
        content_html = pandoc_convert(content, format, "html", full=False)

    ret = {} 
    if errors != {} :
        ret['errors'] = errors
    else :
    # INSERT
    # TODO check version still exist ...
        #comment = Comment.objects.get(id=edit_comment_id)
        comment = Comment.objects.get(key=comment_key)
        if change_state : # moderation action
            comment.state = state 
        else :
            comment.name = name
            comment.email = email
            comment.title = title
            comment.content = content
            comment.content_html = content_html
            comment.tags = tags

            if change_scope :
                comment.start_wrapper = start_wrapper
                comment.start_offset = start_offset
                comment.end_wrapper = end_wrapper
                comment.end_offset = end_offset
            
        comment.save()
        
        ret['comment'] = comment
        ret['msg'] = _(u'comment saved')
    return ret
    
# DIRTY : this function has no error check but anyway errors are not listened to client side 
@has_perm_on_text("can_create_comment")
def own_notify(request, key):
    email_or_user = None if request.user.is_anonymous() else request.user
    if not email_or_user :
        email_or_user = request.POST.get('email', None)
        if email_or_user :
            email_or_user = email_or_user.lower().strip()

    active = (request.POST.get('active', False) == 'true')
    text = Text.objects.get(key=key)
    Notification.objects.set_notification(text=None, type='own', active=active, email_or_user=email_or_user)
    ret = HttpResponse()
    ret.status_code = 200 
    return ret 

@has_perm_on_text("can_create_comment")
def add_comment(request, key, version_key):
#    if edit_comment_id : #
#    if self.request.user.is_anonymous() : # accessing via an admin url ?
#    and comment.user == self.request.user
    user = None if request.user.is_anonymous() else request.user 
    name, email, title, content, tags, reply_to_id, format, start_wrapper, end_wrapper, start_offset, end_offset = read_comment_args(request)
    errors = {} 
    errors = validate_comment_args(name, email, title, content, tags)

    if start_wrapper == "" :
        errors['selection_place'] = selection_place_error_msg   

    #TODO validate pandoc conversion
    content_html = pandoc_convert(content, format, "html", full=False)
        
    ret = {} 
    if errors != {} :
        ret['errors'] = errors
    else :
    # INSERT
    # TODO check version still exist ...
        reply_to = None
        if reply_to_id :
            reply_to = Comment.objects.get(id=reply_to_id)
            
        text = Text.objects.get(key=key)
        text_version = TextVersion.objects.get(key=version_key)
        
        comment_state = 'approved' if text_version.mod_posteriori else 'pending'
        comment = Comment.objects.create(state=comment_state, text_version=text_version, user=user, name=name, email=email, title=title, content=content, content_html=content_html, tags = tags, start_wrapper = start_wrapper, end_wrapper = end_wrapper, start_offset = start_offset, end_offset = end_offset, reply_to=reply_to)
        
        ask_for_notification = True
        if user : 
            workspace_notify_count = Notification.objects.filter(text=None,type='workspace',user=user, active=True).count()
            text_notify_count = Notification.objects.filter(text=text,type='text',user=user, active=True).count()
            if workspace_notify_count > 0 or text_notify_count > 0 : 
                ask_for_notification = False

        if ask_for_notification :
            ask_for_notification = ( None == Notification.objects.get_notifications(text=None, type='own', email_or_user=(user if user else email)))
        ret['ask_for_notification'] = ask_for_notification
        ret['email'] = '' if user else email

        if text_version.mod_posteriori or has_perm(request, 'can_view_unapproved_comment', text=text) or has_perm(request, 'can_view_comment_own', text=text) : 
            ret['comment'] = comment
            ret['msg'] = _(u"comment saved")
        else :
            ret['msg'] = _(u"comment saved, it is being held for moderation")
        
        if AUTO_CONTRIB_REGISTER:
            Notification.objects.set_notification(text=text, type='own', active=True, email_or_user=user or email)            
        register_activity(request, "comment_created", text, comment)
    return ret

#we need to call comments_thread from here this function will be very expensive 
# TODO: stupid get rid of text argument
def get_filter_datas(request, text_version, text):
    from django.db.models import Count
    from datetime import datetime, timedelta

    allowed_ids = [c.id for c in comments_thread(request, text_version, text)] 
    allowed_comments = Comment.objects.filter(Q(text_version=text_version),Q(deleted=False),Q(id__in=allowed_ids)) 
    #print allowed_ids 

    # authors
#    names = list(Comment.objects.filter(text_version__text__key=key).filter(user__isnull=True).values('name').annotate(nb_comments=Count('id'))) #.order_by('name'))
    names = list(allowed_comments.filter(user__isnull=True).values('name').annotate(nb_comments=Count('id'))) #.order_by('name'))
    names += list(User.objects.filter(Q(comment__text_version=text_version),Q(comment__deleted=False), Q(comment__id__in=allowed_ids)).extra(select={'name': "username"}).values('name').annotate(nb_comments=Count('id'))) #.order_by('username'))
    names.sort(key = lambda obj:obj["name"])

    # dates
    # TODO maybe optimize by comparing dates in python and saving these 'by day db requests'
    nb_days = [1, 3, 7, 30]
    dates = []
    today = datetime.today()
    for nb_day in nb_days :
        day_date = today - timedelta(nb_day)
        dates.append({'nb_day' : nb_day, 'nb_day_date':datetime_to_epoch(day_date), 'nb_comments':allowed_comments.filter(modified__gt = day_date).count()})
    
    # tags
    comment_ids = [c.id for c in allowed_comments]
    tags = list(Tag.objects.filter(items__content_type = ContentType.objects.get_for_model(Comment),items__object_id__in=comment_ids).values("name").annotate(nb_comments=Count('id')).distinct().order_by('name'))

    # states
    states = []
    for state in comment_states :
        states.append({'state' : state, 'nb_comments':allowed_comments.filter(state = state).count()})
    
    return {'names':names, 'dates':dates, 'tags':tags, 'states':states}

#def get_ordered_ids(text_version_id):
#    comments_and_replies = Comment.objects.filter(text_version__id=text_version_id)
#    comments = comments_and_replies.filter(reply_to__isnull=True)
#    
#    dic = {}
#    for c in comments_and_replies :
#        top_comment = c.top_comment()
#        max_modif = dic.get(top_comment.id, c.modified)
#        dic[top_comment.id] = c.modified if max_modif < c.modified else max_modif
#    
#    ordered_comment_ids = {'scope' : [c.id for c in comments.order_by('start_wrapper','start_offset','end_offset')],
#                           'thread_modified' : map(operator.itemgetter(0), sorted(dic.items(), key=operator.itemgetter(1)))}
#    return ordered_comment_ids
   
def validate_tags(tags):
    if tags :
        try :
            if len(tags) > 250 : 
                return _(u"Tags input must be no longer than 250 characters.")
            TagField().formfield().clean(tags)
        except ValidationError, e :
            return ",".join(e.messages) 
    return ''

MAX_NB_TAGS_IN_COMMENT_CLOUD = 30
def get_tagcloud(key) :
    tagCloud = Tag.objects.cloud_for_model(Comment, steps=8, distribution=LOGARITHMIC, filters=dict(text_version__text__key=key))
    return tagCloud
    
# returns a flat list of viewable comments and their replies ordered as they should be : 
# order is : 
# 'start_wrapper','start_offset','end_wrapper','end_offset' for 'real' comments
# 'created' for replies
# TODO: get rid of text here, keep text_version
def comments_thread(request, text_version, text) : 
    commentsnoreply = text_version.comment_set.filter(reply_to__isnull=True)#id=3)
    viewable_commentsnoreply = get_viewable_comments(request, commentsnoreply, text, order_by = ('start_wrapper','start_offset','end_wrapper','end_offset'))
    viewable_comments = []
    for cc in viewable_commentsnoreply :
        viewable_comments += list_viewable_comments(request, [cc], text)
    return viewable_comments

