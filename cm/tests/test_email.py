from django.test import TestCase

from cm.models import Text, TextVersion, Comment
from cm.utils.mail import send_mail


class EmailTest(TestCase):

    def test_send_mail(self):
        send_mail("test subject", "test message", 'test@example.com',
                  ['test@example.com'])
