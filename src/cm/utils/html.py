"""
Package to manipulage html chunks
"""

from string_utils import strip_cr
from BeautifulSoup import BeautifulSoup, Comment

def surrond_text_node(html_chunk, start_html, end_html):
    """
    Surround text nodes in html_chunk
    """
    soup = BeautifulSoup(html_chunk)
    text_nodes = get_text_nodes(soup)
    for text_node in text_nodes:        
        if text_node.string.strip():
            text_node.replaceWith(start_html + text_node.string + end_html)
    return unicode(soup)
    

#utilities    
def get_text_nodes(soup):
    return soup(text=lambda text:not isinstance(text, Comment))

#WARNING behavior changed also for mardown. but really shouldn't hurt 20100212
#it is text as received from textarea
def on_content_receive(txt, format) :
    #because textarea content arent packaged the same way on windows IE and linux FF, dhouldn't't hurt to clean it for any format
    return strip_cr(txt)

