# warning : oo server autolaunch is tricky
# make sure .qt .kde .openoffice.org2 should be writable in home directory
# for instance, if working user is www-data
#   mkdir /var/www/.openoffice.org2 ; chown www-data:www-data /var/www/.openoffice.org2
#   mkdir /var/www/.qt ; chown www-data:www-data /var/www/.qt
#   mkdir /var/www/.kde ; chown www-data:www-data /var/www/.kde

# FIXME: use a setting or do this uno stuff lazily
try:
    import uno
    UNO_IMPORT = True
except:
    UNO_IMPORT = False

if UNO_IMPORT:
    import uno

# old ubuntu bug left for the record
#    print "#### Uno import failed ! #### "
#    print "#### https://bugs.launchpad.net/ubuntu/+source/openoffice.org2/+bug/139077 #### "
#    print "#### launch : sudo ldconfig -v /usr/lib/openoffice/program #### "

from cm.utils.thread import synchronized, daemonize
if UNO_IMPORT:
    from com.sun.star.beans import PropertyValue
from datetime import datetime
from subprocess import Popen,call
from tempfile import mkstemp,mkdtemp

if UNO_IMPORT:
    from unohelper import systemPathToFileUrl, absolutize

from xml.dom.minidom import parseString
import cStringIO
import chardet
import sys
import magic
import os,re
import random
import threading
import time
import logging

CONN_STRING = "uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext" 

KILL = 'killall -KILL xvfb-run ; killall -KILL soffice; killall -KILL soffice.bin; killall -KILL Xvfb'
RM = 'rm -f /tmp/.X99-lock'
LAUNCH = 'xvfb-run soffice -headless "-accept=socket,port=2002;urp;"'

# xvfb-run soffice -headless "-accept=socket,port=2002;urp;";
#  soffice "-accept=socket,port=2002;urp;";


ms = magic.open(magic.MAGIC_NONE)
ms.load()

def is_text(buffer):
    type = ms.buffer(buffer)
    return ' text, ' in type

def fix_text_encoding(buffer, to_encoding = 'utf-8'):
    detected = chardet.detect(buffer)
    encoding = detected['encoding']
    if encoding != to_encoding:
        return buffer.decode(encoding).encode(to_encoding)
    return buffer
# $$$ RBE TODO fix_content a call should be made before oo_convert call when importing text file with non utf-8 encoding todo test that to make it crash     
def fix_content(buffer):
    """
    Fix content fixes :
    - encoding to utf8 to txt files
    """
    try:
        if is_text(buffer):
            return fix_text_encoding(buffer)
        return buffer
    except:
        return buffer

processing = 0

# timeout : kill oo
PROCESSING_TIMEOUT = 120.0

def oo_process_controller(code):
    """
    If 'code' process is still active : kill oo 
    """
    global processing
    logging.info('oo_process_controller')
    if processing == code:
        logging.error('--> oo_process_controller timeout %s: killing !' %PROCESSING_TIMEOUT)
        kill_oo()        

def kill_oo():
    logging.info('killing')
    p = Popen(KILL, shell=True)
    sts = os.waitpid(p.pid, 0)
    p = Popen(RM, shell=True)
    sts = os.waitpid(p.pid, 0)

def launch_oo():
    logging.info('launching')
    p = Popen(LAUNCH, shell=True)

def kill_and_relaunch_oo():
    kill_oo()
    launch_oo()

get_connection_lock = threading.RLock() 

def start_processing():
    global processing
    logging.info('start_processing')
    code = random.random()
    processing = code
    t = threading.Timer(PROCESSING_TIMEOUT, oo_process_controller, args = [code,])
    t.start()

def end_processing():
    logging.info('end_processing')
    global processing
    processing = 0 
    
@synchronized(get_connection_lock)
def get_connection(retry = 2):
    while retry > 0:
        try:
            localContext = uno.getComponentContext()
            
            resolver = localContext.ServiceManager.createInstanceWithContext(
                            "com.sun.star.bridge.UnoUrlResolver", localContext )
            
            ctx = resolver.resolve(CONN_STRING)
            return ctx
        except:
            retry -= 1
            kill_and_relaunch_oo()
            time.sleep(8)
            
    raise Exception('could not launch oo, please read README.txt section Openoffice for troubleshooting')

def get_desktop():
    ctx = get_connection()
    smgr = ctx.ServiceManager    
    # get the central desktop object
    desktop = smgr.createInstanceWithContext( "com.sun.star.frame.Desktop",ctx)
    
    return desktop


