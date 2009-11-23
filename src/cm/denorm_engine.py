# This is the denormalisation engine
# his goal is to leverage on django's signal to update
# denormalized fields
# this should be used with beanstalk or starling
# python client (there is 2) http://github.com/earl/beanstalkc/tree/master

import logging
from django.db.models import signals
from cm.models import TextVersion, Text

# Text denormalisation
def update_text_from_last_version(sender, **kwargs):
    """
    Update text's last version
    """
    text_version = kwargs['instance']
    try:
        text = text_version.text
        text.update_denorm_fields()
    except Text.DoesNotExist:
        logging.warning('No text found for text_version: %i' %text_version.id)
        
        
def connect_all():
    # text updated by text_version
    signals.post_save.connect(update_text_from_last_version, sender=TextVersion)
    signals.post_delete.connect(update_text_from_last_version, sender=TextVersion)


connect_all()