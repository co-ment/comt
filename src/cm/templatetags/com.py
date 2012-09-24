from django import template
from django.template import Node, NodeList, Template, Context, Variable

register = template.Library()

def do_current_time(parser, token):
    try:
        # split_contents() knows not to split quoted strings.
        tag_name, format_string = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires a single argument" % token.contents.split()[0]
    if not (format_string[0] == format_string[-1] and format_string[0] in ('"', "'")):
        raise template.TemplateSyntaxError, "%r tag's argument should be in quotes" % tag_name
    return CurrentTimeNode(format_string[1:-1])


import datetime
class CurrentTimeNode(template.Node):
    def __init__(self, format_string):
        self.format_string = format_string
    def render(self, context):
        return datetime.datetime.now().strftime(str(self.format_string))


register.tag('current_time', do_current_time)

def do_choice_string(parser, token):
    try:
        # split_contents() knows not to split quoted strings.
        alls = token.split_contents()
        all_tokens = alls[1:]
        #if len(all_tokens) == 4 or (len(all_tokens)-3) % 4 != 0:
        #    raise template.TemplateSyntaxError, 'A multiple of 3 arguments must be provided'
        return ChoiceStringNode(all_tokens)
    except:
        raise 
    #if not (format_string[0] == format_string[-1] and format_string[0] in ('"', "'")):
    #    raise template.TemplateSyntaxError, "%r tag's argument should be in quotes" % tag_name
        
import datetime
class ChoiceStringNode(template.Node):
    def __init__(self, *args):
        new_args = [u'or'] + args[0]
        self.data = []
        for index in range((len(new_args)-1) / 4):
            or_tag =  new_args[index*4]
            test1 =  template.Variable(new_args[index*4+1])
            test2 =  template.Variable(new_args[index*4+2])
            string =  new_args[index*4+3]
            self.data.append((test1, test2, string))
        self.default = new_args[-1]
        
        
    def render(self, context):
        for test1,test2,string in self.data:
            try:
                test1_val = test1.resolve(context)
            except:
                test1_val = None
            try:
                test2_val = test2.resolve(context)
            except:
                test2_val = None
            if test1 and test2_val == test1_val:
                return string
        return self.default
        #return datetime.datetime.now().strftime(str(self.format_string))

register.tag('choice_string', do_choice_string)

from django.core.urlresolvers import reverse, NoReverseMatch

class URLNode(Node):
    def __init__(self, view_name, admin_key, args, kwargs, asvar):
        self.view_name = view_name
        self.args = args
        self.kwargs = kwargs
        self.asvar = asvar
        self.admin_key = admin_key

    def render(self, context):
        try:
            admin_key = Variable(self.admin_key).resolve(context)
        except template.VariableDoesNotExist:
            admin_key = None
            
        args = [arg.resolve(context) for arg in self.args]
        kwargs = dict([(smart_str(k,'ascii'), v.resolve(context))
                       for k, v in self.kwargs.items()])
        
        
        # Try to look up the URL twice: once given the view name, and again
        # relative to what we guess is the "main" app. If they both fail, 
        # re-raise the NoReverseMatch unless we're using the 
        # {% url ... as var %} construct in which cause return nothing.
        url = ''
        try:
            if admin_key:
                args.append(admin_key)
                url = reverse(self.view_name + '-admin', args=args, kwargs=kwargs)
            else:
                url = reverse(self.view_name, args=args, kwargs=kwargs)
        except NoReverseMatch:
            raise
                    
        return url

@register.filter
def in_list(value,arg):
    return value in arg

@register.filter
def in_dict(value,arg):
    return arg.get(value,None)


import sys
@register.filter
def int_display(value):
    if value == sys.maxint:
        return '-'
    else:
        return str(value)
int_display.is_safe = True

from django.utils.translation import ugettext as _
from django.utils.dateformat import format
from datetime import datetime
from time import struct_time
from cm.utils.timezone import tz_convert
from pytz import UnknownTimeZoneError
from cm.utils.log import error_mail_admins
@register.filter
def local_date(value, tz=None):
    """Formats a date according to the given local date format."""
    if not value:
        return u''    
    if isinstance(value,struct_time): 
        publication_date = datetime(value.tm_year,value.tm_mon,value.tm_mday,value.tm_hour,value.tm_min,value.tm_sec)

    try:
        value = tz_convert(value,tz)
    except UnknownTimeZoneError:
        error_mail_admins()
    
    arg = _(u"F j, Y \\a\\t g:i a") 
    return format(value, arg)
local_date.is_safe = False

# TODO: this should be removed as soon
# as http://code.djangoproject.com/ticket/10427 lands into core
from django import forms

@register.filter(name='field_value')
def field_value(field):
    value = field.form.initial[field.name]
    if not value:
        return ''
    if isinstance(field.field, forms.ChoiceField):
        value = str(value)
        for (val, desc) in field.field.choices:
             if val == int(value):
                 return desc
    return value


