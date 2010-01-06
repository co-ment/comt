"""
Simple extension of django's EmailMessage to store emails in db
"""
from cm.cm_settings import CM_EMAIL_SUBJECT_PREFIX
from cm.models import Email
from cm.utils.i18n import translate_to
from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import EmailMessage as BaseEmailMessage
from django.template.loader import render_to_string
LIST_SEP = ' '

class EmailMessage(BaseEmailMessage):
    
    def __init__(self, subject='', body='', from_email=None, to=None, bcc=None,
            connection=None, attachments=None, headers=None):
        if CM_EMAIL_SUBJECT_PREFIX:
            subject = CM_EMAIL_SUBJECT_PREFIX + subject
        BaseEmailMessage.__init__(self, subject, body, from_email, to, bcc, connection, attachments, headers)
    
    def send(self, fail_silently=False):
        # store in db
        Email.objects.create(
                             from_email = self.from_email,
                             to = LIST_SEP.join(self.to),
                             bcc = LIST_SEP.join(self.bcc),
                             body = self.body,
                             subject = self.subject,
                             message = self.message().as_string() 
                             )
        # then send for real
        BaseEmailMessage.send(self,fail_silently)
     
def send_mail(subject, message, from_email, recipient_list,
              fail_silently=False, auth_user=None, auth_password=None):
    """
    Easy wrapper for django replacing of send_mail in django.core.mail
    """
    # Email subject *must not* contain newlines
    subject = ''.join(subject.splitlines())
    
    msg = EmailMessage(subject=subject, body=message, from_email=from_email, to = recipient_list)
    msg.send(fail_silently)
     
def send_mail_in_language(subject, subject_vars, message_template, message_vars, from_email, recipient_list):
    """
    If obj in recipient_list is user: used preferred_language in profile to send the email
    """
    for user_recipient in recipient_list:
        if type(user_recipient) == User:
            lang_code = User.get_profile().preferred_language
            recipient = User.email
        else:
            lang_code = settings.LANGUAGE_CODE
            recipient = user_recipient
            
        processed_subject = translate_to(subject, lang_code) %subject_vars
        processed_message = translate_to(message_template, lang_code) %message_vars
        
        send_mail(processed_subject, processed_message, from_email, recipient)
        
        