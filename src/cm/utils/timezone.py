from datetime import timedelta
from pytz import timezone, utc, UnknownTimeZoneError
from django.conf import settings

local_tz = timezone(settings.TIME_ZONE)

def request_tz_convert(date, request):
    return tz_convert(date, request.session.get('tz',None))

def tz_convert(date, tz):
    """
    Convert date to time zone
    tz can be;
        - '-2' (relative to utc)
        - 'Paris/Europe' real timezone like (cf pytz)
    """
    if tz:
        system_local_date = local_tz.localize(date)
        try:
             # simple utc delta?
            utc_offset = int(tz)
            utc_time = system_local_date.astimezone(utc)
            res = utc.normalize(utc_time + timedelta(hours=utc_offset))
            return res
        except:
            try:
                # real timezone
                timez = timezone(tz)
                local_date = system_local_date.astimezone(timez)
                return local_date
            except UnknownTimeZoneError:
                # fall back to date
                return date
                        
    else:
        return date        
