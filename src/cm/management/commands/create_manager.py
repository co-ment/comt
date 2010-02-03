from django.core.management.base import LabelCommand, CommandError, BaseCommand, make_option
from base64 import b64decode

class Command(LabelCommand):
    option_list = BaseCommand.option_list + (
        make_option('--base64', action='store_true', dest='base64', default=False,
            help='Assume all input are base64 encoded.'),
    )
        
    help = "Create manager"

    def handle(self, *labels, **options):
        if len(labels)!=5:
            raise CommandError("Enter manager's email, username, password, first_name, last_name")

        base64 = options.get('base64')
        if base64:
            email       = b64decode(labels[0])
            username    = b64decode(labels[1])
            password    = b64decode(labels[2])
            first_name  = b64decode(labels[3])
            last_name   = b64decode(labels[4])
        else:
            email       = labels[0]
            username    = labels[1]
            password    = labels[2]
            first_name  = labels[3]
            last_name   = labels[4]
        
        email = email.decode('utf8')
        username = username.decode('utf8')
        password = password.decode('utf8')
        first_name = first_name.decode('utf8')
        last_name = last_name.decode('utf8')
        
        from cm.models import UserProfile
        UserProfile.objects._create_manager(email, username, password, first_name, last_name)