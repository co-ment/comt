from django.core.cache import cache
from hashlib import sha1
from django.conf import settings

# adapted [to django] from http://code.activestate.com/recipes/325205/
def dj_memoize(f):
    def g(*args, **kwargs):
        key = sha1( str((settings.SITE_URL, f.__name__, f, tuple(args), frozenset(kwargs.items())) )).hexdigest()
        val = cache.get(key)
        if not val:
            val = f(*args, **kwargs)
            cache.set(key,val)
        return val
    return g



# adapted from http://code.activestate.com/recipes/496879/
# decorator with LRU policy

# changed : 
#  - default limit is 100
#  - store sha1 of key (shorter) 
import cPickle, hashlib

def memoize(function, limit=100):
    if isinstance(function, int):
        def memoize_wrapper(f):
            return memoize(f, function)

        return memoize_wrapper

    dict = {}
    list = []
    def memoize_wrapper(*args, **kwargs):
        key = hashlib.sha1(cPickle.dumps((args, kwargs))).digest()
        try:
            list.append(list.pop(list.index(key)))
        except ValueError:
            dict[key] = function(*args, **kwargs)
            list.append(key)
            if limit is not None and len(list) > limit:
                del dict[list.pop(0)]

        return dict[key]

    memoize_wrapper._memoize_dict = dict
    memoize_wrapper._memoize_list = list
    memoize_wrapper._memoize_limit = limit
    memoize_wrapper._memoize_origfunc = function
    memoize_wrapper.func_name = function.func_name
    return memoize_wrapper
