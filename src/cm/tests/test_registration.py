from django.test import TestCase
from django.test.client import Client
from django.core import management


from cm.models import *
from cm.security import *
from cm.tests.test_comment_positioning import create_comment


class RegistrationTest(TestCase):
    fixtures = ['roles_generic','test_content']
    
    def test_registration(self):
        user = UserProfile.objects.create_inactive_user('no@noreply', False)
        