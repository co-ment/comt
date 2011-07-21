import os
import tempfile
import re

import pexpect

from abi_error import AbiConverterError, AbiCommandError


TYPES_IN  = {'602': '602',       'abw': 'abw',       'aw': 'aw',     
             'awt': 'awt',       'cwk': 'cwk',       'dbk': 'dbk',   
             'doc': 'doc',       'docm': 'docm',     'docx': 'docx', 
             'dot': 'dot',       'dotm': 'dotm',     'dotx': 'dotx',
             'fo': 'fo',         'htm': 'htm',       'html': 'html', 
             'hwp': 'hwp',       'isc': 'isc',       'iscii': 'iscii',   
             'kwd': 'kwd',       'mif': 'mif',       'odt': 'odt',
             'opml': 'opml',     'ott': 'ott',       'pdb': 'pdb',
             'pdf': 'pdf',       'rtf': 'rtf',       'sdw': 'sdw',
             'stw': 'stw',       'sxw': 'sxw',       'text': 'text',
             'txt': 'txt',       'wml': 'wml',       'wp': 'wp',
             'wpd': 'wpd',       'wri': 'wri',       'xhtml': 'xhtml',
             'xml': 'xml',       'zabw': 'zabw'}

TYPES_OUT = {'abw': 'abw',       'aw': 'aw',         'awt': 'awt',
             'dbk': 'dbk',       'doc': 'doc',       'eml': 'eml',
             'fo': 'fo',         'html': 'html',     'isc': 'isc',
             'iscii': 'iscii',   'kwd': 'kwd',       'latex': 'latex',
             'mht': 'mht',       'mif': 'mif',       'nroff': 'nroff',
             'nws': 'nws',       'odt': 'odt',       'pdb': 'pdb',
             'pdf': 'pdf',       'ps': 'ps',         'rtf': 'rtf',
             'sxw': 'sxw',       'text': 'text',     'txt': 'txt',
             'wml': 'wml',       'xml': 'xml',       'xml2ps': 'xml2ps',
             'zabw': 'zabw'}

