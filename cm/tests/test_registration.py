from django.test import TestCase

from cm.security import UserProfile


class RegistrationTest(TestCase):
    fixtures = ['roles_generic','test_content']
    
    def test_registration(self):
        user = UserProfile.objects.create_inactive_user('no@noreply', False)
        