from django.test import TestCase
from django.test.client import Client
from django.core import management

from cm.models import *

class StructureTest(TestCase):
    fixtures = ['test_comments',]
    
    def test_edit_text(self):
        self.assertEqual(TextVersion.objects.count(), 1)
        self.assertEqual(Comment.objects.count(), 8)
        
        # edit with duplication, without changing content
        text = Text.objects.all()[0]
        new_text = text.edit(new_title='my title', 
                  new_format='html', 
                  new_content=text.get_latest_version().content, 
                  keep_comments = True, 
                  cancel_modified_scopes=False,                  
                  new_version = True)
        self.assertEqual(TextVersion.objects.count(), 2)
        self.assertEqual(Comment.objects.count(), 16)
        
        # edit with duplication changing content
        new_text = text.edit(new_title='my title', 
                  new_format='html', 
                  new_content=u'simple text <p>simple text</p> <p>simple text</p> ', 
                  keep_comments = True, 
                  cancel_modified_scopes=False,                  
                  new_version = True)
        self.assertEqual(TextVersion.objects.count(), 3)
        self.assertEqual(Comment.objects.count(), 17) # 22

        # edit without duplication, completely changing content
        new_text = text.edit(new_title='my title', 
                  new_format='html', 
                  new_content=u'xxxxxx', 
                  keep_comments = True, 
                  cancel_modified_scopes=False,                  
                  new_version = False)
        self.assertEqual(TextVersion.objects.count(), 3)
        self.assertEqual(Comment.objects.count(), 16) # 21

    def test_edit_text2(self):
        self.assertEqual(TextVersion.objects.count(), 1)
        self.assertEqual(Comment.objects.count(), 8)
        text = Text.objects.all()[0]
        new_text = text.edit(new_title='my title', 
                  new_format='html', 
                  new_content=u'xxxxxx', 
                  keep_comments = False, 
                  cancel_modified_scopes=False,                  
                  new_version = False)
        self.assertEqual(TextVersion.objects.count(), 1)
        self.assertEqual(Comment.objects.count(), 0)

    def test_edit_text3(self):
        self.assertEqual(TextVersion.objects.count(), 1)
        self.assertEqual(Comment.objects.count(), 8)
        text = Text.objects.all()[0]
        new_text = text.edit(new_title='my title', 
                  new_format='html', 
                  new_content=u'xxxxxx', 
                  keep_comments = False, 
                  cancel_modified_scopes=False,                  
                  new_version = True)
        self.assertEqual(TextVersion.objects.count(), 2)
        self.assertEqual(Comment.objects.count(), 8)

