from django.test import TestCase
from django.test.client import Client
from django.core import management

from cm.models import *

class HistoryTest(TestCase):
    fixtures = ['test_comments',]
    
    def test_revert(self):
        text = Text.objects.all()[0]
        text_version = text.last_text_version
        text.revert_to_version(text_version.key)

