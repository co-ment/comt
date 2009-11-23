
def update(obj, kwargs):
    """
    Update obj attributes with values from kwargs
    """
    for k,v in kwargs.items():
        if hasattr(obj,k):
            setattr(obj,k,v)
            