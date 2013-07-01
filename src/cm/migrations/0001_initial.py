
from south.db import db
from django.db import models
from cm.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'Notification'
        db.create_table('cm_notification', (
            ('id', orm['cm.Notification:id']),
            ('key', orm['cm.Notification:key']),
            ('adminkey', orm['cm.Notification:adminkey']),
            ('user', orm['cm.Notification:user']),
            ('name', orm['cm.Notification:name']),
            ('email', orm['cm.Notification:email']),
            ('text', orm['cm.Notification:text']),
            ('type', orm['cm.Notification:type']),
            ('active', orm['cm.Notification:active']),
        ))
        db.send_create_signal('cm', ['Notification'])
        
        # Adding model 'Activity'
        db.create_table('cm_activity', (
            ('id', orm['cm.Activity:id']),
            ('created', orm['cm.Activity:created']),
            ('originator_user', orm['cm.Activity:originator_user']),
            ('text', orm['cm.Activity:text']),
            ('text_version', orm['cm.Activity:text_version']),
            ('comment', orm['cm.Activity:comment']),
            ('user', orm['cm.Activity:user']),
            ('type', orm['cm.Activity:type']),
            ('ip', orm['cm.Activity:ip']),
        ))
        db.send_create_signal('cm', ['Activity'])
        
        # Adding model 'Comment'
        db.create_table('cm_comment', (
            ('id', orm['cm.Comment:id']),
            ('key', orm['cm.Comment:key']),
            ('adminkey', orm['cm.Comment:adminkey']),
            ('deleted', orm['cm.Comment:deleted']),
            ('state', orm['cm.Comment:state']),
            ('user', orm['cm.Comment:user']),
            ('name', orm['cm.Comment:name']),
            ('email', orm['cm.Comment:email']),
            ('modified', orm['cm.Comment:modified']),
            ('created', orm['cm.Comment:created']),
            ('text_version', orm['cm.Comment:text_version']),
            ('reply_to', orm['cm.Comment:reply_to']),
            ('title', orm['cm.Comment:title']),
            ('content', orm['cm.Comment:content']),
            ('content_html', orm['cm.Comment:content_html']),
            ('format', orm['cm.Comment:format']),
            ('tags', orm['cm.Comment:tags']),
            ('start_wrapper', orm['cm.Comment:start_wrapper']),
            ('end_wrapper', orm['cm.Comment:end_wrapper']),
            ('start_offset', orm['cm.Comment:start_offset']),
            ('end_offset', orm['cm.Comment:end_offset']),
        ))
        db.send_create_signal('cm', ['Comment'])
        
        # Adding model 'Configuration'
        db.create_table('cm_configuration', (
            ('id', orm['cm.Configuration:id']),
            ('key', orm['cm.Configuration:key']),
            ('raw_value', orm['cm.Configuration:raw_value']),
        ))
        db.send_create_signal('cm', ['Configuration'])
        
        # Adding model 'UserRole'
        db.create_table('cm_userrole', (
            ('id', orm['cm.UserRole:id']),
            ('role', orm['cm.UserRole:role']),
            ('user', orm['cm.UserRole:user']),
            ('text', orm['cm.UserRole:text']),
        ))
        db.send_create_signal('cm', ['UserRole'])
        
        # Adding model 'Attachment'
        db.create_table('cm_attachment', (
            ('id', orm['cm.Attachment:id']),
            ('key', orm['cm.Attachment:key']),
            ('adminkey', orm['cm.Attachment:adminkey']),
            ('data', orm['cm.Attachment:data']),
            ('text_version', orm['cm.Attachment:text_version']),
        ))
        db.send_create_signal('cm', ['Attachment'])
        
        # Adding model 'Email'
        db.create_table('cm_email', (
            ('id', orm['cm.Email:id']),
            ('created', orm['cm.Email:created']),
            ('subject', orm['cm.Email:subject']),
            ('body', orm['cm.Email:body']),
            ('from_email', orm['cm.Email:from_email']),
            ('to', orm['cm.Email:to']),
            ('bcc', orm['cm.Email:bcc']),
            ('message', orm['cm.Email:message']),
        ))
        db.send_create_signal('cm', ['Email'])
        
        # Adding model 'Text'
        db.create_table('cm_text', (
            ('id', orm['cm.Text:id']),
            ('key', orm['cm.Text:key']),
            ('adminkey', orm['cm.Text:adminkey']),
            ('deleted', orm['cm.Text:deleted']),
            ('state', orm['cm.Text:state']),
            ('user', orm['cm.Text:user']),
            ('name', orm['cm.Text:name']),
            ('email', orm['cm.Text:email']),
            ('modified', orm['cm.Text:modified']),
            ('created', orm['cm.Text:created']),
            ('private_feed_key', orm['cm.Text:private_feed_key']),
            ('last_text_version', orm['cm.Text:last_text_version']),
            ('title', orm['cm.Text:title']),
        ))
        db.send_create_signal('cm', ['Text'])
        
        # Adding model 'TextVersion'
        db.create_table('cm_textversion', (
            ('id', orm['cm.TextVersion:id']),
            ('user', orm['cm.TextVersion:user']),
            ('name', orm['cm.TextVersion:name']),
            ('email', orm['cm.TextVersion:email']),
            ('modified', orm['cm.TextVersion:modified']),
            ('created', orm['cm.TextVersion:created']),
            ('title', orm['cm.TextVersion:title']),
            ('format', orm['cm.TextVersion:format']),
            ('content', orm['cm.TextVersion:content']),
            ('tags', orm['cm.TextVersion:tags']),
            ('note', orm['cm.TextVersion:note']),
            ('mod_posteriori', orm['cm.TextVersion:mod_posteriori']),
            ('text', orm['cm.TextVersion:text']),
        ))
        db.send_create_signal('cm', ['TextVersion'])
        
        # Adding model 'UserProfile'
        db.create_table('cm_userprofile', (
            ('id', orm['cm.UserProfile:id']),
            ('key', orm['cm.UserProfile:key']),
            ('adminkey', orm['cm.UserProfile:adminkey']),
            ('modified', orm['cm.UserProfile:modified']),
            ('created', orm['cm.UserProfile:created']),
            ('user', orm['cm.UserProfile:user']),
            ('allow_contact', orm['cm.UserProfile:allow_contact']),
            ('preferred_language', orm['cm.UserProfile:preferred_language']),
            ('is_temp', orm['cm.UserProfile:is_temp']),
            ('is_email_error', orm['cm.UserProfile:is_email_error']),
            ('is_suspended', orm['cm.UserProfile:is_suspended']),
        ))
        db.send_create_signal('cm', ['UserProfile'])
        
        # Adding model 'Role'
        db.create_table('cm_role', (
            ('id', orm['cm.Role:id']),
            ('name', orm['cm.Role:name']),
            ('description', orm['cm.Role:description']),
            ('global_scope', orm['cm.Role:global_scope']),
            ('anon', orm['cm.Role:anon']),
        ))
        db.send_create_signal('cm', ['Role'])
        
        # Adding ManyToManyField 'Role.permissions'
        db.create_table('cm_role_permissions', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('role', models.ForeignKey(orm.Role, null=False)),
            ('permission', models.ForeignKey(orm['auth.Permission'], null=False))
        ))
        
        # Creating unique_together for [role, user, text] on UserRole.
        db.create_unique('cm_userrole', ['role_id', 'user_id', 'text_id'])
        
    
    
    def backwards(self, orm):
        
        # Deleting unique_together for [role, user, text] on UserRole.
        db.delete_unique('cm_userrole', ['role_id', 'user_id', 'text_id'])
        
        # Deleting model 'Notification'
        db.delete_table('cm_notification')
        
        # Deleting model 'Activity'
        db.delete_table('cm_activity')
        
        # Deleting model 'Comment'
        db.delete_table('cm_comment')
        
        # Deleting model 'Configuration'
        db.delete_table('cm_configuration')
        
        # Deleting model 'UserRole'
        db.delete_table('cm_userrole')
        
        # Deleting model 'Attachment'
        db.delete_table('cm_attachment')
        
        # Deleting model 'Email'
        db.delete_table('cm_email')
        
        # Deleting model 'Text'
        db.delete_table('cm_text')
        
        # Deleting model 'TextVersion'
        db.delete_table('cm_textversion')
        
        # Deleting model 'UserProfile'
        db.delete_table('cm_userprofile')
        
        # Deleting model 'Role'
        db.delete_table('cm_role')
        
        # Dropping ManyToManyField 'Role.permissions'
        db.delete_table('cm_role_permissions')
        
    
    
    models = {
        'auth.group': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'unique_together': "(('content_type', 'codename'),)"},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '75'})
        },
        'cm.activity': {
            'comment': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['cm.Comment']", 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip': ('django.db.models.fields.IPAddressField', [], {'default': 'None', 'max_length': '15', 'null': 'True', 'blank': 'True'}),
            'originator_user': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'originator_activity'", 'null': 'True', 'blank': 'True', 'to': "orm['auth.User']"}),
            'text': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['cm.Text']", 'null': 'True', 'blank': 'True'}),
            'text_version': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['cm.TextVersion']", 'null': 'True', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'cm.attachment': {
            'adminkey': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'data': ('django.db.models.fields.files.FileField', [], {'max_length': '1000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'text_version': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.TextVersion']"})
        },
        'cm.comment': {
            'adminkey': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'content_html': ('django.db.models.fields.TextField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'db_index': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'end_offset': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'end_wrapper': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'format': ('django.db.models.fields.CharField', [], {'default': "'markdown'", 'max_length': '20'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'reply_to': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.Comment']", 'null': 'True', 'blank': 'True'}),
            'start_offset': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'start_wrapper': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '16'}),
            'tags': ('tagging.fields.TagField', [], {}),
            'text_version': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.TextVersion']"}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'cm.configuration': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.TextField', [], {}),
            'raw_value': ('django.db.models.fields.TextField', [], {})
        },
        'cm.email': {
            'bcc': ('django.db.models.fields.TextField', [], {}),
            'body': ('django.db.models.fields.TextField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'from_email': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {}),
            'subject': ('django.db.models.fields.TextField', [], {}),
            'to': ('django.db.models.fields.TextField', [], {})
        },
        'cm.notification': {
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'adminkey': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.Text']", 'null': 'True', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'cm.role': {
            'anon': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'global_scope': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '50'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']"})
        },
        'cm.text': {
            'adminkey': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'db_index': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'last_text_version': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'related_text'", 'null': 'True', 'to': "orm['cm.TextVersion']"}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'private_feed_key': ('django.db.models.fields.CharField', [], {'null': 'True', 'default': 'None', 'max_length': '20', 'blank': 'True', 'unique': 'True', 'db_index': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '16'}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'cm.textversion': {
            'content': ('django.db.models.fields.TextField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'format': ('django.db.models.fields.CharField', [], {'default': "'markdown'", 'max_length': '20'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mod_posteriori': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'note': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'tags': ('tagging.fields.TagField', [], {'max_length': '1000'}),
            'text': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.Text']"}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'cm.userprofile': {
            'adminkey': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'allow_contact': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_email_error': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_suspended': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_temp': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'key': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20', 'db_index': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'preferred_language': ('django.db.models.fields.CharField', [], {'default': "'en'", 'max_length': '2'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'unique': 'True'})
        },
        'cm.userrole': {
            'Meta': {'unique_together': "(('role', 'user', 'text'),)"},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'role': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.Role']", 'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['cm.Text']", 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'contenttypes.contenttype': {
            'Meta': {'unique_together': "(('app_label', 'model'),)", 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }
    
    complete_apps = ['cm']
