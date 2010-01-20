from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.utils.http import urlquote
from django.db.models import Q

import logging

from cm.models import *
from cm import cm_settings
from cm.exception import UnauthorizedException

def get_request_user(request):
    if request and request.user and not request.user.is_anonymous():
        user = request.user
    else:
        user = None
    return user
    
## Permission functions
class FakeRequest(object):
    def __init__(self, user):
        self.user = user

def user_has_perm(user, perm_name, text=None):
    return has_perm(FakeRequest(user),perm_name, text)
    
def has_perm(request, perm_name, text=None):
    # bypass sec if NO_SECURITY
    if cm_settings.NO_SECURITY:
        return True
    
    # make sure perm exist
    assert Permission.objects.get(codename=perm_name)
    
    user = get_request_user(request)

    if user and user.is_staff:
        return True
    
    if not text:
        return UserRole.objects.filter(user=user, text=None).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0
    else:
        # local role only ADDS permissions:
        # either a global or a local role with appropriate permissions
        #return UserRole.objects.filter(user=user).filter(Q(text=text) | Q(text=None)).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0

        # local role OVERRIDES global role:
        if UserRole.objects.filter(Q(user=user),Q(text=text),~Q(role=None)): # if non void local role
            return UserRole.objects.filter(user=user).filter(text=text).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0
        else:
            return UserRole.objects.filter(user=user).filter(text=None).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0            
        
def has_own_perm(request, perm_name, text, comment):
    
    user = get_request_user(request)
    
    if not user:
        return False
    
    # bypass sec if NO_SECURITY
    if cm_settings.NO_SECURITY:
        return True
    
    # make sure perm exist
    assert Permission.objects.get(codename=perm_name)
    
    # 2 special cases for comment own edition:
    
    # 1
    # if perm = can_edit_own_comment and 
    # text is a priori moderated and
    # comment is approved and
    # don't have moderation rights and
    if comment and comment.state == 'approved' and \
       perm_name == 'can_edit_comment_own' and \
       text.last_text_version.mod_posteriori == False and \
       not has_perm(request, 'can_manage_text', text=text):
        return False
    
    # 2       
    # if perm = can_edit_own_comment and and 
    # text is a posteriori moderated and
    # there is a reply
    # don't have moderation rights and
    if comment and comment.state == 'approved' and \
       perm_name == 'can_edit_comment_own' and \
       text.last_text_version.mod_posteriori == True and \
       comment.comment_set.count() != 0 and \
       not has_perm(request, 'can_manage_text', text=text):
        return False
    
    return (comment.user == request.user and has_perm(request, perm_name, text=text)) 
        
def is_authenticated(request):
    # We customize this to be able to monkey patch it if needed
    return request.user.is_authenticated()
    

## Content access functions

def get_texts_with_perm(request, perm_name):
    assert Permission.objects.get(codename=perm_name)

    user = get_request_user(request)
    
    if user and user.is_staff:
        return Text.objects.all()
    
    # local role only ADDS permissions:
    ## global perm
    # if UserRole.objects.filter(text=None).filter(role__permissions__codename__exact=perm_name).filter(Q(user=user) | Q(user=None) ).count() != 0:
    #    return Text.objects.all().distinct()
    ## only texts with role with perm
    #else:
    #    return Text.objects.filter(Q(userrole__role__permissions__codename__exact=perm_name), Q(userrole__user=user) | Q(userrole__user=None)).distinct()

    # local role OVERRIDES global role:
    texts_with_local_role = Text.objects.filter(userrole__in=UserRole.objects.filter(Q(user=user) | Q(user=None)).filter(~Q(role=None)))
    #Text.objects.filter(Q(userrole__user=user) & ~Q(userrole__role=None))
    texts_without_local_role = Text.objects.exclude(id__in=texts_with_local_role)

    texts_with_local_role_with_perm = Text.objects.filter(id__in=texts_with_local_role).filter(Q(userrole__role__permissions__codename__exact=perm_name), Q(userrole__user=user) | Q(userrole__user=None)).distinct()
    
    # global perm?
    if UserRole.objects.filter(text=None).filter(role__permissions__codename__exact=perm_name).filter(Q(user=user) | Q(user=None) ).count() != 0:    
        texts_without_local_role_with_perm = Text.objects.filter(id__in=texts_without_local_role)
    else:
        texts_without_local_role_with_perm = []
    
    ids = set([t.id for t in texts_with_local_role_with_perm]).union(set([t.id for t in texts_without_local_role_with_perm]))
    return Text.objects.filter(id__in=ids)
    
def get_viewable_comments(request, comments, text, order_by=('created',)):
    """
    Get comments visibles by user
    comments: queryset
    """
    user = get_request_user(request)
        
    if user and has_perm(request, 'can_view_unapproved_comment', text=text):
        return list(comments.order_by(*order_by))
    else:
        if has_perm(request, 'can_view_approved_comment', text=text):
            visible_comments = comments.filter(state = 'approved').order_by(*order_by)
            # filter comments with a non visible (i.e. moderated) comment in the above thread 
            comments_thread_viewable = [c for c in visible_comments if c.is_thread_full_visible()]
            return comments_thread_viewable 
        elif user and has_perm(request, 'can_view_comment_own', text=text):
            visible_comments = comments.filter(user=user).order_by(*order_by)
            # filter comments with a non visible (i.e. moderated) comment in the above thread 
            comments_thread_viewable = [c for c in visible_comments if c.is_thread_full_visible(own_user=user)]
            return comments_thread_viewable                
        else:
            return []
    
