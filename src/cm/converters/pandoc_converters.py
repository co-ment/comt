# python 2.5 compat
from __future__ import with_statement
from cm.utils.cache import memoize, dj_memoize
######
## This module requires pandoc v > 1.0 (pandoc & markdown executables) 
######

from subprocess import Popen, PIPE, call
import os
from tempfile import mkstemp
import StringIO
import tidy
from cm.utils.string_utils import to_unicode
from xml.dom.minidom import parseString
import re

PANDOC_BIN = "pandoc"
PANDOC_OPTIONS = " --sanitize-html --email-obfuscation=none "
PANDOC_OPTIONS_RAW = " -R --email-obfuscation=none "

MARKDOWN2PDF_BIN = "markdown2pdf"

# make sure binaries are available
from cm.utils.system import bin_search
bin_search(PANDOC_BIN)
bin_search(MARKDOWN2PDF_BIN)

# pandoc capabilities
INPUT_FORMATS = ['native', 'markdown', 'rst', 'html', 'latex']
OUTPUT_FORMATS = ['native', 'html', 's5', 'docbook', 'opendocument', 'odt', 'latex', 'context', 'texinfo', 'man', 'markdown', 'rst', 'mediawiki', 'rtf']

# add pdf output using markdown2pdf
OUTPUT_FORMATS.append('pdf')

# input formats
CHOICES_INPUT_FORMATS = [(f, f) for f in ['markdown', 'rst', 'html']]

DEFAULT_INPUT_FORMAT = 'markdown'

_PANDOC_ENCODING = 'utf8'

@dj_memoize
def pandoc_convert(content, from_format, to_format, full=False, raw=False):
    """
    Convert markdown content to pdf
    
    >>> res = pandoc_convert('<span>dssd', 'html', 'pdf')
    """
    # pandoc does not react well when html is not valid
    # use tidy to clean html  
    if from_format == 'html':
        try:
            content = do_tidy(content)
        except:
            # tidy fails ... try pandoc anyway...
            content = to_unicode(content)
    # if to_format is pdf: use markdown2pdf
    if to_format == 'pdf':        
        if from_format != 'markdown':
            content = pandoc_convert(content, from_format, 'markdown', True)
        return pandoc_markdown2pdf(content)
    return pandoc_pandoc(content, from_format, to_format, full, from_format==to_format=='html') # use raw pandoc convertion if html->html

def content_or_file_name(content, file_name):
    if not content and not file_name:
        raise Exception('You should provide either a content or a file_name')
    if content and file_name:
        raise Exception('You should not provide a content AND a file_name')

    if file_name:
        fp = file(file_name)
        content = fp.read()
        fp.close()

    return content

@dj_memoize
def do_tidy(content=None, file_name=None):
    """
    Tidy (html) content
    
    >>> res = do_tidy('<span>sdd')
    """
    content = content_or_file_name(content, file_name)
    
    tidy_options = dict(output_xhtml=1, 
                        add_xml_decl=0, 
                        indent=0, 
                        tidy_mark=0,
                        logical_emphasis=1,
                        wrap=0,
                        input_encoding='utf8',
                        output_encoding='utf8',
                        )
    tidyied_content = tidy.parseString(to_unicode(content).encode('utf8'), **tidy_options)
    tidyied_content = str(tidyied_content)
    if content and not tidyied_content.strip():
        raise Exception('Content could not be tidyfied') 
    return str(tidyied_content).decode('utf8')


def get_filetemp(mode="r", suffix=''):
    (fd, fname) = mkstemp(suffix)
    return (os.fdopen(fd, mode), fname)

@dj_memoize
def pandoc_markdown2pdf(content=None, file_name=None):
    """
    Convert markdown content to pdf
    
    >>> pdf_content = pandoc_markdown2pdf('# dssd')
    """
    content = content_or_file_name(content, file_name)
        
    # write file to disk
    temp_file, input_temp_name = get_filetemp('w', 'input')
    fp_error, error_temp_name = get_filetemp('w', 'err')
    
    temp_file.write(content.encode(_PANDOC_ENCODING))
    temp_file.close()
    
    # xetex seems to cause "Invalid or incomplete multibyte or wide character" errors
    #cust_tex = " --xetex "
    cust_tex = ''
    
    # use markdown2pdf
    retcode = call(MARKDOWN2PDF_BIN + cust_tex + ' ' + input_temp_name, shell=True, stderr=fp_error)
    fp_error.close()
    
    fp_error = file(error_temp_name)
    error = fp_error.read()
    fp_error.close()

    os.remove(input_temp_name)
    os.remove(error_temp_name)
    
    if retcode:
        raise Exception(error)
    
    output_temp_name = input_temp_name + '.pdf'
    fp_output = file(output_temp_name)
    pdf_content = fp_output.read()
    fp_output.close()
    
    os.remove(output_temp_name)
    
    return pdf_content
    
