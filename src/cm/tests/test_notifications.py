from django.core import mail
from django.test import TestCase
from django.test.client import Client
from django.core import management

from cm.models import *
from cm.models_utils import *

class NotificationTest(TestCase):
    fixtures = ['roles_generic','test_content']
    
    def test_global_notification(self):
        c = Client()
        c.login(username='user1', password='test')
        print Notification.objects.all()

        c.post('/notifications/', {'notify_check': u'true'})

        # ? error ? django tests system bug?
        c.post('/client/', {'content' : 'sdf',
                            'end_offset' : 11,
                            'end_wrapper' : 0,
                            'format' : 'markdown',
                            'fun' : 'addComment',
                            'key' : 'text_key_1',
                            'start_offset' : 8,
                            'start_wrapper' : 0,
                            'title' : 'sdf',
                            })
        self.assertEquals(len(mail.outbox), 1)        
        
