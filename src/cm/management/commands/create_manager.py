from django.core.management.base import LabelCommand, CommandError

class Command(LabelCommand):
    help = "Create manager"

    def handle(self, *labels, **options):
        if len(labels)!=5:
            raise CommandError("Enter manager's email, username, password, first_name, last_name")
        email       = labels[0]
        username    = labels[1]
        password    = labels[2]
        first_name  = labels[3]
        last_name   = labels[4]
        
        from cm.models import UserProfile
        UserProfile.objects._create_manager(email, username, password, first_name, last_name)