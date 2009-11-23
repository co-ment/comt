from django.test import TestCase
from django.test.client import Client
from django.core import management

from cm.converters.pandoc_converters import pandoc_convert, OUTPUT_FORMATS

class ConverterTest(TestCase):
    
    def test_rst(self):
        rst =  unicode(file('src/cm/tests/data/text.rst').read())
        
        # convert in all formats
        for to_format in OUTPUT_FORMATS: 
            res = pandoc_convert(rst,'rst',to_format)
        
        