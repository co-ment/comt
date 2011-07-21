import logging
from django.db.models import signals

def logger_config():
    # create logger
    logger = logging.getLogger()
    ch = logging.StreamHandler()
    # create formatter
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(module)s - %(funcName)s - %(message)s")
    # add formatter to ch
    ch.setFormatter(formatter)
    # add ch to logger
    logger.addHandler(ch)

logger_config()
