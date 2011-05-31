from south.management.commands.migrate import  Command
from south.db import DEFAULT_DB_ALIAS
from south import migration
import sys

### RBA+GIB: prevent uno custom __import__ from messing with south import machinery (to discover south enabled dj apps)
def new_handle(self, app=None, target=None, skip=False, merge=False, backwards=False, fake=False, db_dry_run=False, show_list=False, database=DEFAULT_DB_ALIAS, delete_ghosts=False, ignore_ghosts=False, **options):

    # NOTE: THIS IS DUPLICATED FROM django.core.management.commands.syncdb
    # This code imports any module named 'management' in INSTALLED_APPS.
    # The 'management' module is the preferred way of listening to post_syncdb
    # signals, and since we're sending those out with create_table migrations,
    # we need apps to behave correctly.
    from django.conf import settings
    for app_name in settings.INSTALLED_APPS:
        try:
            __import__(app_name + '.management', {}, {}, [''])
        except ImportError, exc:
            msg = exc.args[0]
            if (not msg.startswith('No module named') and not msg.endswith(' is unknown') ) or 'management' not in msg:
                raise

    # END DJANGO DUPE CODE
        
    # if all_apps flag is set, shift app over to target
    if options.get('all_apps', False):
        target = app
        app = None

    # Migrate each app
    if app:
        try:
            apps = [Migrations(app)]
        except NoMigrations:
            print "The app '%s' does not appear to use migrations." % app
            print "./manage.py migrate " + self.args
            return
    else:
        apps = list(migration.all_migrations())
        
    # Do we need to show the list of migrations?
    if show_list and apps:
        list_migrations(apps, database)
        
    if not show_list:
            
        for app in apps:
            result = migration.migrate_app(
                app,
                target_name = target,
                fake = fake,
                db_dry_run = db_dry_run,
                verbosity = int(options.get('verbosity', 0)),
                interactive = options.get('interactive', True),
                load_initial_data = not options.get('no_initial_data', False),
                merge = merge,
                skip = skip,
                database = database,
                delete_ghosts = delete_ghosts,
                ignore_ghosts = ignore_ghosts,
            )
            if result is False:
                sys.exit(1) # Migration failed, so the command fails.

Command.handle = new_handle
