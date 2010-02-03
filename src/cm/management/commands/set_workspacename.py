from django.core.management.base import LabelCommand, CommandError

class Command(LabelCommand):
    help = "Change workspace name"

    def handle(self, *labels, **options):
        if len(labels)!=1:
            raise CommandError('Enter workspace name')
        name = labels[0]
        from cm.models import Configuration
        Configuration.objects.set_workspace_name(name.decode('utf8'))        
