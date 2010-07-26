# -*- coding: utf-8 -*-
from django.test import TestCase
from BeautifulSoup import BeautifulSoup
from cm.models import *

# python manage.py test 
#       
# python manage.py test cm.CommentPositioningTest


def create_comment(start_wrapper=0, end_wrapper=0, start_offset=0, end_offset=0, reply_to=None, user=None, state='pending'):
    version = Text.objects.all()[0].get_latest_version()
    co = Comment.objects.create(text_version=version,
                           title="tt",
                           content="tt",
                           start_wrapper=start_wrapper,
                           end_wrapper=end_wrapper,                                
                           start_offset=start_offset,
                           end_offset=end_offset,
                           reply_to=reply_to,
                           state=state,
                           user=user)
    return co
    

class CommentPositioningTest(TestCase):
        
        
    def assert_comment(self, old_comment_id, start_wrapper, end_wrapper, start_offset, end_offset):
        comment = Comment.objects.get(id=old_comment_id)
        #print comment.start_wrapper, comment.end_wrapper, comment.start_offset, comment.end_offset  
        #print start_wrapper, end_wrapper, start_offset, end_offset
        self.assertEqual(comment.start_wrapper, start_wrapper)
        self.assertEqual(comment.end_wrapper, end_wrapper)
        self.assertEqual(comment.start_offset, start_offset)
        self.assertEqual(comment.end_offset, end_offset)
        
    def preserve_comment_pos(self, content, new_content, comment_pos_list):
        text = Text.objects.create_text("text", "html", content, "", "", "", None)
        version = Text.objects.all()[0].get_latest_version()

        res = {}
        for old, new  in comment_pos_list:
            x, y, z, k = old 
            comment = create_comment(x, y, z, k)
            res[comment.id] = new  
        
        version.edit("text", "html", new_content, keep_comments = True, cancel_modified_scopes=False)

        for id, new in res.items():
            if not new:
                self.assertFalse(Comment.objects.filter(id=id))
            else:
                x, y , z, k = new
                self.assert_comment(id, x, y, z, k) 

    def test_remove_comment(self):
        content     = u"""<html><body>This is a <b>test</b> text</body></html>"""
        new_content = u"""<html><body>This is a <b>te</b>e<b>est</b> text</body></html>"""

        text = Text.objects.create_text("text", "html", content, "", "", "", None)

        comment1 = create_comment(2, 2, 2, 4)
        comment2 = create_comment(2, 2, 2, 4)
        
        version = Text.objects.all()[0].get_latest_version()

        self.assertEqual(len(version.get_comments()), 2)

        version.edit("text", "html", new_content, keep_comments = False, cancel_modified_scopes=False)

        self.assertEqual(len(version.get_comments()), 0)
            
    def test_wrapper_shifted(self):
        content     = u"""<html><body>This is a <b>test</b> text</body></html>"""
        new_content = u"""<html><body>This is a <b>te</b>e<b>est</b> text</body></html>"""
        self.preserve_comment_pos(content, new_content, [([2,2,2,4],[4,4,2,4]),])

    def test_comment_removed(self):
        content     = u"""<html><body>This is a <b>test</b> text</body></html>"""
        new_content = u"""<html><body>This is a <b>test</b> txt</body></html>"""
        self.preserve_comment_pos(content, new_content, [([2,2,2,4],None),])

    def test_offset_shifted(self):
        content     = u"""<html><body>This is a <b>test</b> text</body></html>"""
        new_content = u"""<html><body>a <b>teXXXst</b>a text</body></html>"""
        self.preserve_comment_pos(content, new_content, [([2,2,2,4],[2,2,3,5]),])

    def test_insert_wrapper(self):
        content     = u"""<html><body>This is a <b>test</b> text</body></html>"""
        new_content = u"""<html><body>This is a <b>test</b> te<b>x</b>t</body></html>"""
        self.preserve_comment_pos(content, new_content, [([2,2,2,5],[2,4,2,1]),])

    def test_multiwrapper(self):
        content     = u"""<html><body>This is a <b>test</b> text</body></html>"""
        new_content = u"""<html><body>This is a <b>testXXX<b>X</b>XXXXXXX</b>X text</body></html>"""
        self.preserve_comment_pos(content, new_content, [([0,2,2,4],None),])

    def test_insert_wrapper2(self):
        content     = u"""<html><body>aa<b>test</b>bb</body></html>"""
        new_content = u"""<html><body>aXa<b>test</b>bXb</body></html>"""
        self.preserve_comment_pos(content, new_content, [([0,2,1,1],[0,2,2,1]),])

