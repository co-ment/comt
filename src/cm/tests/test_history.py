from django.test import TestCase
from django.test.client import Client
from django.core import management

from cm.models import *

class HistoryTest(TestCase):
    fixtures = ['test_comments',]
    
    def test_revert(self):
        text = Text.objects.all()[0]
        #for i in range(1,text.get_versions_number()+1):
        text_version = Text.last_text_version
        text.revert_to_version(text_version.key)
        #self.assertEqual(Comment.objects.count(), 16)

