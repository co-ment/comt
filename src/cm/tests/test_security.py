from django.test import TestCase
from django.test.client import Client
from django.core import management


from cm.models import *
from cm.security import *
from cm.tests.test_comment_positioning import create_comment

class FalseRequest(object):
    def __init__(self, user):
        self.user = user

class SecurityTest(TestCase):
    fixtures = ['roles_generic','test_content']
    
    def test_access_rights(self):
        # anon user sees no text
        request = FalseRequest(None)                
        self.assertEqual(get_texts_with_perm(request, 'can_view_text').count(), 2)

        # user 1 sees all texts
        user1 = UserProfile.objects.get(id=1).user        
        request = FalseRequest(user1)       
        self.assertEqual(get_texts_with_perm(request, 'can_view_text').count(), 5)
        
        # user 2 sees only 4 texts
        user2 = UserProfile.objects.get(id=2).user
        request = FalseRequest(user2)        
        self.assertEqual(get_texts_with_perm(request, 'can_view_text').count(), 4)

        # user 4 manages only 2 texts (global manager but commentator on text 4
        user4 = UserProfile.objects.get(id=4).user
        request = FalseRequest(user4)
        self.assertEqual(get_texts_with_perm(request, 'can_manage_text').count(), 2)

    def test_moderation_tricks_a_priori(self):
        # text a priori moderated
        # a new comment is unapproved -> owner can edit -> gets approved -> owner cannot edit it (unless moderator)
        user2 = UserProfile.objects.get(id=2).user
        user3 = UserProfile.objects.get(id=3).user
        text2 = Text.objects.get(id=2)

        # user 3 is Commentator on text 2 (a priori mod)
        # user 2 is Editor on text 2 (a priori mod)
        c2 = create_comment(user=user2)        
        self.assertTrue(has_own_perm(FalseRequest(user2), "can_edit_comment" + "_own", text2, c2),'can edit own comment')

        c3 = create_comment(user=user3)
        self.assertTrue(has_own_perm(FalseRequest(user3), "can_edit_comment" + "_own", text2, c3),'can edit own comment')
        
        c2.state = 'approved'
        c2.save()
        c3.state = 'approved'
        c3.save()

        self.assertFalse(has_own_perm(FalseRequest(user3), "can_edit_comment" + "_own", text2, c3),'CANNOT edit own comment (there is a reply)')
        self.assertTrue(has_own_perm(FalseRequest(user2), "can_edit_comment" + "_own", text2, c2),"CAN edit own comment (is moderator)")
        self.assertTrue(has_perm(FalseRequest(user2), "can_edit_comment", text2),"CAN edit other comment (is moderator)")
        
    def test_moderation_tricks_a_posteriori(self):
        # text a posteriori moderated
        # a new comment is approved -> owner can edit -> get a reply -> owner cannot edit it (unless moderator)
        user2 = UserProfile.objects.get(id=2).user
        user3 = UserProfile.objects.get(id=3).user
        text2 = Text.objects.get(id=2)
        text2.last_text_version.mod_posteriori = True
        text2.last_text_version.save()

        # user 3 is Commentator on text 2 (a priori mod)
        # user 2 is Editor on text 2 (a priori mod)
        c3 = create_comment(user=user3, state='approved')        
        self.assertTrue(has_own_perm(FalseRequest(user3), "can_edit_comment" + "_own", text2, c3),'CAN edit own comment (there is NO reply)')

        # create a reply
        c2 = create_comment(user=user3, reply_to=c3, state='approved')
                
        self.assertFalse(has_own_perm(FalseRequest(user3), "can_edit_comment" + "_own", text2, c3),'CANNOT edit own comment (there is a reply)')
        self.assertTrue(has_perm(FalseRequest(user2), "can_edit_comment", text2),"CAN edit other's comment (moderator)")
        