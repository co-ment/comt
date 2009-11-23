#!/usr/bin/python

import os
from time import time
import re

os.system("rm -rf temp")
os.system("mkdir temp")

timestamp = int(time())
for (prefix, destDir, destFile, containerFile) in [("c_", "../media/js/client/", "c_client-min.js","../../cm/templates/site/text_view_comments.html"),
                                                   ("f_", "../media/js/client/", "f_client-min.js", "../../cm/templates/site/text_view_frame.html")] :
    os.system("rm %s%s"%(destDir, destFile))
    os.system("touch %s%s"%(destDir, destFile))
    
    os.system("find ../media/js/client -name \"%s*.js\" > files"%prefix)
    os.system("find ../media/js/site -name \"%s*.js\" >> files"%prefix)
    
    f = open("files")    
    try:
        for fname in f :
            fullfilename = fname.replace('\n','')
            os.system("java -jar ../../cm/scripts/lib/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar --preserve-semi " + fullfilename + ">>" + destDir + destFile)
    finally: 
        f.close()
    os.system("rm files")
    
    # change reference to js to add datetimestamp int(time())
    # to prevent browser caching
    print ""
    print "setting timestamp %d in %s, commit the file" %(timestamp,containerFile)
    
    input = open(containerFile).read()
    p = re.compile('%s\?(\d*)"'%destFile)
    new_input = p.sub('%s?%d"' % (destFile,timestamp),input)
    ff = open(containerFile,'w')
    ff.write(new_input)
    ff.close()
    
os.system("rm -rf temp")