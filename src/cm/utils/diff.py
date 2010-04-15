import difflib, string
from django.utils.translation import ugettext as _

def isatag(x): return x.startswith("<") and x.endswith(">")

def text_diff(a, b):
    res = []
    a, b = createlist(a), createlist(b)
    s = difflib.SequenceMatcher(isatag, a, b)
    for e in s.get_opcodes():
        if e[0] == "replace":
            res.append('<del class="diff modified">'+''.join(a[e[1]:e[2]]) + '</del><ins class="diff modified">'+''.join(b[e[3]:e[4]])+"</ins>")
        elif e[0] == "delete":
            res.append('<del class="diff">'+ ''.join(a[e[1]:e[2]]) + "</del>")
        elif e[0] == "insert":
            res.append('<ins class="diff">'+''.join(b[e[3]:e[4]]) + "</ins>")
        elif e[0] == "equal":
            res.append(''.join(b[e[3]:e[4]]))
        else: 
            raise "error parsing %s" %(e[0])
    return ''.join(res)

COLORS = [
'#FF0000',
'#EE0000',
'#DD0000',
'#CC0000',
'#BB0000',
'#AA0000',
'#990000',
'#880000',
'#770000',
]

from colorsys import hls_to_rgb, hsv_to_rgb

def generatePastelColors(n):
    s = .4
    v = .99
    return ['#'+''.join((hex(int(r*255))[2:],hex(int(g*255))[2:],hex(int(b*255))[2:])) for r,g,b in [hsv_to_rgb(h/200.,s,v) for h in range(1,100,100/n)]]
    

DEFAULT_COLOR = '#D9D9D9'
def get_colors(authors, last_white = False):
    """
    returns a dict for authors's colors (with last one white if 'last_white')
    """
    authors = set(authors)
    #new_colors = list(tuple(COLORS))
    new_colors = generatePastelColors(len(set(authors)))
    res = []
    if None in authors or '' in authors:
        res = [(_(u'unknown'),DEFAULT_COLOR) ]
    res.extend([(author,new_colors.pop()) for author in authors if author])
    #if authors[-1]:
    #    res[authors[-1]] = '#FFFFFF'
    return res
    

def text_history(versions, authors):
    res = versions[0]
    colors = get_colors(authors)
    for ind in range(len(versions)-1):
        author = authors[ind]
        color = colors.get(author,DEFAULT_COLOR)
        v_2 = versions[ind + 1]
        res = text_diff_add(v_2, res, color)
    return res,colors.items()

from cm.utils.html import surrond_text_node
 
def text_diff_add(a,b, color):
    res = []
    a, b = createlist(a), createlist(b)
    s = difflib.SequenceMatcher(isatag, a, b)
    for e in s.get_opcodes():
        if e[0] == "replace":
            html_chunk = ''.join(b[e[3]:e[4]])
            new_html_chunk = surrond_text_node(html_chunk,'<span style="background: %s;">' %color,'</span>')
            res.append(new_html_chunk)
            #res.append('<font style="background: %s;" class="diff modified">' %color+''.join(b[e[3]:e[4]])+"</font>")
        elif e[0] == "delete":
            pass
        elif e[0] == "insert":
            html_chunk = ''.join(b[e[3]:e[4]])
            new_html_chunk = surrond_text_node(html_chunk,'<span style="background: %s;">' %color,'</span>') 
            res.append(new_html_chunk)
            #res.append('<font style="background: %s;" class="diff">' %color+''.join(b[e[3]:e[4]]) + "</font>")
        elif e[0] == "equal":
            res.append(''.join(b[e[3]:e[4]]))
        else: 
            raise "error parsing %s" %(e[0])
    return ''.join(res)

def createlist(x, b=0):
    mode = 'char'
    cur = ''
    out = []
    for c in x:
        if mode == 'tag':
            if c == '>': 
                if b: cur += ']'
                else: cur += c
                out.append(cur); cur = ''; mode = 'char'
            else: cur += c
        elif mode == 'char':
            if c == '<': 
                out.append(cur)
                if b: cur = '['
                else: cur = c
                mode = 'tag'            
            elif c in string.whitespace: out.append(cur+c); cur = ''
            else: cur += c
    out.append(cur)
    return filter(lambda x: x is not '', out)

# 

from cm.ext.diff_match_patch import diff_match_patch

class diff_match_patch2(diff_match_patch):
    def diff_prettyHtml_one_way(self, diffs, way=False, mode='red'):
      """Convert a diff array into a pretty HTML report.
    
      Args:
        diffs: Array of diff tuples.
        way: [None, 1, 2]
        mode: ['ins_del', 'red']
    
      Returns:
        HTML representation.
      """
      html = []
      i = 0
      for (op, data) in diffs:
        text = data #(data.replace("&", "&amp;").replace("<", "&lt;")
                   #.replace(">", "&gt;").replace("\n", "&para;<BR>"))
        if op == self.DIFF_INSERT and (not way or way==1):
            if mode=='red':
                html.append('<span class="diffchange-ins">%s</span>' % (text))
            else:
                html.append('<ins>%s</ins>' % (text))
                
        elif op == self.DIFF_DELETE and (not way or way==2):
            if mode=='red':
                html.append('<span class="diffchange-del">%s</span>'% (text))
            else:
                html.append('<del>%s</del>'% (text))                
        elif op == self.DIFF_EQUAL:
          html.append("<SPAN>%s</SPAN>" % (text))
        if op != self.DIFF_DELETE:
          i += len(data)
      return "".join(html)