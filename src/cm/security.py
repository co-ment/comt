from hashlib import sha1

from django.contrib.auth import REDIRECT_FIELD_NAME
from django.shortcuts import get_object_or_404
from piston.utils import rc

from cm.models import *
from cm import cm_settings
from cm.exception import UnauthorizedException
from cm.cm_settings import DECORATED_CREATORS


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
    try:
      myself = request.GET.get('name', None)
    except AttributeError:
      myself = None
    key = sha1(str((settings.SITE_URL, 'has_perm', (user, myself, text, perm_name)))).hexdigest()
    val = cache.get(key)
    if val != None:
      return val

    if user and user.is_staff:
        cache.set(key, True)
        return True
    
    if not text:
        ret = UserRole.objects.filter(user=user, text=None).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0
        cache.set(key, ret)
        return ret
    else:
        # local role only ADDS permissions:
        # either a global or a local role with appropriate permissions
        #return UserRole.objects.filter(user=user).filter(Q(text=text) | Q(text=None)).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0

        # local role OVERRIDES global role:
        if UserRole.objects.filter(Q(user=user),Q(text=text),~Q(role=None)): # if non void local role
            ret = UserRole.objects.filter(user=user).filter(text=text).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0
            cache.set(key, ret)
            return ret
        else:
            # local role for anon users
            # OR global role for anon users
            # OR global role for this user
            ret = UserRole.objects.filter(Q(user=user) | Q(user=None)).filter(Q(text=None) | Q(text=text)).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0            
            cache.set(key, ret)
            return ret
            #return UserRole.objects.filter(user=user).filter(text=None).filter(Q(role__permissions__codename__exact=perm_name)).count() != 0
        

def has_own_perm(request, perm_name, text, comment):
    
    user = get_request_user(request)
    
    if not user:
        return False
    
    # bypass sec if NO_SECURITY
    if cm_settings.NO_SECURITY:
        return True
    
    # make sure perm exist
    assert Permission.objects.get(codename=perm_name)

    try:
      myself = request.GET.get('name', None)
    except AttributeError:
      myself = None
    key = sha1(str((settings.SITE_URL, 'has_own_perm', (user, myself, text, comment, perm_name)))).hexdigest()
    val = cache.get(key)
    if val != None:
      return val
    
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
        cache.set(key, False)
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
        cache.set(key, False)
        return False
    
    actual_own_user = False
    if comment.user == request.user:
      if DECORATED_CREATORS:
        if myself == comment.get_name():
          actual_own_user = True
      else:
        actual_own_user = True
    ret = (actual_own_user and has_perm(request, perm_name, text=text)) 
    cache.set(key, ret)
    return ret
        

def is_authenticated(request):
    # We customize this to be able to monkey patch it if needed
    return request.user.is_authenticated()
    

## Content access functions

def get_texts_with_perm(request, perm_name):
    assert Permission.objects.get(codename=perm_name)

    user = get_request_user(request)
    
    key = sha1(str((settings.SITE_URL, 'get_texts_with_perm', (user, perm_name)))).hexdigest()
    val = cache.get(key)
    if val != None:
      return val

    if user and user.is_staff:
        ret = Text.objects.all()
        cache.set(key, ret)
        return ret
    
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
    ret = Text.objects.filter(id__in=ids)
    cache.set(key, ret)
    return ret
    

def get_viewable_comments(request, comments, text, order_by=('created',)):
    """
    Get comments visibles by user
    comments: queryset
    """
    user = get_request_user(request)
    try:
      myself = request.GET.get('name', None)
    except AttributeError:
      myself = None
    key = sha1(str((settings.SITE_URL, 'get_viewable_comments', (user, myself, text, comments)))).hexdigest()
    val = cache.get(key)
    if val != None:
      return val
        
    if user and has_perm(request, 'can_view_unapproved_comment', text=text):
        ret = list(comments.order_by(*order_by))
        cache.set(key, ret)
        return ret
    else:
        # Fetch role_model to process specific behaviour for role_teacher model
        from cm.models import ApplicationConfiguration
        role_model = ApplicationConfiguration.get_key('workspace_role_model')

        if has_perm(request, 'can_view_approved_comment', text=text):
            visible_comments = comments.filter(state = 'approved').order_by(*order_by)
            # filter comments with a non visible (i.e. moderated) comment in the above thread 
            comments_thread_viewable = [c for c in visible_comments if c.is_thread_full_visible()]

            # for role_teacher role model, do not show 'individual student' comments
            if (role_model == 'teacher'):
              unfiltered_comments = list(comments_thread_viewable)
              for c in unfiltered_comments:
                if c.user_id and c.user_id != 1:
                  try:
                    userrole = UserRole.objects.get(user=c.user, text=text)
                  except:
                    userrole = UserRole.objects.get(user=None, text=None)
                  if userrole.role_id == None:
                    role = c.user.get_profile().global_userrole().role
                  else:
                    role = userrole.role
                  if role.name == 'Individual student':
                    comments_thread_viewable.remove(c)
            cache.set(key, comments_thread_viewable)
            return comments_thread_viewable 
        elif user and has_perm(request, 'can_view_comment_own', text=text):
            if DECORATED_CREATORS:
              visible_comments = comments.filter(name=myself).order_by(*order_by)
            else:
              visible_comments = comments.filter(user=user).order_by(*order_by)

            # for role_teacher role model, add 'teacher' comments
            if (role_model == 'teacher'):
              with_teachers = []
              for u in list(User.objects.filter(userrole__role__name = 'Teacher')):
                with_teachers.append(u.id)

              # add admin and current user
              admin =  User.objects.get(id=1)
              with_teachers.append(admin.id)
              if DECORATED_CREATORS:
                visible_comments = comments.filter(Q(user__id__in=with_teachers) | Q(name=myself)).order_by(*order_by)
              else:
                with_teachers.append(user.id)
                visible_comments = comments.filter(user__id__in=with_teachers).order_by(*order_by)

            # filter comments with a non visible (i.e. moderated) comment in the above thread 
            comments_thread_viewable = [c for c in visible_comments if c.is_thread_full_visible(own_user=user)]
            cache.set(key, comments_thread_viewable)
            return comments_thread_viewable                
        else:
            cache.set(key, [])
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
                raise UnauthorizedException('Should be logged in')
            
            if has_perm(request, perm_name, text=None): 
                return view_func(request, *args, **kwargs)
            
            raise UnauthorizedException('No global perm %s' % perm_name)
        _check_global_perm.__doc__ = view_func.__doc__
        _check_global_perm.__dict__ = view_func.__dict__

        return _check_global_perm
    return _dec    


