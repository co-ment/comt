def get_among(dico,key,allowed,default):
    res = dico.get(key, None)
    if not res or res not in allowed:
        return default
    else:
        return res
        
        
def get_int(dico, key, default):
    try:
        return int(dico.get(key, default))
    except ValueError:
        return default