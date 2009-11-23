from django.utils.translation.trans_real import translation

def translate_to(value, language_code):
    t = translation(language_code)    
    return getattr(t, 'gettext')(value)
    