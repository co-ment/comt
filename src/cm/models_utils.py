# models used to internal work
from django.db import models
from django.contrib.auth.models import User

 
class Email(models.Model):
    """
    Simple (no multipart support) email storage
    """
    created = models.DateTimeField(auto_now_add=True)

    subject = models.TextField()
    body = models.TextField()
    from_email = models.TextField()
    to = models.TextField()
    bcc = models.TextField()
    message = models.TextField() #full message
    
    def get_recipents_number(self):
        from cm.utils.mail import LIST_SEP
        res = 0
        if self.to:
            res = len(self.to.split(LIST_SEP))
        if self.bcc:
            res += len(self.bcc.split(LIST_SEP))
        return res
      
    get_recipents_number.short_description = "#recipients"
    
    def __unicode__(self):
        return ' '.join([self.from_email, self.to, self.subject])

