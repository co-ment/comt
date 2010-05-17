from django.core import mail
from django.test import TestCase
from django.test.client import Client
from django.core import management

from cm.models import *
from cm.models_utils import *

class NotificationTest(TestCase):
    fixtures = ['roles_generic','test_content']
    
    def setUp(self):
        pass

    def test_simple_notification(self):
        c = Client()
        c.login(username='user1', password='test')
        self.assertEquals(len(Notification.objects.all()), 0)

        # subscribe to workspace notifications
        response = c.post('/followup/', {'notif_id': u'workspace_notify_check', 
                                         'workspace_notify_check': u'true',
                                         })

        self.assertEquals(len(Notification.objects.all()), 1)
        
        # subscribe to own notifications
        response = c.post('/followup/', {'notif_id': u'own_notify_check', 
                                         'own_notify_check': u'true',
                                        })
        
        self.assertEquals(len(Notification.objects.all()), 2)

        self.assertEquals(len(mail.outbox), 0)        

        c.post('/client/', {'content' : 'sdf',
                            'end_offset' : 19,
                            'end_wrapper' : 0,
                            'format' : 'markdown',
                            'fun' : 'addComment',
                            'key' : 'text_key_1',
                            'version_key' : 'textversion_key_1',
                            'start_offset' : 16,
                            'start_wrapper' : 0,
                            'title' : 'sdf', 
                            'tags': '',   
                            })
        self.assertEquals(len(mail.outbox), 1)        
        
