import re

from django.template import Library, Node, Variable, TemplateSyntaxError

from cm.security import has_perm


register = Library()


class LocalTextPermsNode(Node):
    def __init__(self, request, text, perm_name, var_name):
        self.request = Variable(request)
        self.text = Variable(text)
        self.perm_name = perm_name
        self.var_name = var_name

    def render(self, context):
        context[self.var_name] = has_perm(self.request.resolve(context),
                                          self.perm_name,
                                          self.text.resolve(context))
        return ''


@register.tag(name="get_local_text_perm")
def do_local_text_perm(parser, token):
    try:
        # Splitting by None == splitting by spaces.
        tag_name,arg = token.contents.split(None, 1)
    except ValueError:
        raise TemplateSyntaxError, "%r tag requires arguments" % token.contents.split()[0]
    m = re.search(r'(.*?) (.*?) (.*?) as (\w+)', arg)
    if not m:
        raise TemplateSyntaxError, "%r tag had invalid arguments" % tag_name
    request, text, perm_name, var_name = m.groups()
    #if not (format_string[0] == format_string[-1] and format_string[0] in ('"', "'")):
    #    raise template.TemplateSyntaxError, "%r tag's argument should be in quotes" % tag_name
    return LocalTextPermsNode(request, text, perm_name, var_name)


class LocalPermsNode(Node):
    def __init__(self, request, perm_name, var_name):
        self.request = Variable(request)
        self.perm_name = perm_name
        self.var_name = var_name

    def render(self, context):
        context[self.var_name] = has_perm(self.request.resolve(context),
                                          self.perm_name,
                                          None)
        return ''


@register.tag(name="get_local_perm")
def do_local_perm(parser, token):
    try:
        # Splitting by None == splitting by spaces.
        tag_name,arg = token.contents.split(None, 1)
    except ValueError:
        raise TemplateSyntaxError, "%r tag requires arguments" % token.contents.split()[0]
    m = re.search(r'(.*?) (.*?) as (\w+)', arg)
    if not m:
        raise TemplateSyntaxError, "%r tag had invalid arguments" % tag_name
    request, perm_name, var_name = m.groups()
    #if not (format_string[0] == format_string[-1] and format_string[0] in ('"', "'")):
    #    raise template.TemplateSyntaxError, "%r tag's argument should be in quotes" % tag_name
    return LocalPermsNode(request, perm_name, var_name)