def get_viewable_activities(request=None, act_types={}, text=None):
    """
    Get activities user in request is allowed to see
    """
    from cm.security import has_perm, get_texts_with_perm, get_viewable_comments
    
    selected_activities = reduce(list.__add__,[Activity.VIEWABLE_ACTIVITIES[k] for k in act_types.keys() if act_types[k]], [])
    
    activities = Activity.objects.filter(type__in=selected_activities)
    if text:
        activities = activities.filter(text=text)
        
    if not has_perm(request, 'can_manage_workspace'):
        texts = get_texts_with_perm(request, 'can_view_text')
        activities = activities.filter(Q(text__in=texts))
        
        comments = [] 
        [comments.extend(get_viewable_comments(request, t.last_text_version.comment_set.all(), t)) for t in texts]

        activities = activities.filter(Q(comment__in=comments) | Q(comment=None))
    return activities.order_by('-created')


# won't need to be overridden, should it be moved to another file ? 
def list_viewable_comments(request, comments_list, text):
    ret = []
    for comment in comments_list :
        ret += [comment] + list_viewable_comments(request, get_viewable_comments(request, comment.comment_set, text), text)
    return ret


# decorators (simple wrappers around above functions)
def has_global_perm(perm_name, must_be_logged_in=False, redirect_field_name=REDIRECT_FIELD_NAME):
    def _dec(view_func):
        def _check_global_perm(request, *args, **kwargs):
            if must_be_logged_in and not is_authenticated(request):
                login_url = reverse('login')
                return HttpResponseRedirect('%s?%s=%s' % (login_url, redirect_field_name, urlquote(request.get_full_path())))
            
            if has_perm(request, perm_name, text=None): 
                return view_func(request, *args, **kwargs)
            
            raise UnauthorizedException('No global perm %s' % perm_name)
        _check_global_perm.__doc__ = view_func.__doc__
        _check_global_perm.__dict__ = view_func.__dict__

        return _check_global_perm
    return _dec    
    
def has_perm_on_text(perm_name, must_be_logged_in=False, redirect_field_name=REDIRECT_FIELD_NAME):    
    """
    decorator protection checking for perm for logged in user
    force logged in (i.e. redirect to connection screen if not if must_be_logged_in 
    """    
    def _dec(view_func):
        def _check_local_perm(request, *args, **kwargs):
            if cm_settings.NO_SECURITY:
                return view_func(request, *args, **kwargs)

            if must_be_logged_in and not is_authenticated(request):
                login_url = reverse('login')
                return HttpResponseRedirect('%s?%s=%s' % (login_url, redirect_field_name, urlquote(request.get_full_path())))
            
            if 'key' in kwargs: 
                text = get_object_or_404(Text, key=kwargs['key'])                
            else:
                raise Exception('no security check possible')
                                    
            if has_perm(request, perm_name, text=text): 
                return view_func(request, *args, **kwargs)
            #else:
                # TODO: (? useful ?) if some user have the perm and not logged-in : redirect to login
                #if not request.user.is_authenticated() and number_has_perm_on_text(permission, text_id) > 0:
                #    return HttpResponseRedirect('%s?%s=%s' % (login_url, redirect_field_name, urlquote(request.get_full_path())))                    
            # else : unauthorized
            
            raise UnauthorizedException('No perm %s' % perm_name)
        _check_local_perm.__doc__ = view_func.__doc__
        _check_local_perm.__dict__ = view_func.__dict__

        return _check_local_perm
    return _dec
        
def has_perm_on_comment(perm_name):    
    """
    decorator protection checking for perm for logged in user on to comment
    perm_name: 'virtual' permission name 
    """    
    def _dec(view_func):
        def _check_local_perm(request, *args, **kwargs):
            if cm_settings.NO_SECURITY:
                return view_func(request, *args, **kwargs)
            
            if 'key' in kwargs: 
                text = get_object_or_404(Text, key=kwargs['key'])
                # first try permission on text                
                if has_perm(request, perm_name, text=text) :
                    return view_func(request, *args, **kwargs)
                if 'comment_key' in kwargs:
                    comment = get_object_or_404(Comment, key=kwargs['comment_key'])
                    if has_own_perm(request, perm_name + "_own", text, comment) :
                        return view_func(request, *args, **kwargs)
                else:
                    raise Exception('no security check possible: no comment key')
            else:
                raise Exception('no security check possible: no text key')

            raise UnauthorizedException('No perm %s on comment' % perm_name)
        _check_local_perm.__doc__ = view_func.__doc__
        _check_local_perm.__dict__ = view_func.__dict__

        return _check_local_perm
    return _dec        
    


