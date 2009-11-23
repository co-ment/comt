def display_message(request, string):
    request.flash['message'] = string 
    