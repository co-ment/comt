# -*- coding: utf-8 -*-
from django.test import TestCase
from cm.utils.spannifier import *
from BeautifulSoup import BeautifulSoup

# python manage.py test 
#       
# python manage.py test cm.SpannifyTest

file_tests = ["simple.html",]

class SpannifyTest(TestCase):
    
    def test_spannify(self):
        string_tests_spannify = [
                                 [u"""<body>kéké</body>""", 
                                  u"""<body><span id="sv_0" class="c-s"><span id="sv-0" class="c-count-0 c-c">kéké</span></span></body>""",
                                  u'kéké',
                                  ],
                                  
                                 [u"""<body>aaa <span>bbb</span> ccc ddd <b>eee</b></body>""",
                                  u"""<body><span id="sv_0" class="c-s"><span id="sv-0" class="c-count-0 c-c">aaa </span></span><span><span id="sv_1" class="c-s"><span id="sv-1" class="c-count-0 c-c">bbb</span></span></span><span id="sv_2" class="c-s"><span id="sv-2" class="c-count-0 c-c"> ccc ddd </span></span><b><span id="sv_3" class="c-s"><span id="sv-3" class="c-count-0 c-c">eee</span></span></b></body>""",
                                  u"""aaa bbb ccc ddd eee""",]                                  
                                ]

#        
        for input, expected_spanned, expected_raw in string_tests_spannify :
            res, raw_text, corresp = spannify(input)
            self.assertEqual(unicode(res),expected_spanned)
            self.assertEqual(unicode(raw_text),expected_raw)

#        for filename in file_tests :
#            if filename[:5] == "span_" :
#                doc = xml.dom.minidom.parse('cm/tests/data/%s' % filename)
#                soup = BeautifulSoup('cm/tests/data/%s' % filename, convertEntities=["xml", "html"])
#                
#                res = spannifier.spannify(doc)
#                res2 = spannifier.spannify_new(soup)
#                
#                expectedResult = file('cm/tests/data/res_%s' % filename).read()
##                print res
#                self.assertEqual(res2,expectedResult)



    def test_long_spannify(self):
        content =  unicode(file('src/cm/tests/data/long_text_to_spannify.html').read(), 'utf8')
        
        res, raw_text, corresp = spannify(content)
