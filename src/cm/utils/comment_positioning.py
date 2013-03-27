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
    
    # cf. TextVersion.get_content
    previousVersionContent = pandoc_convert(old_content, old_format, 'html')
    newVersionContent = pandoc_convert(new_content, new_format, 'html')

    _, previous_char_list, span_starts_previous = spannify(previousVersionContent, False)
    _, new_char_list, span_starts_new = spannify(newVersionContent, False)
    
    sm = SequenceMatcher(None, previous_char_list, new_char_list)
    
    opcodes = sm.get_opcodes()
    to_remove_comments_ids = set()
    
    # limit to real comments (not replies) and those that have scope 
    commentList = [c for c in commentList if not c.is_reply() and not c.is_scope_removed()]
    
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

    for cc in commentList:        
        if cc.valid:
            for id in xrange(len(span_starts_new.keys())):
                start = span_starts_new.get(id, 0)
                end = span_starts_new.get(id+1, sys.maxint)

                # adjust start                
                if cc.computed_start_offset >= start and cc.computed_start_offset < end:
                    cc.start_wrapper = id
                    cc.start_offset = cc.computed_start_offset - start
                
                # adjust end                        
                if cc.computed_end_offset >= start and cc.computed_end_offset < end:
                    cc.end_wrapper = id
                    cc.end_offset = cc.computed_end_offset - start
            
    # returns to_modify, to_remove
    return [c for c in commentList if c.valid], \
           [c for c in commentList if not c.valid]

def add_marker(text, color, start_ids, end_ids, with_markers, with_colors):
# TODO
# THESE 3 LINES ARE REALLY JUST FOR TESTING THIS IS COPIED FROM C-TEXT.CSS AND SHOULD BE DONE DIFFERENTLY
    BCKCOLORS = ['#FFF', '#FFF39A', '#FFDB9A', '#FFC39A', '#FFAB9A', '#FF879A', '#FF7B9A', '#FF6272']
    for i in range(30) :
        BCKCOLORS.append('#FF6272')

    ret = text 
    
    if with_markers:
        end_ids.reverse()
        ret = "%s%s%s"%(''.join(["[%s&gt;"%start_id for start_id in start_ids]), ret, ''.join(["&lt;%s]"%end_id for end_id in end_ids]))
     
    if with_colors and color != 0 :
      # For some reasons, abiwords can read background style attribute but not background-color
      from cm.cm_settings import USE_ABI
      if USE_ABI:
        ret = "<span style='background:%s;'>%s</span>"%(BCKCOLORS[color], ret)
      else:
        ret = "<span style='background-color:%s;'>%s</span>"%(BCKCOLORS[color], ret)
        
    return ret

# comments are comments and replies :
def insert_comment_markers(htmlcontent, comments, with_markers, with_colors) :

    html = get_the_soup(htmlcontent) ;
    
    if comments :
        max_wrapper = max([comment.end_wrapper for comment in comments])
        min_wrapper = min([comment.start_wrapper for comment in comments])
        
    datas = {} # { wrapper_id : {'start_color':nb_of_comments_unterminated_at_wrapper_start, 'offsets':{offset: [[ids of wrappers starting at offset], [ids of wrappers ending at offset]]}}
    # datas['offsets'][someoffset][0] and idem[1] will be ordered the way comments are (should be ('start_wrapper', 'start_offset', 'end_wrapper', 'end_offset') important)
    cpt = 1 # starting numbered comment
    for comment in comments :
        if comment.is_reply() :
            continue ;
        
        # start 
        wrapper_data = datas.get(comment.start_wrapper, {'start_color':0, 'offsets':{}})
        offset = wrapper_data.get('offsets').get(comment.start_offset, [[],[]])
        offset[0].append(cpt)
        wrapper_data['offsets'][comment.start_offset] = offset
        datas[comment.start_wrapper] = wrapper_data
            
        # end 
        wrapper_data = datas.get(comment.end_wrapper, {'start_color':0, 'offsets':{}})
        offset = wrapper_data.get('offsets').get(comment.end_offset, [[],[]])
        offset[1].append(cpt)
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

        d = html.find(id = "sv-%d"%wrapper_id)
        if not d: # comment detached
            continue
        content = d.contents[0]
        
        spans = ""
        
        if offsets :
            color = start_color
            
            start = 0
            start_ids = []
            end_ids = []
            
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
