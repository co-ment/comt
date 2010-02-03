from django.core.management.base import LabelCommand, CommandError, BaseCommand, make_option
from base64 import b64decode

class Command(LabelCommand):
    option_list = BaseCommand.option_list + (
        make_option('--base64', action='store_true', dest='base64', default=False,
            help='Assume all input are base64 encoded.'),
    )
    
    help = "Change workspace name"

    def handle(self, *labels, **options):
        if len(labels)!=1:
            raise CommandError('Enter workspace name')
        base64 = options.get('base64')
        if base64:
            name = b64decode(labels[0])
        else:
            name = labels[0]
        name = name.decode('utf8')
        
        from cm.models import Configuration        
        Configuration.objects.set_workspace_name(name)        