class AbiFileConverter(object):
    """This let's you convert between all filetypes supperted by the 
    AbiWord program. Import type isn't checked, as AbiWord doesn't check 
    on extension, but on metadata.
    """

    def __init__(self, timeout=60):
        self.id = None
        self.timeout = timeout
        self._start_abiword()

    def _start_abiword(self):
        """
        Start abiword with the AbiCommand plugin, if not already started
        """

        # find the abiword executable
        abicommand = None
        for dir in os.environ['PATH'].split(':'):
            if os.path.isfile(os.path.join(dir, 'abiword')):
                abicommand = os.path.join(dir, 'abiword')
        if not abicommand:
            raise AbiConverterError('Can not find abiword executable')

        # start the abiword executable
        try:
            self.child = pexpect.spawn(abicommand + ' --plugin AbiCommand')
            self.child.expect(
                    'AbiWord command line plugin: Type "quit" to exit', 10)
        except:
            raise AbiConverterError('Can not open abiword executable')

    def stop_abiword(self):
        """
        Stop the running abiword, kill it if necessary
        """
        self.child.sendline('quit')
        if self._is_running():
            os.kill(self.child.pid, 9)

    def _is_running(self):
        """
        Test to see if abiword is running
        """
        try:
            self.child.sendline('writepid /dev/null')
            self.child.expect('OK', 1)
            return True
        except:
            return False

    def convert_file(self, in_file, out_file=None, type=None):
        """
        Convert a file. If out_file is not specified, a byte string is 
        returned. If type is not specified, the file extension from out_file is
        used to determine the type. If this fails, the type 'text' is used.
        Return value is -1 if an error occurred.
        """
        # is the out_file specified?
        return_bytes = False
        if out_file is None:
            out_file = tempfile.mktemp(prefix="abiconvert_")
            return_bytes = True
            
        # is the type specified
        type = TYPES_OUT.get(
            type or os.path.splitext(out_file)[1][1:], 'txt')

        # do the coversion
        self._perform_conversion(in_file, out_file, type)

        # return a byte string if no out_file is specified
        if return_bytes:
            fp = open(out_file,  'r')
            bytes = fp.read()
            fp.close()
            os.remove(out_file)
            return bytes

    def _perform_conversion(self, in_file, out_file, type):
        """
        Do the actual conversion
        """
        # make sure we are up and running 
        if not self._is_running:
            self._start_abiword()

        # convert the file
        cmd = 'convert %s %s %s' % (os.path.abspath(in_file), 
                                    os.path.abspath(out_file), type)
        self.child.sendline(cmd)

        # Check for errors
        i = self.child.expect(['OK', pexpect.TIMEOUT])
        if i != 0:
            raise AbiCommandError('Error performing AbiCommand: %s' %cmd)

    def convert_to_html(self, input):
        """ 
        Convert input file to HTML
        """

        from tempfile import mkstemp,mkdtemp

        THE_OUTDIR = "outdir"
        THE_OUTFILE = "outfile"
        THE_INDIR = "indir"
        THE_INFILE = "infile"

        infile = None
        outfile = None
        out_f = None
        try:
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
          if type(input) == unicode:
            input = input.encode('utf8')
          infile.write(input)
          infile.close()

          # fix perms
          # TODO group permission should suffice
          os.chmod(temp_dir, 0755) # read        
          os.chmod(indir_name, 0755) # read        
          os.chmod(infile_name, 0755) # read
          os.chmod(outdir_name, 0777) # read / write

          # Do the job
          self.convert_file(infile_name, outfile_name, 'html')

          out_f = open(outfile_name,'r')
          output = out_f.read()

          # load other files (useful only for html)
          img_res = [] 
          if os.path.isdir(outdir_name + '/' + THE_OUTFILE + '_files'):
            image_names = [name for name in os.listdir(outdir_name + '/' + THE_OUTFILE + '_files') if name != THE_OUTFILE]
            for image_name in image_names:
              img_res.append(os.path.join(outdir_name + '/' + THE_OUTFILE + '_files', image_name))

            # clean images paths
            output = re.sub(r'<img(.+src=")outfile_files/([^"]+")', r'<img\1\2', output);
            output = re.sub(r'<img(.+)style="width:[\d\.]+mm"', r'<img\1', output);
          return output,img_res

        finally:
          try:
            if out_f:
                out_f.close()
            if infile:
                infile.close()
          except:
            pass

    def convert_from_html(self, input, format):
        """ 
        Convert input file from HTML
        """

        from tempfile import mkstemp,mkdtemp

        THE_OUTDIR = "outdir"
        THE_OUTFILE = "outfile"
        THE_INDIR = "indir"
        THE_INFILE = "infile"

        infile = None
        outfile = None
        out_f = None
        try:
          # create in/out files
          temp_dir = mkdtemp(prefix="cm_")

          # in
          indir_name = os.path.join(temp_dir, THE_INDIR)
          os.mkdir(indir_name)
          infile_name = os.path.join(indir_name, THE_INFILE + '.html')

          # out
          outdir_name = os.path.join(temp_dir, THE_OUTDIR)
          os.mkdir(outdir_name)
          outfile_name = os.path.join(outdir_name, THE_OUTFILE)

          # write infile 
          infile = open(infile_name,'w')
          if type(input) == unicode:
            input = input.encode('utf8')
          infile.write(input)
          infile.close()

          # fix perms
          # TODO group permission should suffice
          os.chmod(temp_dir, 0755) # read        
          os.chmod(indir_name, 0755) # read        
          os.chmod(infile_name, 0755) # read
          os.chmod(outdir_name, 0777) # read / write

          # Do the job
          self.convert_file(infile_name, outfile_name, format)

          out_f = open(outfile_name,'r')
          output = out_f.read()
          return output

        finally:
          try:
            if out_f:
                out_f.close()
            if infile:
                infile.close()
            top = temp_dir
            #for root, dirs, files in os.walk(top, topdown=False):
            #    for name in files:
            #        os.remove(os.path.join(root, name))
            #    for name in dirs:
            #        os.rmdir(os.path.join(root, name))
            #os.rmdir(top)
          except:
            pass

    def add_html_header(self, body):
        """ 
        Add an HTML header to an HTML body
        """

        return """
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    </head>
    <body>
        %s
    </body>
</html>
""" %body

