from django.test import TestCase
from django.test.client import Client
from django.core import management
from datetime import datetime
from cm.activity import *
from cm.models import *
from cm.security import *

class ActivityTest(TestCase):
    fixtures = ['roles_generic','test_content']
    
    def test_process_activities(self):
        text = Text.objects.get(id=1)
        activity = get_activity(text, user='all', reference_date=datetime(2009,02,01))
        self.assertEqual(activity, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])

  
        


    