@register.tag(name="up_down")
def do_up_down(parser, token):
    try:
        _, sort_name = token.split_contents()
        nodelist = parser.parse(('endup_down',))
        parser.delete_first_token()        
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires 3 arguments" % token.contents.split()[0]
    return UpDownNode(sort_name, nodelist)

VAR = 'order'

UP_CLASS = 'sort_up'
DOWN_CLASS = 'sort_down'
DISABLE_CLASS = 'sort_disable'


class UpDownNode(template.Node):
    def __init__(self, sort_name, nodelist):
        self.sort_name = sort_name 
        self.nodelist = nodelist 
        
    def render(self, context):
        try:
            order = Variable('request.GET.%s'%VAR).resolve(context)
        except:
            order = None
        if order == self.sort_name:
            node_class = DOWN_CLASS
            if self.sort_name[0]=="-":
                to_link = self.sort_name[1:]
            else:
                to_link = '-%s' %self.sort_name
        elif order and order[0]=='-' and order[1:] == self.sort_name:
            node_class = UP_CLASS
            to_link = self.sort_name
        else:
            node_class = DISABLE_CLASS 
            to_link = self.sort_name
        output = self.nodelist.render(context)
        request = Variable('request').resolve(context)        
        new_get = request.GET.copy()
        new_get['order'] = to_link
        if 'page' in new_get:
            del new_get['page'] # new order: don't keep page info
        return '<a class="%s" href="?%s">%s</a>' %(node_class, new_get.urlencode(),output)


from cm.security import get_viewable_comments
from cm.models import Text

@register.filter(name='nb_comments')
def nb_comments(text, request):
    if type(text) == Text:
        return len(get_viewable_comments(request, text.last_text_version.comment_set.all(), text))
    else:
        # text is text version
        return len(get_viewable_comments(request, text.comment_set.all(), text.text))
## number tags

from cm.security import get_texts_with_perm, get_viewable_comments
class FakeRequest(object):
    def __init__(self, user):
        self.user = user
        
class NbTexts(template.Node):
    def __init__(self, var_name):
        self.var_name = var_name 
        
    def render(self, context):
        request = Variable('request').resolve(context)
        context[self.var_name] = get_texts_with_perm(request, 'can_view_text').count()
        return ''

@register.tag(name="nb_texts")
def do_nb_texts(parser, token):
    try:
        tag_name, _as, var_name = token.contents.split()        
    except ValueError:
        raise
    return NbTexts(var_name)

from cm.models import UserProfile
class NbUsers(template.Node):
    def __init__(self, var_name):
        self.var_name = var_name 
        
    def render(self, context):
        context[self.var_name] = UserProfile.objects.all().count()
        return ''

@register.tag(name="nb_users")
def do_nb_users(parser, token):
    try:
        tag_name, _as, var_name = token.contents.split()        
    except ValueError:
        raise    
    return NbUsers(var_name)

from cm.models import Comment
class NbComments(template.Node):
    def __init__(self, text, var_name):
        self.text = text
        self.var_name = var_name         
        
    def render(self, context):
        text = Variable(self.text).resolve(context)
        request = Variable('request').resolve(context)
        context[self.var_name] = len(get_viewable_comments(request, text.last_text_version.comment_set.all(), text))
        return ''        

@register.tag(name="nb_comments")
def do_nb_comments(parser, token):
    tag_name, text, _as, var_name = token.split_contents()
    return NbComments(text, var_name)

class NewParams(template.Node):
    def __init__(self, params):
        self.params = params
        
    def render(self, context):
        request = Variable('request').resolve(context)
        new_get = request.GET.copy()
        for i in range(len(self.params)/2):
            k = self.params[i][1:-1]            
            v = self.params[i+1]
            if not v.startswith("'") or not v.endswith("'"):
                v = Variable(v).resolve(context)
            else:
                v = v[1:-1]
            new_get[k]=v
        return new_get.urlencode()

@register.tag(name="newparams")
def do_newparams(parser, token):
    all_params = token.split_contents()
    if len(all_params) % 1 != 0:
        raise template.TemplateSyntaxError, "%r tag requires even number of arguments" % token.contents.split()[0]
    all_params = all_params[1:]    
    return NewParams([a for a in all_params])

@register.filter(name='invneg')
def do_invneg(value, arg):
    """."""
    return int(arg) - int(value)

@register.filter(name='url_args')
def url_args(url):
    if '?' in url:
        return '&'
    else:
        return '?'

@register.filter
def leading_zeros(value, desired_digits):
  """
  Given an integer, returns a string representation, padded with [desired_digits] zeros.
  """
  int_val = int(value)
  if (int_val > 0):
    sign = '+'
  else:
    sign = '-'
  num_zeros = int(desired_digits) - len(str(abs(int_val)))
  padded_value = []
  while num_zeros >= 1:
    padded_value.append("0") 
    num_zeros = num_zeros - 1
  padded_value.append(str(abs(int_val)))
  return sign + "".join(padded_value)
