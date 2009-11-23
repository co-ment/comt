import time
from django.utils.translation import ugettext as _

#http://docs.python.org/lib/module-time.html
def datetime_to_user_str(dt):
    return dt.strftime(str(_("%Y-%m-%d %H:%M"))) 

#def datetime_to_str(dt):
#    return dt.strftime(CLIENT_DATE_FMT['python_output'])

def datetime_to_epoch(dt):
    return time.mktime(dt.timetuple())

#def datetime_to_js_date_str(dt):
#    print str(1000*mktime(dt.timetuple()))
#    return str(1000*mktime(dt.timetuple()))