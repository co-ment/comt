from pandoc_converters import pandoc_convert
import chardet 
from cm.utils.string_utils import to_unicode 
import re
import os
from oo_converters import extract_css_body


# TODO: move that in text_base: save images
def convert_from_mimetype(file_name, mime_type, format):
    input = open(file_name, 'r').read()
    return _convert_from_mimetype(input, mime_type, format)


def _convert_from_mimetype(input, mime_type, format):
    #input = to_unicode(input)
        
    attachs = []
    attachs_dir = None
    ##############################
    # OO/MS-Word
    if mime_type in ['application/vnd.oasis.opendocument.text',
                     'application/msword',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                     'application/rtf',
                     'text/rtf',
                     ]:
        
        from cm.cm_settings import USE_ABI
        if USE_ABI:
          from abi_converters import AbiFileConverter
          converter = AbiFileConverter()
          html_input, attachs = converter.convert_to_html(input)
          html_input = re.sub(r' awml:style="[^"]*"', '', html_input)
          converted_input = pandoc_convert(html_input, 'html', format)
        else:
          html_input, xhtml_input, attachs = convert_oo_to_html_and_xhtml(input)
          if format == 'html':
                _not_used_css, converted_input = extract_css_body(xhtml_input)
                #converted_input = xhtml_input
        
          converted_input = pandoc_convert(html_input, 'html', format)
        
    ##############################
    # latex
    elif mime_type in ['application/x-latex','text/x-tex',]:
        converted_input = pandoc_convert(to_unicode(input), 'latex', format)
    
    ##############################
    # anything looks like code: put them into markdown citation
    elif mime_type.startswith('text/x-') or mime_type in ['application/x-ruby',]:
        converted_input = markdown_from_code(input)

    ##############################
    # html
    elif mime_type in ['text/html', 'application/xhtml+xml']:
        if format == 'html':
            converted_input = input
        
        converted_input = pandoc_convert(input, 'html', format)
    ##############################
    # anything looks like text -> markdown
    elif mime_type in ['text/plain',
                       'text/english',
                       'text/enriched'
                      ]:
        converted_input = to_unicode(input)
    ##############################
    # default case: assume it's text
    else:
        converted_input = to_unicode(input)


    return converted_input, attachs
    
def fix_img_path(html, xhtml, imgs):
    """
    imgs : name --> path
    """
    finder_re = 'src[\s]*=[\s]*\"((?:(?!https?))[^\"]*)\"'
    len_res_html = len(re.findall(finder_re, html, re.IGNORECASE))
    len_res_xhtml = len(re.findall(finder_re, xhtml, re.IGNORECASE))
    res_html = re.finditer(finder_re, html, re.IGNORECASE)
    res_xhtml = re.finditer(finder_re, xhtml, re.IGNORECASE)
    result = []
    last_index = 0
    for match_xhtml in res_xhtml:
        img_path = '' 
        try:
            match_html = res_html.next()
            if match_html:
                img_name = match_html.group(1)
                img_path = os.path.split(img_name)[-1]
        except StopIteration:
            # TODO : report pb
            pass 
        offset = len(match_xhtml.group(0)) - len(match_xhtml.group(1))
        result.append(xhtml[last_index:match_xhtml.start() + offset - 1])
        result.append(img_path)
        last_index = match_xhtml.end() - 1 # -1 because trailing "
    result.append(xhtml[last_index:len(xhtml)])
    return u''.join(result)

def convert_oo_to_html(input):
    from oo_converters import convert    
    html_input, images = convert(input, 'html')
    
    enc = chardet.detect(html_input)['encoding']
    try_encodings = [enc, 'utf8', 'latin1']
    for encoding in try_encodings:
        try:
            res_content_html = unicode(html_input, encoding)
            break;
        except UnicodeDecodeError:
            pass
    if not res_content_html:
        raise Exception('UnicodeDecodeError: could not decode')
    return res_content_html, images

def fix_html_img_path(html):
    return html.replace('IMG SRC="../outdir/','IMG SRC="')
    
def convert_oo_to_html_and_xhtml(input): 
    from oo_converters import convert   
    html_input, images = convert(input, 'html')
    xhtml_input, _not_used_ = convert(input, 'xhtml')
    enc = chardet.detect(xhtml_input)['encoding']
    try_encodings = [enc, 'utf8', 'latin1']
    for encoding in try_encodings:
        try:
            res_content_html = unicode(html_input, encoding)
            res_content_xhtml = unicode(xhtml_input, encoding)
            break;
        except UnicodeDecodeError:
            pass

    res_content_xhtml = fix_img_path(res_content_html, res_content_xhtml, images)
    res_content_html = fix_html_img_path(res_content_html)
    
    if not res_content_html or not res_content_xhtml:
        raise Exception('UnicodeDecodeError: could not decode')
    return res_content_html, cleanup(res_content_xhtml), images
        
def cleanup(string):
    return string.replace(u'\xc2\xa0',u'')

def markdown_from_code(code):
    CODE_INDICATOR = "    " # 4 spaces
    return '\n'.join([CODE_INDICATOR + line for line in code.split('\n')])

        
