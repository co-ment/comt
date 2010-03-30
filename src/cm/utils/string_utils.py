import chardet
import re

def to_unicode(input):
    if type(input) == str:
        res = None
        encodings = ['utf8', 'latin1']
        doc_enc = chardet.detect(input)['encoding']
        if doc_enc:
            encodings = [doc_enc,] + encodings  
        for encoding in encodings:
            try:
                res = unicode(input, encoding)
                break;
            except UnicodeDecodeError:
                pass
        if not res:
            raise Exception('UnicodeDecodeError: could not decode')
        return res
    return input

# strip carriage returns
def strip_cr(input):
    return re.sub('\r\n|\r|\n', '\n', input)

