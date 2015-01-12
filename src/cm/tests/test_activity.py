from datetime import datetime

from django.test import TestCase

from cm.activity import get_activity
from cm.models import Text


class ActivityTest(TestCase):
    fixtures = ['roles_generic', 'test_content']

    def test_process_activities(self):
        text = Text.objects.get(id=1)
        activity = get_activity(text, user='all',
                                reference_date=datetime(2009, 02, 01))
        self.assertEqual(activity,
                         [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
                          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])

  
        


    