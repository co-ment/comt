import unittest

from pytest import skip

from cm.converters import convert_from_mimetype


# Skipping for now, as it doesn't work on my Mac.
@skip
class TestConvert(unittest.TestCase):
    def test_convert_word_document(self):
        res, attachs = convert_from_mimetype(
            'cm/converters/tests/data/ooserver_can_convert_me01.doc',
            'application/vnd.oasis.opendocument.text',
            'markdown')
