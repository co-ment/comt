# -*- coding: utf-8 -*-
from difflib import SequenceMatcher
#from cm.utils.spannifier import Spannifier
import sys, operator
from cm.utils.spannifier import spannify
from cm.converters.pandoc_converters import pandoc_convert
import logging
from cm.utils.spannifier import get_the_soup

import html5lib
from html5lib import treebuilders

def compute_new_comment_positions(old_content, old_format, new_content, new_format, commentList):
    
    if old_format!='html':
        previousVersionContent = pandoc_convert(old_content, old_format, 'html')
    else:
        previousVersionContent = old_content
        
    if new_format != 'html':
        newVersionContent = pandoc_convert(new_content, new_format, 'html')
    else:
        newVersionContent = new_content
    
    _, previous_char_list, span_starts_previous = spannify(previousVersionContent)
    _, new_char_list, span_starts_new = spannify(newVersionContent)
    
    sm = SequenceMatcher(None, previous_char_list, new_char_list)
    
    opcodes = sm.get_opcodes()
    to_remove_comments_ids = set()
    
    # limit to real comments (not replies)
    commentList = [c for c in commentList if not c.is_reply()]
    
    for comment in commentList:
        try:
            comment.initial_start_offset = span_starts_previous[comment.start_wrapper] + comment.start_offset
            comment.initial_end_offset = span_starts_previous[comment.end_wrapper] + comment.end_offset
        except KeyError:
            logging.error('Key error (wrapper out of bounds of span_starts_previous)')
            continue

        comment.computed_start_offset = comment.initial_start_offset
        comment.computed_end_offset = comment.initial_end_offset

#        comment.computed_start_wrapper = None
#        comment.computed_end_wrapper = None

        comment.valid = True
    for tag, i1, i2, j1, j2 in opcodes:
        #print tag, i1, i2, j1, j2
        
        for i in xrange(len(commentList)) :            
            if tag != 'equal' :
                comment = commentList[i]
                if not comment.valid:
                    continue
                
                if comment.initial_start_offset >= i2 :
                    # if offset
                    delta = ((j2 - j1) - (i2 - i1))
                    comment.computed_start_offset += delta
                    comment.computed_end_offset += delta
                    
                elif comment.initial_end_offset > i1:
                    comment.valid = False
                    
        #    id, initial_start, initial_end, computed_start, computed_end, valid = self.computationResults[i]

    for c in commentList:        
        if c.valid:
            for id in xrange(len(span_starts_new.keys())):
                start = span_starts_new.get(id)
                end = span_starts_new.get(id+1, sys.maxint)

                # adjust start                
                if c.computed_start_offset >= start and c.computed_start_offset < end:
                    c.start_wrapper = id
                    c.start_offset = c.computed_start_offset - start
                
                # adjust end                        
                if c.computed_end_offset >= start and c.computed_end_offset < end:
                    c.end_wrapper = id
                    c.end_offset = c.computed_end_offset - start
            
    # returns to_modify, to_remove
    return [c for c in commentList if c.valid], \
           [c for c in commentList if not c.valid]

## no colors, just markers           
#def insert_comment_markers_and_nocolors(htmlcontent, comments):
#    
#    parser = html5lib.HTMLParser(tree=treebuilders.getTreeBuilder("beautifulsoup"))
#    html = parser.parse(htmlcontent.encode("utf8"), encoding="utf8")
#    
#    cpt = 1
#    
#    # key : node id, value : indexes of added markers
#    # to remember index of inserted markers
#    rememberMarkerOffsets = {}
#    
#    #O(n²) ?
#    for comment in comments :
#        for i in [0,1] :
#            wrapper = comment.start_wrapper if i == 0 else comment.end_wrapper
#            offset =  comment.start_offset if i == 0 else comment.end_offset
#            marker = "[%d>"%cpt if i == 0 else "<%d]"%cpt
#            marker_length = len(marker)
#            content = html.find(id = "sv-%d"%wrapper).contents[0]
##            import pdb;pdb.set_trace()
#            smallerIndexes = rememberMarkerOffsets.get(wrapper, [])
#            original_offset =  offset
#            offset += marker_length * len([index for index in smallerIndexes if index <= offset])
#        
#            smallerIndexes.append(original_offset)
#            rememberMarkerOffsets[wrapper] = smallerIndexes
#        
#            content.replaceWith(content[:offset]+marker+content[offset:])
#                
#        cpt = cpt + 1
#    
#    return unicode(html)

