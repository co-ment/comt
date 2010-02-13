import chardet
import re

def to_unicode(input):
    if type(input) == str:
        res = None
        for encoding in [chardet.detect(input)['encoding'], 'utf8', 'latin1']:
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

