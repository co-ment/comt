from django.test import TestCase

from cm.converters.pandoc_converters import pandoc_convert, OUTPUT_FORMATS


class ConverterTest(TestCase):
    
    def test_rst(self):
        rst =  unicode(file('cm/tests/data/text.rst').read())
        
        # convert in all formats
        for to_format in OUTPUT_FORMATS:
            if to_format == 'pdf':
                # Skip this because it involves a whole LaTeX install
                continue
            res = pandoc_convert(rst,'rst',to_format)
