def remove_extension(file_name):
    """
    Remove 3 letters and 4 letters extension from filename
    
    >>> remove_extension('my file.tex')
    'my file'
    >>> remove_extension('my file.html')
    'my file'
    >>> remove_extension('my file')
    'my file'
    """
    for point_loc in [3,4]:
        if len(file_name)>point_loc and file_name[-point_loc-1] == '.':
            return file_name[:-point_loc-1] 
    return file_name
    

if __name__ == "__main__":
    import doctest
    doctest.testmod()    