# TODO: manage images in pandoc (?)
# TODO: use tidy to cleanup html

@dj_memoize
def pandoc_pandoc(content, from_format, to_format, full=False, raw=False):
    """
    Convert content (should be unicode) from from_format to to_format
    (if full: includes header & co [html, latex])
    Returns out (unicode), err
    
    >>> res, err = pandoc_pandoc(u'# sdsd', 'markdown', 'html', False)
    >>> print err
    None
    >>> res.replace("\\n","")
    u'<h1 id="sdsd">sdsd</h1>'
    >>> res, err = pandoc_pandoc(u'# sdsd', 'markdown', 'html', True)
    >>> print err
    None
    """
    # verify formats
    if from_format not in INPUT_FORMATS:
        raise Exception("Input format [%s] is not a supported format [%s]" % (from_format, ' '.join(INPUT_FORMATS)))
    if to_format not in OUTPUT_FORMATS:
        raise Exception("Output format [%s] is not a supported format [%s]" % (to_format, ' '.join(OUTPUT_FORMATS)))
    if type(content) != unicode:
        raise Exception('Content is not in unicode format!')

    # temp file
    input_file, input_temp_name = get_filetemp('w', 'input')
    output_temp_fp, output_temp_name = get_filetemp('r', 'output')
    output_temp_fp.close()
    
    error_temp_fp, error_temp_name = get_filetemp('w', 'err')
    error_temp_fp.close()
    
    input_file.write(content.encode(_PANDOC_ENCODING))
    input_file.close()
    
    # pandoc arguments and command line
    p_options = PANDOC_OPTIONS
    if raw:
        p_options = PANDOC_OPTIONS_RAW
                
    # do not use pandoc to convert from html to html
    if from_format==to_format=='html':
      # get body content
      stdoutdata = (content.encode('utf8'))
      # if for some reason, tidy has not guess the doctype, make xml.dom.minidom happy with HTML entities (&nbsp;)
      stdoutdata = re.sub(r"&nbsp;", '\xc2\xa0', stdoutdata)
      dom = parseString(stdoutdata)
      body = dom.getElementsByTagName("body")[0].toxml()
      stdoutdata = body[body.find('>')+1:body.rfind('</')]
      # strip leading spaces
      stdoutdata = re.sub(r"^\s+", '', stdoutdata)
      # add new line before closing bracket
      stdoutdata = re.sub(r"(\/?)>", r"\n\1>", stdoutdata)
      # do not split closing tag with following opening tag
      stdoutdata = re.sub(r">\n<", r"><", stdoutdata)
      # nest headers tags
      #stdoutdata = re.sub(r'<h(\d) id="([^"]+)"\n>', r'<div id="\2"><h\1>', stdoutdata)
      #stdoutdata = re.sub(r'<\/h(\d)\n>', r'</h\1></div>', stdoutdata)
      return stdoutdata

    cmd_args = ' %s -o %s ' %(p_options,output_temp_name) 
    if full:
        cmd_args += ' -s '
    cmd_args += ' -f %s ' % from_format
    cmd_args += ' -t %s ' % to_format
    cmd_args += ' %s ' % input_temp_name
    cmd = PANDOC_BIN + ' ' + cmd_args

    #from socommons.converters.new_conv import controlled_Popen 
    #controlled_Popen(cmd, stderr=file(error_temp_name,'w'))
    fp_error = file(error_temp_name,'w')
    retcode = call(cmd, shell=True, stderr=fp_error)
    fp_error.close()
    
    fp_error = file(error_temp_name)
    error = fp_error.read()
    fp_error.close()
    
    fp_output = file(output_temp_name)
    stdoutdata = fp_output.read()
    fp_output.close()
    
    
    # cleanup
    os.remove(output_temp_name)
    os.remove(input_temp_name)
    os.remove(error_temp_name)
    
    if retcode:
        raise Exception(error)

    # try converting to unicode
    try:
        stdoutdata = stdoutdata.decode(_PANDOC_ENCODING)
    except UnicodeDecodeError:
        # this will fail for binary output formats such as odt
        # return result without conversion then
        pass
    
    return stdoutdata
    
if __name__ == "__main__":
    import doctest
    doctest.testmod()

