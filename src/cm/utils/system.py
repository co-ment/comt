# taken from plone

import os

bin_search_path = [
    '/usr/bin',
    '/usr/local/bin',
    ]

class MissingBinary(Exception): pass

def bin_search(binary):
    """search the bin_search_path  for a given binary
    returning its fullname or None"""
    result = None
    mode   = os.R_OK | os.X_OK
    for p in bin_search_path:
        path = os.path.join(p, binary)
        if os.access(path, mode) == 1:
            result = path
            break
    else:
        raise MissingBinary('Unable to find binary "%s"' % binary)
    return result