class FmtList:    
    def __init__(self):
        self._list = []

    def add(self, name, extension, summary, filter, export = False, mimetype = None):
        dd = {
              'name' : name,
              'extension' : extension,
              'summary' : summary,
              'filter' : filter,
              'export' : export,
              'mimetype' : mimetype,
              }
        self._list.append(dd)
        
    def get_filter_by_summary(self, value):
        return self.get_filter_by('summary', value)

    def get_filter_by_name(self, value):
        return self.get_filter_by('name', value)

    def get_filter_by(self, name, value):
        res = self.get_by(name, value)
        if res:
            return res['filter']
        return None

    def get_by_name(self, value):
        return self.get_by('name', value)
    
    def get_by(self, name, value):
        for fmt in self._list:
            if fmt[name] == value:
                return fmt
        return None
    
    def get_export_formats_tuple(self):
        return [(f['summary'],f['name']) for f in self._list if f['export']]

    def ids_by_summary(self):
        return self.ids_by('summary')
    
    def ids_by(self, name):
        return dict([(r[name],r['name']) for r in self._list])

fmts = None
if UNO_IMPORT:
    fmts = FmtList()
    fmts.add('bib', 'bib', 'BibTeX', 'BibTeX_Writer')
    fmts.add('doc', 'doc', 'Microsoft Word 97/2000/XP', 'MS Word 97', True, 'application/msword')
    fmts.add('doc6', 'doc', 'Microsoft Word 6.0', 'MS WinWord 6.0')
    fmts.add('doc95', 'doc', 'Microsoft Word 95', 'MS Word 95')
    fmts.add('docbook', 'xml', 'DocBook', 'DocBook File')
    fmts.add('html', 'html', 'HTML Document (OpenOffice.org Writer)', 'HTML (StarWriter)')
    fmts.add('odt', 'odt', 'Open Document Text', 'writer8', True, 'application/vnd.oasis.opendocument.text')
    fmts.add('ott', 'ott', 'Open Document Text', 'writer8_template')
    fmts.add('ooxml', 'xml', 'Microsoft Office Open XML', 'MS Word 2003 XML')
    fmts.add('pdb', 'pdb', 'AportisDoc (Palm)', 'AportisDoc Palm DB')
    fmts.add('pdf', 'pdf', 'Portable Document Format', 'writer_pdf_Export', True, 'application/pdf')
    fmts.add('psw', 'psw', 'Pocket Word', 'PocketWord File')
    fmts.add('rtf', 'rtf', 'Rich Text Format', 'Rich Text Format', True, 'application/rtf')
    fmts.add('latex', 'ltx', 'LaTeX 2e', 'LaTeX_Writer')
    fmts.add('sdw', 'sdw', 'StarWriter 5.0', 'StarWriter 5.0')
    fmts.add('sdw4', 'sdw', 'StarWriter 4.0', 'StarWriter 4.0')
    fmts.add('sdw3', 'sdw', 'StarWriter 3.0', 'StarWriter 3.0')
    fmts.add('stw', 'stw', 'Open Office.org 1.0 Text Document Template', 'writer_StarOffice_XML_Writer_Template')
    fmts.add('sxw', 'sxw', 'Open Office.org 1.0 Text Document', 'StarOffice XML (Writer)')
    fmts.add('text', 'txt', 'Text Encoded', 'Text (encoded)', True, 'application/txt')
    fmts.add('txt', 'txt', 'Plain Text', 'Text')
    fmts.add('vor', 'vor', 'StarWriter 5.0 Template', 'StarWriter 5.0 Vorlage/Template')
    fmts.add('vor4', 'vor', 'StarWriter 4.0 Template', 'StarWriter 4.0 Vorlage/Template')
    fmts.add('vor3', 'vor', 'StarWriter 3.0 Template', 'StarWriter 3.0 Vorlage/Template')
    fmts.add('xhtml', 'html', 'XHTML Document', 'XHTML Writer File')

THE_OUTDIR = "outdir"
THE_OUTFILE = "outfile"

THE_INDIR = "indir"
THE_INFILE = "infile"
  
def extract_css_body(xhtml):
    dom = parseString(xhtml.encode('utf8'))
    style = dom.getElementsByTagName("style")[0].toxml()
    body = dom.getElementsByTagName("body")[0].toxml()
    # cleanup initial/final tags
    style_clean = style[style.find('>')+1:style.rfind('</')]
    body_clean = body[body.find('>')+1:body.rfind('</')]
    return style_clean,body_clean
    
convert_lock = threading.RLock() 

def combine_css_body(body, css):
    return """
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <style type="text/css">
            %s
        </style>    
    </head>
    <body>
        %s
    </body>
</html>
""" %(css,body)

def to_string(input):
    if type(input) == unicode:
        input = input.encode('utf8')
    return input
    
