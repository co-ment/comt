from django import template
from django.template import Node, NodeList, Template, Context, Variable
from datetime import timedelta

register = template.Library()

ALL_TYPES = {u'seconds': timedelta(seconds=1),
             u'minute': timedelta(seconds=60),
             u'1/4hour': timedelta(seconds=3600/4),
             u'1/2hour': timedelta(seconds=3600/2),
             u'hour': timedelta(seconds=3600),
             u'1/4day': timedelta(seconds=21600),
             u'1/2day': timedelta(seconds=43200),
             u'day': timedelta(days=1),
             u'week': timedelta(days=7),
             u'month': timedelta(days=31),
             u'year': timedelta(days=365),
             }

TYPE_FULL_SHORT = {
             u'hour': (60, u'minutes'),
#             u'day': (24*4, u'1/4hour'),
             u'day': (24, u'hour'),
#             u'week': (7*24, u'hour'),
             u'week': (7*24/4, u'1/4day'),             
#             u'week': (7*24/8, u'1/2day'),             
#             u'month': (31*24, u'hour'),
             u'month': (31, u'day'),
             } 

KINDS = (u"''",u"'raw'")

def do_activity(parser, token):
    try:
        tag_name, text, user, type, nb_type, action, kind = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires 6 arguments" % token.contents.split()[0]
    if type[0]=="'" and type[-1]=="'" and type[1:-1] not in ALL_TYPES.keys():
        raise template.TemplateSyntaxError, "third tag's argument should be one of %s or a variable" % ','.join(ALL_TYPES.keys())
    if kind not in KINDS:
        raise template.TemplateSyntaxError, "sixth tag's argument should be one of %s" % ','.join(KINDS)
    if nb_type != u'auto':
        try:        
            nb_type = int(nb_type)
        except ValueError:
            raise template.TemplateSyntaxError, "fourth tag's argument should be one and int"
    return ActivityNode(text, user, type, nb_type, action[1:-1], kind[1:-1])

from cm.activity import get_activity

class ActivityNode(template.Node):
    def __init__(self, text, user, delta, nb_type, action, kind):
        if text not in ['all']:
            self.text = template.Variable(text)
        else:
            self.text = text
        if user not in ['None','all']:
            self.user = template.Variable(user)
        else:
            self.user = user
            
        if delta[0]=="'" and delta[-1]=="'":
            self.delta = delta[1:-1]
            self.delta_var = False
        else:
            self.delta = template.Variable(delta)
            self.delta_var = True
            
        self.nb_type = nb_type
        self.action = action
        self.kind = kind
        
    def render(self, context):
        if self.text == 'all':
            text = 'all'
        else:
            text = self.text.resolve(context)

        if self.delta_var:
            delta = self.delta.resolve(context)
        else:
            delta = self.delta

        if self.nb_type == u'auto':
            self.nb_type = TYPE_FULL_SHORT[delta][0]
            delta = TYPE_FULL_SHORT[delta][1]
            
        delta = ALL_TYPES[delta]

        if self.user == 'None':
            user = None
        elif self.user == 'all':
            user = 'all'
        else:
            user = self.user.resolve(context)

        return get_activity(text,
                            user,
                            nb_slots=self.nb_type,
                            slot_timedelta=delta,
                            action=self.action,
                            kind=self.kind)


register.tag('activity', do_activity)
