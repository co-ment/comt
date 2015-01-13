from django.test import TestCase

from cm.models import Text


class HistoryTest(TestCase):
    fixtures = ['test_comments',]
    
    def test_revert(self):
        text = Text.objects.all()[0]
        text_version = text.last_text_version
        text.revert_to_version(text_version.key)