@synchronized(convert_lock)    
def convert_html(input, format_name, images = None):
    out_filter = fmts.get_filter_by_name(format_name)    
    if not out_filter:
        raise Exception("Unsupported format name %s" %(format_name)) 
    infile = None
    outfile = None
    out_f = None
    try:
        desktop = get_desktop()
        
        start_processing()
                        
        # create in/out files
        temp_dir = mkdtemp(prefix="cm_")
        
        # in
        indir_name = os.path.join(temp_dir, THE_INDIR)
        os.mkdir(indir_name)
        infile_name = os.path.join(indir_name, THE_INFILE  + '.html')
        
        # out
        outdir_name = os.path.join(temp_dir, THE_OUTDIR)
        os.mkdir(outdir_name)
        outfile_name = os.path.join(outdir_name, THE_OUTFILE)

        # write infile 
        infile = open(infile_name,'w')
        input = to_string(input)
        infile.write(input)
        infile.close()

        # fix perms
        # TODO: group permission should suffice
        os.chmod(temp_dir, 0755) # read    
        os.chmod(indir_name, 0755) # read
        os.chmod(infile_name, 0755) # read
        os.chmod(outdir_name, 0777) # read / write

        inProps = PropertyValue( "Hidden" , 0 , True, 0 ),        
        doc = desktop.loadComponentFromURL( "private:factory/swriter", "_blank", 0, inProps )
        text   = doc.Text
        cursor = text.createTextCursor()

        fileUrl = systemPathToFileUrl(infile_name)
        cursor.insertDocumentFromURL(fileUrl, ())
        
        properties= (PropertyValue("Hidden", 0, True, 0), PropertyValue("FilterName", 0, out_filter, 0))        
        doc.storeToURL('file://%s' %outfile_name,tuple(properties))
        
        out_f = open(outfile_name,'r')

        output = out_f.read()
        return output
    finally:
        end_processing()
        try:
            if out_f:
                out_f.close()
            if infile:
                infile.close()
            top = temp_dir
            for root, dirs, files in os.walk(top, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.rmdir(top)            
        except:
            # TODO : warn
            pass

@synchronized(convert_lock)    
def convert(input, format_name, unicode = False):
    
    logging.info('convert')
    out_filter = fmts.get_filter_by_name(format_name)    
    if not out_filter:
        raise Exception("Unsupported format name %s" %(format_name)) 
    infile = None
    outfile = None
    out_f = None
    try:
        desktop = get_desktop() 
	    
        start_processing()
    
        # create in/out files
        temp_dir = mkdtemp(prefix="cm_")
        
        # in
        indir_name = os.path.join(temp_dir, THE_INDIR)
        os.mkdir(indir_name)
        infile_name = os.path.join(indir_name, THE_INFILE)
        
        # out
        outdir_name = os.path.join(temp_dir, THE_OUTDIR)
        os.mkdir(outdir_name)
        outfile_name = os.path.join(outdir_name, THE_OUTFILE)

        # write infile 
        infile = open(infile_name,'w')
        input = to_string(input)
        infile.write(input)
        infile.close()

        # fix perms
        # TODO group permission should suffice
        os.chmod(temp_dir, 0755) # read        
        os.chmod(indir_name, 0755) # read        
        os.chmod(infile_name, 0755) # read
        os.chmod(outdir_name, 0777) # read / write
                
        properties = PropertyValue("Hidden", 0, True, 0),
                       
        #import pdb;pdb.set_trace()   
        doc=desktop.loadComponentFromURL("file://%s" % infile_name, "_blank", 0, properties)
        
        properties= (PropertyValue("Hidden", 0, True, 0), PropertyValue("FilterName", 0, out_filter, 0))        
        doc.storeToURL('file://%s' %outfile_name,tuple(properties))
        
        out_f = open(outfile_name,'r')

        output = out_f.read()
        # load other files (useful only for html)
        image_names = [name for name in os.listdir(outdir_name) if name != THE_OUTFILE]
        img_res = [] 
        for image_name in image_names:
              img_res.append(os.path.join(outdir_name, image_name))
        if unicode:
            output = output.decode('utf8')
        return output,img_res
    finally:
        end_processing()
        try:
            if out_f:
                out_f.close()
            if infile:
                infile.close()
# Do not remove dir: we only return images path to avoid 
# mem overload             
#            top = temp_dir
#            for root, dirs, files in os.walk(top, topdown=False):
#                for name in files:
#                    os.remove(os.path.join(root, name))
#                for name in dirs:
#                    os.rmdir(os.path.join(root, name))
#            os.rmdir(top)            
        except:
            # TODO : warn
            pass