def add_marker(text, color, start_ids, end_ids, with_markers, with_colors):
# TODO
# THESE 3 LINES ARE REALLY JUST FOR TESTING THIS IS COPIED FROM C-TEXT.CSS AND SHOULD BE DONE DIFFERENTLY
    BCKCOLORS = ['#FFF', '#FFF39A', '#FFDB9A', '#FFC39A', '#FFAB9A', '#FF879A', '#FF7B9A', '#FF6272']
    for i in range(30) :
        BCKCOLORS.append('#FF6272')

    ret = text 
    
    if with_markers:
        end_ids.reverse()
        ret = "%s%s%s"%(''.join(["[%s>"%start_id for start_id in start_ids]), ret, ''.join(["<%s]"%end_id for end_id in end_ids]))
     
    if with_colors and color != 0 :
        ret = "<span style='background-color:%s;'>%s</span>"%(BCKCOLORS[color], ret)
        
    return ret

# comments are comments and replies : TODO $$$$$$$$$$$$ handle replies case 
def insert_comment_markers(htmlcontent, comments, with_markers, with_colors) :

#    parser = html5lib.HTMLParser(tree=treebuilders.getTreeBuilder("beautifulsoup"))
#    html = parser.parse(htmlcontent.encode("utf8"), encoding="utf8")
    html = get_the_soup(htmlcontent) ;
    
#    import pdb;pdb.set_trace()
    if comments :
        max_wrapper = max([comment.end_wrapper for comment in comments])
        min_wrapper = min([comment.start_wrapper for comment in comments])
        
    datas = {} # { wrapper_id : {'start_color':nb_of_comments_unterminated_at_wrapper_start, 'offsets':{offset: [[ids of wrappers starting at offset], [ids of wrappers ending at offset]]}}
    # datas['offsets'][someoffset][0] and idem[1] will be ordered the way comments are (should be ('start_wrapper', 'start_offset', 'end_wrapper', 'end_offset') important)
    cpt = 1 # starting numbered comment
    for comment in comments :
        if comment.is_reply() :
            continue ;
        
        #import pdb;pdb.set_trace()
        # start 
        wrapper_data = datas.get(comment.start_wrapper, {'start_color':0, 'offsets':{}})
        offset = wrapper_data.get('offsets').get(comment.start_offset, [[],[]])
        offset[0].append(cpt)
        #offset[0].append(comment.id)
        wrapper_data['offsets'][comment.start_offset] = offset
        datas[comment.start_wrapper] = wrapper_data
            
        # end 
        wrapper_data = datas.get(comment.end_wrapper, {'start_color':0, 'offsets':{}})
        offset = wrapper_data.get('offsets').get(comment.end_offset, [[],[]])
        offset[1].append(cpt)
        #offset[1].append(comment.id)
        wrapper_data['offsets'][comment.end_offset] = offset
        datas[comment.end_wrapper] = wrapper_data
            
        for cc in range(comment.start_wrapper + 1, comment.end_wrapper + 1) : 
            wrapper_data = datas.get(cc, {'start_color':0, 'offsets':{}})
            wrapper_data['start_color'] += 1
            datas[cc] = wrapper_data

        cpt = cpt + 1
    
    # order ee values
    for (wrapper_id, wrapper_data) in datas.items() :
        start_color = wrapper_data['start_color']
        offsets = sorted(wrapper_data['offsets'].items(), key=operator.itemgetter(0))
        
        content = html.find(id = "sv-%d"%wrapper_id).contents[0]
        
        spans = ""
        
        if offsets :
            color = start_color
            
            start = 0
            start_ids = []
            end_ids = []
            
#            for offset, nbs in offsets :
            for offset, ids in offsets :
                
                end_ids = ids[1]
                end = offset
                
                spans += add_marker(content[start:end], color, start_ids, end_ids, with_markers, with_colors)

                start_ids = ids[0]
                start = end

                color += (len(ids[0]) - len(ids[1]))
                
            end_ids = []
            spans += add_marker(content[end:], color,start_ids, end_ids, with_markers, with_colors)
        else : # the whole content is to be colored with start_color
            spans += add_marker(content, start_color, [], [], with_markers, with_colors)

        content.replaceWith(spans)

    return unicode(html)

#def output_comment_line(comment) :
#    ret = "<tr>"
#    for i in range(comment.depth()) : 
#        ret = ret + """<td width="1 em"></td>"""
#    
#    ret = ret + """<td width="1 em">[%d]</td><td>"""
#    
#
#def output_comments(comments) :
#
#    max_depth = max([comment.depth() for comment in comments])
#    top_comments = [comment for comment in comments if comment.reply_to_id == None]
#    top_comment_cpt = 0
#    html_comments = ""
#    
#    for top_comment in top_comments :
#        html_comments = html_comments + """<table>"""
#         
#        html_comments = html_comments + "<table><tr>"
#         
#        html_comments = html_comments + "</table>" 
#
#        top_comment_cpt = top_comment_cpt + 1
#    
#    ret = "%s%s%s"%("""<div class="pagebreakhere">""", html_comments, """</div>""")
#    return ret