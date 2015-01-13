# XXX: is this still in used? Some of the imports (markdown, docutils)
# dont work with the current requirements.


########## converters
from django.core.cache import cache

# adapted [to django] from http://code.activestate.com/recipes/325205/
def memoize(f):
    def g(*args, **kwargs):
        key = ( f.__name__, f, tuple(args), frozenset(kwargs.items()) )
        val = cache.get(key)
        if not val:
            val = f(*args, **kwargs)
            cache.set(key,val)
        return val
    return g


def to_unicode(string):
    if type(string) != 'unicode':
        return string.decode('utf8')
    else:
        return string 


def to_utf8(string):
    if type(string) != 'str':
        return string.encode('utf8')
    else:
        return string
 

#@memoize
def rst_to_html(rst):
    from docutils import core, io
    html, pub = _get_html_and_pub(rst)
    parts = pub.writer.parts
    return parts['stylesheet']+parts['body']


#@memoize
def rst_to_fullhtml(rst):
    html, pub = _get_html_and_pub(rst)
    parts = pub.writer.parts
    return html 
    #return '<html><head>' + parts['stylesheet'] + '</head><body>' + parts['body'] + '</body></html>' 

def markdown_to_html(markdown):
    return _markdown_to_html(markdown)

def markdown_to_fullhtml(markdown):
    return '<html><body>'+_markdown_to_html(markdown) + '</body></html>'

def _markdown_to_html(markdown):
    from markdown import Markdown
    md = Markdown()
    html = md.convert(markdown)
    return html
    
def _get_html_and_pub(rst):
    from docutils import core, io
    html, pub = core.publish_programmatically(
            source_class=io.StringInput, source=rst,
            source_path=None,
            destination_class=io.StringOutput, destination=None,
            destination_path=None,
            reader=None, reader_name='standalone',
            parser=None, parser_name='restructuredtext',
            writer=None, writer_name='HTML',
            settings=None, settings_spec=None, settings_overrides=None,
            config_section=None, enable_exit_status=None)
    return html, pub

#@memoize
def html_to_pdf(html):
    html = to_utf8(html)
    
    import sx.pisa3 as pisa
    import StringIO
    dst = StringIO.StringIO()
    result = pisa.CreatePDF(html, dst)
    if not result.err:    
        pdf = dst.getvalue()
        dst.close()
        return pdf
    else:
        return None

# http://www.aaronsw.com/2002/html2text/
#@memoize    
def html_to_markdown(html):
    from com.ext.html2text import html2text
    return html2text(html)

########## formats

FORMATS = {
    'HTML': {'name': 'HTML',
             'to_format': {'Markdown': html_to_markdown, }
    },
    'FULLHTML': {'name': 'FULLHTML',
                 'to_format': {'PDF': html_to_pdf, }
    },
    'RST': {'name': 'reStructuredText',
            'to_format': {'HTML': rst_to_html,
                          'FULLHTML': rst_to_fullhtml,
            }
    },

    'Markdown': {'name': 'Markdown',
                 'to_format': {'HTML': markdown_to_html,
                               'FULLHTML': markdown_to_fullhtml,
                 }
    },
    'Textile': {'name': 'Textile',
    },
    'PDF': {'name': 'PDF',
    },
}

CHOICES_FORMATS = [ (k,v.get('name')) for k,v in FORMATS.items()]

INPUT_FORMATS = ['RST','Markdown']

DEFAULT_INPUT_FORMAT = 'Markdown'

CHOICES_INPUT_FORMATS = [(k, v.get('name')) for k, v in FORMATS.items()
                         if k in INPUT_FORMATS]


def get_supported_conversions(from_format):
    return FORMATS[from_format]['to_format'].keys()


def is_supported_conversion(from_format, to_format):
    infos = FORMATS.get(from_format)
    return infos.get('to_format') and infos.get('to_format').get(to_format)
 

def convert(content, from_format, to_format):
    if is_supported_conversion(from_format, to_format):
        infos = FORMATS.get(from_format)
        conv_fun = infos.get('to_format').get(to_format)
        return conv_fun(content)
    else:
        pass        