def has_perm_on_text_api(perm_name, must_be_logged_in=False, redirect_field_name=REDIRECT_FIELD_NAME):
    return _has_perm_on_text(perm_name, must_be_logged_in, redirect_field_name, api=True)
    

def has_perm_on_text(perm_name, must_be_logged_in=False, redirect_field_name=REDIRECT_FIELD_NAME, api=False):
    return _has_perm_on_text(perm_name, must_be_logged_in, redirect_field_name, api)


def _has_perm_on_text(perm_name, must_be_logged_in=False, redirect_field_name=REDIRECT_FIELD_NAME, api=False):
    """
    decorator protection checking for perm for logged in user
    force logged in (i.e. redirect to connection screen if not if must_be_logged_in 
    """    
    def _dec(view_func):
        def _check_local_perm(request, *args, **kwargs):
            if cm_settings.NO_SECURITY:
                return view_func(request, *args, **kwargs)

            if must_be_logged_in and not is_authenticated(request):
                if not api:
                    raise UnauthorizedException('Should be logged in')
                else:
                    return rc.FORBIDDEN

            
            if 'key' in kwargs: 
                text = get_object_or_404(Text, key=kwargs['key'])                
            else:
                raise Exception('no security check possible')
                
            # in api, the view has an object as first parameter, request is args[0]
            if not api:                
                req = request
            else:                    
                req = args[0]     
            if has_perm(req, perm_name, text=text): 
                return view_func(request, *args, **kwargs)
            #else:
                # TODO: (? useful ?) if some user have the perm and not logged-in : redirect to login
                #if not request.user.is_authenticated() and number_has_perm_on_text(permission, text_id) > 0:
                #    return HttpResponseRedirect('%s?%s=%s' % (login_url, redirect_field_name, urlquote(request.get_full_path())))                    
            # else : unauthorized
            
            if not api:
                raise UnauthorizedException('No perm %s' % perm_name)
            else:
                return rc.FORBIDDEN

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


def has_global_perm_or_perm_on_text(global_perm_name, perm_name, must_be_logged_in=False, redirect_field_name=REDIRECT_FIELD_NAME, api=False):
  def _dec(view_func):
    def _check_global_or_local_perm(request, *args, **kwargs):
      if must_be_logged_in and not is_authenticated(request):
        if not api:
          raise UnauthorizedException('Should be logged in')
        else:
          return rc.FORBIDDEN

      if has_perm(request, global_perm_name, text=None): 
        return view_func(request, *args, **kwargs)
            
      if cm_settings.NO_SECURITY:
        return view_func(request, *args, **kwargs)

      if 'key' in kwargs: 
        text = get_object_or_404(Text, key=kwargs['key'])                
      else:
        raise Exception('no security check possible')
                
      # in api, the view has an object as first parameter, request is args[0]
      if not api:                
        req = request
      else:                    
        req = args[0]     

      if has_perm(req, perm_name, text=text): 
        return view_func(request, *args, **kwargs)
            
      if not api:
        raise UnauthorizedException('No perm %s' % perm_name)
      else:
        return rc.FORBIDDEN

      raise UnauthorizedException('No global perm %s nor local perm %s' %(global_perm_name, perm_name))

    _check_global_or_local_perm.__doc__ = view_func.__doc__
    _check_global_or_local_perm.__dict__ = view_func.__dict__

    return _check_global_or_local_perm
  return _dec
