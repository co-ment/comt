import random
import unittest

from cm.converters import convert_from_mimetype

class TestConvert(unittest.TestCase):

    def test_oo_convert(self):
        res, attachs = convert_from_mimetype('cm/converters/tests/data/ooserver_can_convert_me01.doc', 'application/vnd.oasis.opendocument.text', 'markdown')
        print res
        

if __name__ == '__main__':
    unittest.main()
