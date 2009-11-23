"""
Package to manipulage html chunks
"""

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
    

# utilities    
def get_text_nodes(soup):
    return soup(text=lambda text:not isinstance(text, Comment))


import re

def cleanup_textarea(input):
    """
    Cleanup \r\n to standard \n    
    """
    return re.sub('(\r\n)|(\n)|(\r)','\n',input)