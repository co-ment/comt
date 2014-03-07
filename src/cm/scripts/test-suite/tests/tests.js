
// " Vim settings
// set tabstop=4          " number of spaces in a tab
// set softtabstop=4      " as above
// set shiftwidth=4       " as above


// check that public texts still work while unlogged
// check that non public texts are unavailable
// Are the public texts displayed in the login page ?

var w = __karma__.config.w,
	z = {};
const non_visible = false, no_tagline = false;
const t = {
	'#id_workspace_name':	'Test workspace name',
	'#id_workspace_tagline':	'Test workspace tagline',
	'#id_workspace_registration':		'on',		// registration
	'#id_workspace_registration_moderation':	'on',		// registration moderation
	'#id_workspace_role_model':	'generic',
	'#id_workspace_category_1':	'ws_cat_1',
	'#id_workspace_category_2':	'ws_cat_2',
	'#id_workspace_category_3':	'ws_cat_3',
	'#id_workspace_category_4':	'ws_cat_4',
	'#id_workspace_category_5':	'ws_cat_5',
	'#id_custom_css': ".voted {\n  color: #008000;\n}\n\n.rejected, .fallen, .withdrawn {\n  color: #ff0000;\n}\n\ndiv.frame {\n  border: 1px solid #000;\n  padding: 5px;\n}\n\ndiv.frame .title {\n  font-weight: bold;\n  text-align: center; font-color:purple; \n}",
	'#id_custom_font': 'Ubuntu',
	'#id_custom_titles_font': 'Ubuntu Monospaced',
};


suite ('comt', function () {

	this.timeout(150000);

	suite ('contact page conformity', function () {
		test_page_loading ('/contact/', 'Contact');
		test_unlogged_header ();
		test_val	('form#profile[action="."]'); // the form exists
		test_count	('form#profile :input', 7); // it has no more than 5 labels (may be no more fields)
		test_form_field ('profile', 'id_name', 'text', 0, 'Your name', true); // the field id_name is…
		test_form_field ('profile', 'id_email', 'text', 1, 'Your email address', true);
		test_form_field ('profile', 'id_title', 'text', 2, 'Subject of the message', true);
		test_form_field ('profile', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_form_field ('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
		test_val	('#profile input[type=submit]','Send'); // test that a the .val() of the element is
		test_val	('input#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test		('to check that toBeDefined test still works', dsl(function () {
			expect (elt ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
		}));
		test		('get back to / to avoid bugging next page load', dsl(function () {
			browser.navigateTo ('/');
		}));
	});

	suite ('help page conformity', function () {
		test_page_loading ('/help/', 'Help');
		test_unlogged_header ();
		test_unlogged_footer ();
	});

	suite ('reset password page conformity', function () {
		test_page_loading ('/password_reset/', 'Reset my password');
		test_unlogged_header ();
		test_val	('form#profile[action="."]');
		test_count	('form#profile :input', 3);
		test_form_field ('profile', 'id_email', 'text', 1, 'E-mail', true);
		test_val	('#profile input[type=submit]', 'Reset my password');
		test_unlogged_footer ();
	});

	suite ('login page conformity', function () {
		test_page_loading ('/', 'Home');
		test_unlogged_header ();
		test_val	('form#login[action="/login/"]');
		test_count	('form#login[action="/login/"] :input', 3);
		test_form_field ('login', 'id_username', 'text', 0, 'Username', true);
		test_form_field ('login', 'id_password', 'password', 1, 'Password', true);
		test_val ('form#login input[type=submit]', 'Login');
		test_text	('form#login a[href="/password_reset/"]', 'Forgot password?');
		test_unlogged_footer ();
		// test_i18n ();
		test		('logs an admin in', dsl(function () {
			input ('#id_username').enter (w.USER_ADMIN);
			input ('#id_password').enter (w.PASS_ADMIN);
			elt ('#login input[type=submit]').click ();
			// Must be done here in this test() block
			browser.waitForPageLoad ();
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard/m);
		}));
	});

	suite ('reading settings', function () {
        test_page_loading	('/settings/', 'Settings');
		test_readz_field	('#id_workspace_name');
		test_readz_field	('#id_workspace_tagline');
		test_readz_field	('#id_workspace_registration');
		test_readz_field	('#id_workspace_registration_moderation');
		test_readz_field	('#id_workspace_role_model');
		test_readz_field	('#id_workspace_category_1');
		test_readz_field	('#id_workspace_category_2');
		test_readz_field	('#id_workspace_category_3');
		test_readz_field	('#id_workspace_category_4');
		test_readz_field	('#id_workspace_category_5');
		test_page_loading	('/settings/design/', 'Settings');
		test_readz_field	('#id_custom_css');
		test_readz_field	('#id_custom_font');
		test_readz_field	('#id_custom_titles_font');
		/*test ('display z', dsl(function () {
			elt ('#main-tabs').text (function (t) {
				console.log ('z '+JSON.stringify(z));
			});
		}));*/
    });

	suite ('setting settings to test values', function () {
		test_page_loading ('/settings/', 'Settings');
		test_fill_settings (t);
		test_val ('#id_workspace_name', t['#id_workspace_name']);
		test ('Save test settings ', dsl (function () {
			elt ('#settings input[type="submit"]').click ();
			browser.waitForPageLoad ();
		}));
        test_page_loading	('/settings/', 'Settings');
		test_text ('#content h1.main_title a[href="/"]', t['#id_workspace_name']);
		test_page_loading	('/settings/design/', 'Settings');
		test_fill_design (t);
		test ('Save test design settings ', dsl (function () {
			elt ('#settings input[type="submit"]').click ();
			browser.waitForPageLoad ();
		}));
    });

	suite ('admin dashboard page conformity', function () {
		test_page_loading ('/', 'Dashboard\n - '+t['#id_workspace_name']);
		test_logged_header (w.USER_ADMIN);
		test ('get text and user nb', dsl(function () {
			element ('span.metadata:eq(0)').text (function (metadata) {
				var r = metadata.match (/(\d+) texts, (\d+) users/);
				if (r.length != 3) throw 'expected 3 matches got '+r.length;
				z.text_nb = r[1];
				z.user_nb = r[2];
			});
		}));
		test_default_tabs ();
		test_count	('table.dash_table', 5);
		test_text	('table.dash_table th:eq(0)', 'Actions');
		test_match	('table.dash_table:eq(0) a:eq(0)[href="/create/content/"]', /\sCreate a text/);
		test_text	('table.dash_table:eq(0) a:eq(1).tip[href="#"]', ' ');
		test_match	('table.dash_table:eq(0) a:eq(2)[href="/create/upload/"]', /\sUpload a text/);
		test_text	('table.dash_table:eq(0) a:eq(3).tip[href="#"]', ' ');
		test_match	('table.dash_table:eq(0) a:eq(4)[href="/create/import/"]', /\sImport a co-mented text/);
		test_text	('table.dash_table:eq(0) a:eq(5).tip[href="#"]', ' ');
		test_match	('table.dash_table:eq(0) a:eq(6)[href="/user/add/"]', /\sInvite user/);
		test_match	('table.dash_table:eq(0) a:eq(7)[href="/profile/"]', /\sEdit your profile/);
		test_match	('table.dash_table:eq(0) a:eq(8)[href="/text/"]', /\sView text list/);
		test_match	('table.dash_table:eq(0) a:eq(9)[href="/settings/"]', /\sConfigure workspace/);
		test_text	('table.dash_table th:eq(1)', 'Recent texts (all)');
		test_text	('table.dash_table:eq(1) a:eq(0)[href="/text/"]', 'all');
		test_text	('table.dash_table th:eq(2)', 'Recent comments');
		test_match	('table.dash_table th:eq(3)', /^Workspace activity\n\s+\(month\/week\/24 hours\)$/m);
		test_text	('table.dash_table:eq(3) a:eq(0)[href="?span=month"]', 'month');
		test_text	('table.dash_table:eq(3) a:eq(1)[href="?span=day"]', '24 hours');
		test_text	('table.dash_table th:eq(4) span.em', 'Activities');
		test_unlogged_footer ();
	});

	suite ('texts list page conformity', function () {
		test_page_loading	('/text/', 'Texts\n - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		// TOTEST : filter by tag
		test_count	('form#filter_form[action="."] :input', 1);
		test_text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', non_visible);
		test		('#texts_form input count', dsl (function () {
			elt ('form#texts_form[action="."] :input').count (function (c) {
				var n = 3 + z.text_nb % 10;
				if (c != n) throw 'expected computed '+n+' to equal got '+c;
			});
		}));
		test		('#paginator "of #" value', dsl (function () {
			elt ('span#paginator').text (function (t) {
				var r = t.match (/\s\d+-\d+ of (\d+)\s/m);
				if (r.length != 2) throw 'expected 2 matches got '+r.length;
				if (r[1] != z.text_nb) throw 'expected paginator total ('+r[1]+') to be '+z.text_nb;
			});
		}));
		// TOTEST : pagination
		// TOTEST : Bulk Actions -> Apply does enable
		test_text	('select#bulk_actions option:eq(0)[selected][value="-1"]', 'Bulk Actions', non_visible);
		test_text	('select#bulk_actions option:eq(1)[value="delete"]', 'Delete', non_visible);
		test_val	('form#texts_form input#apply[type=button][disabled]', 'Apply');
		test_count	('table.large_table:eq(1) th', 6);
		test_val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_text	('table.large_table:eq(1) th:eq(1) a[href="?order=title"]', 'Text');
		test_text	('table.large_table:eq(1) th:eq(2)', 'Author');
		test_text	('table.large_table:eq(1) th:eq(3) a[href="?order=-modified"]', 'Modified');
		test_text	('table.large_table:eq(1) th:eq(4)', '# comments');
		test_text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_unlogged_footer ();
	});

	suite ('create a text page conformity', function () {
        test_page_loading	('/create/content/', 'Create a text - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
        test_count  ('#text form[action="."]:eq(0) :input', 6);
		test_form_field ('text', 'id_title',		'text', 0, 'Title', true);
		test_form_field ('text', 'id_format',		'select', 1, 'Format', true);
		test_form_field ('text', 'id_content',		'textarea', 2, 'Content', true);
		test_form_field ('text', 'id_tags',			'text', 3, 'Tags');
		test_val	('#text :input:eq(4)[type=submit]', 'Save');
		test_val	('#text :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_count	('select#id_format option', 3);
        test_text   ('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', non_visible);
        test_text   ('select#id_format option:eq(1)[value="rst"]', 'rst', non_visible);
        test_text   ('select#id_format option:eq(2)[value="html"]', 'html', non_visible);
		test_count	('#markItUpId_content li', 20);
        test_unlogged_footer ();
    });

	suite ('upload text page conformity', function () {
        test_page_loading	('/create/upload/', 'Upload a text - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
        test_count  ('#text form[action="."]:eq(0) :input', 6);
		test_form_field ('text', 'id_title',		'text', 0, 'Title');
		test_form_field ('text', 'id_format',		'select', 1, 'Format', true);
		test_form_field ('text', 'id_tags',			'text', 2, 'Tags');
		test_form_field ('text', 'id_file',			'file', 3, 'Upload file (optional)');
		test_val	('#text :input:eq(4)[type=submit]', 'Save');
		test_val	('#text :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_count	('select#id_format option', 3);
        test_text   ('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', non_visible);
        test_text   ('select#id_format option:eq(1)[value="rst"]', 'rst', non_visible);
        test_text   ('select#id_format option:eq(2)[value="html"]', 'html', non_visible);
        test_unlogged_footer ();
    });

	suite ('import a co-mented text page conformity', function () {
        test_page_loading	('/create/import/', 'Import a co-mented text - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/upload/"]', 'Upload a text');
        test_count  ('#text form[action="."]:eq(0) :input', 3);
		test_form_field ('text', 'id_file',	'file', 0, 'Upload XML file', true);
		test_val	('#text :input:eq(1)[type=submit]', 'Save');
		test_val	('#text :input:eq(2)#cancel_button[type=button]', 'Cancel');
        test_unlogged_footer ();
    });

	suite ('edit profile page conformity', function () {
        test_page_loading	('/profile/', 'Your profile [(]'+w.USER_ADMIN+'[)]\n - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN, no_tagline);
        test_count  ('#content ul.sub_list:eq(0) a', 1);
        test_text   ('#content ul.sub_list:eq(0) a:eq(0)[href="/profile-pw/"]', 'Password');
        test_count  ('form#profile[action="."]:eq(0) :input', 5);
		test_form_field ('profile', 'id_email',		'text', 0, 'E-mail address', true);
		test_form_field ('profile', 'id_first_name','text', 1, 'First name');
		test_form_field ('profile', 'id_last_name',	'text', 2, 'Last name');
		test_form_field ('profile', 'id_tags',		'text', 3, 'Tags');
		test_val	('#profile :input:eq(4)[type=submit]', 'Save');
        test_unlogged_footer ();
    });

	suite ('edit password page conformity', function () {
        test_page_loading	('/profile-pw/', 'Your profile [(]'+w.USER_ADMIN+'[)]\n - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN, no_tagline);
        test_count  ('#content ul.sub_list:eq(0) a', 1);
        test_text   ('#content ul.sub_list:eq(0) a:eq(0)[href="/profile/"]', 'Profile');
        test_count  ('form#profile[action="."]:eq(0) :input', 4);
		test_form_field ('profile', 'id_old_password',	'password', 0, 'Old password', true);
		test_form_field ('profile', 'id_new_password1', 'password', 1, 'New password', true);
		test_form_field ('profile', 'id_new_password2',	'password', 2, 'New password confirmation', true);
		test_val	('#profile :input:eq(3)[type=submit]', 'Save');
        test_unlogged_footer ();
    });

    suite ('people list page conformity', function () {
        test_page_loading	('/user/', 'People\' list\n - '+t['#id_workspace_name']);
        test_logged_header	(w.USER_ADMIN);
        test_default_tabs	();
        test_count  ('#user ul.sub_list:eq(0) a', 2);
        test_text   ('#user ul.sub_list:eq(0) a:eq(0)[href="/user/add/"]', 'Add a new user');
        test_text   ('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
        // TOTEST : filter by tag
        test_count  ('form#filter_form[action="."] :input', 1);
		test_text	('#filter_form a[href="?display=1"]', 'Display suspended users');
        test_text   ('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', non_visible);
        // TOTEST : pagination
        // TOTEST : Bulk Actions -> Apply does enable
        test_text   ('select#bulk_actions option:eq(0)[selected][value="-1"]', '- Bulk Actions -', non_visible);
        test_text   ('select#bulk_actions option:eq(1)[value="disable"]', 'Suspend access', non_visible);
        test_text   ('select#bulk_actions option:eq(2)[value="enable"]', 'Enable access', non_visible);
        test_text   ('select#bulk_actions option:eq(3)[value="role_1"]', 'Change role to Manager', non_visible);
        test_text   ('select#bulk_actions option:eq(4)[value="role_2"]', 'Change role to Editor', non_visible);
        test_text   ('select#bulk_actions option:eq(5)[value="role_3"]', 'Change role to Moderator', non_visible);
        test_text   ('select#bulk_actions option:eq(6)[value="role_4"]', 'Change role to Commentator', non_visible);
        test_text   ('select#bulk_actions option:eq(7)[value="role_5"]', 'Change role to Observer', non_visible);
        test_val    ('form#user_form input#apply[type=button][disabled]', 'Apply');
        test_count  ('table.large_table:eq(1) th', 6);
        test_val    ('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
        test_text   ('table.large_table:eq(1) th:eq(1) a[href="?order=user__username"]', 'User');
        test_text   ('table.large_table:eq(1) th:eq(2) a[href="?order=user__email"]', 'Email');
        test_text   ('table.large_table:eq(1) th:eq(3) a[href="?order=-user__date_joined"]', 'Date joined');
        test_text   ('table.large_table:eq(1) th:eq(4) a[href="?order=role__name"]', 'Role');
        test_text   ('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_text	('table.large_table:eq(1) tr:last a[href="/user/-/edit/"]', 'Anonymous users');
		test_text	('table.large_table:eq(1) a.main_object_title[href="/profile/"]', w.USER_ADMIN);
		test_text	('table.large_table:eq(1) div.hidden-user-actions a[href="/profile/"]', 'Your profile');
        test_unlogged_footer ();
    });

	suite ('check user number', function () {
        test_page_loading	('/user/?display=1', 'People\' list\n - '+t['#id_workspace_name']);
        test        ('#user_form input count', dsl (function () {
            elt ('form#user_form[action="."] :input').count (function (c) {
                var n = 6 + (z.user_nb % 10) * 2;
                if (c != n) throw 'expected computed '+n+' to equal got '+c;
            });
        }));
        test        ('#paginator "of #" value', dsl (function () {
            elt ('span#paginator').text (function (t) {
                var r = t.match (/\s\d+-\d+ of (\d+)\s/m);
                if (r.length != 2) throw 'expected 2 matches got '+r.length;
                if (r[1] != z.user_nb) throw 'expected paginator total ('+r[1]+') to be '+z.user_nb;
            });
        }));
    });

	suite ('add a user page conformity', function () {
        test_page_loading	('/user/add/', 'Add a new user\n - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#user ul.sub_list:eq(0) a', 2);
        test_text   ('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
        test_text   ('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
        test_count  ('#user form[action="."]:eq(0) :input', 8);
		test_form_field ('user', 'id_email',		'text', 0, 'E-mail address', true);
		test_form_field ('user', 'id_first_name',	'text', 1, 'First name');
		test_form_field ('user', 'id_last_name',	'text', 2, 'Last name');
		test_form_field ('user', 'id_tags',			'text', 3, 'Tags');
		test_form_field ('user', 'id_role',			'select', 4, 'Workspace level role');
		test_form_field ('user', 'id_note',			'textarea', 5, 'Note');
		test_count	('select#id_role option', 6);
        test_text   ('select#id_role option:eq(0)[value][selected]', '---------', non_visible);
        test_text   ('select#id_role option:eq(1)[value="1"]', 'Manager', non_visible);
        test_text   ('select#id_role option:eq(2)[value="2"]', 'Editor', non_visible);
        test_text   ('select#id_role option:eq(3)[value="3"]', 'Moderator', non_visible);
        test_text   ('select#id_role option:eq(4)[value="4"]', 'Commentator', non_visible);
        test_text   ('select#id_role option:eq(5)[value="5"]', 'Observer', non_visible);
		test_val	('#user :input:eq(6)[type=submit]', 'Add user');
		test_val	('#user :input:eq(7)#cancel_button[type=button]', 'Cancel');
        test_unlogged_footer ();
		// TOTEST add user (pending)
    });

	suite ('add users in bulk page conformity', function () {
        test_page_loading	('/user/mass-add/', 'Add users in bulk\n - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#user ul.sub_list:eq(0) a', 2);
        test_text   ('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
        test_text   ('#user ul.sub_list:eq(0) a:eq(1)[href="/user/add/"]', 'Add a new user');
        test_count  ('#user form[action="."]:eq(0) :input', 6);
		test_form_field ('user', 'id_email',		'textarea', 0, 'Emails', true);
		test_form_field ('user', 'id_tags',			'text',		1, 'Tags');
		test_form_field ('user', 'id_role',			'select',	2, 'Workspace level role');
		test_form_field ('user', 'id_note',			'textarea', 3, 'Note');
		test_count	('select#id_role option', 6);
        test_text   ('select#id_role option:eq(0)[value][selected]', '---------', non_visible);
        test_text   ('select#id_role option:eq(1)[value="1"]', 'Manager', non_visible);
        test_text   ('select#id_role option:eq(2)[value="2"]', 'Editor', non_visible);
        test_text   ('select#id_role option:eq(3)[value="3"]', 'Moderator', non_visible);
        test_text   ('select#id_role option:eq(4)[value="4"]', 'Commentator', non_visible);
        test_text   ('select#id_role option:eq(5)[value="5"]', 'Observer', non_visible);
		test_val	('#user :input:eq(4)[type=submit]', 'Add users');
		test_val	('#user :input:eq(5)#cancel_button[type=button]', 'Cancel');
		// X TOTEST add users (pending) -> can't be deleted
        test_unlogged_footer ();
    });

	suite ('settings page conformity', function () {
        test_page_loading	('/settings/', 'Settings - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#settings ul.sub_list:eq(0) a', 1);
        test_text   ('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/design/"]', 'Appearance');
        test_count  ('#settings form[action="."]:eq(0) :input', 12);
		test_form_field ('settings', 'id_workspace_name', 'text', 0, 'Workspace name');
		test_form_field ('settings', 'id_workspace_tagline', 'text', 1, 'Workspace tagline');
		test_form_field ('settings', 'id_workspace_registration', 'checkbox', 2, 'Workspace registration');
		test_form_field ('settings', 'id_workspace_registration_moderation', 'checkbox', 3, 'Workspace registration moderation');
		test_form_field ('settings', 'id_workspace_role_model', 'select', 4, 'Role model');
        test_text   ('select#id_workspace_role_model option:eq(0)[selected][value="generic"]', 'Generic', non_visible);
        test_text   ('select#id_workspace_role_model option:eq(1)[value="teacher"]', 'Class (education)', non_visible);
		test_form_field ('settings', 'id_workspace_category_1', 'text', 5, 'Label for the first category of comments');
		test_form_field ('settings', 'id_workspace_category_2', 'text', 6, 'Label for the second category of comments');
		test_form_field ('settings', 'id_workspace_category_3', 'text', 7, 'Label for the third category of comments');
		test_form_field ('settings', 'id_workspace_category_4', 'text', 8, 'Label for the fourth category of comments');
		test_form_field ('settings', 'id_workspace_category_5', 'text', 9, 'Label for the fifth category of comments');
		test_val	('#settings :input:eq(10)[type=submit]', 'Save');
		test_val	('#settings :input:eq(11)#cancel_button[type=button]', 'Cancel');
		// TOTEST Workspace registration
		test_unlogged_footer ();
    });

	suite ('settings design page conformity', function () {
        test_page_loading	('/settings/design/', 'Settings - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
        test_count  ('#settings ul.sub_list:eq(0) a', 1);
        test_text   ('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/"]', 'General');
        test_count  ('#settings form[action="."]:eq(0) :input', 7);
		test_form_field ('settings', 'id_workspace_logo_file', 'file', 0, 'Workspace logo');
		test_form_field ('settings', 'id_custom_css', 'textarea', 1, 'Custom CSS rules');
		test_form_field ('settings', 'id_custom_font', 'text', 2, 'Custom font');
		test_form_field ('settings', 'id_custom_titles_font', 'text', 3, 'Custom font for titles');
		test_val	('#settings :input:eq(4)[type=submit]', 'Save');
		test_val	('#settings :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_val	('#settings :input:eq(6)#delete_logo_button[type=submit]', 'Delete logo');
		// TOTEST custom CSS, font, font for titles like the rest of the settings
		test_unlogged_footer ();
    });

	suite ('followup page conformity', function () {
		test_page_loading	('/followup/', 'Followup\n - '+t['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	();
		test_text	('#followup a:eq(0)[href="/help/#public_private_feed"]', '?');
		test_match	('#followup a:eq(1)[href$="/feed/"]', new RegExp (w.WORKSPACE_URL+'feed/', 'm'));
		test_text	('#followup a:eq(2)[href="/help/#public_private_feed"]', '?');
		test_count	('form#followup_form[action="."] :input', 3);
		test_val	('form#followup_form input[type=submit]', '(Activate private feed|Reset private feed url)');
		test_val	('form#followup_form input#workspace_notify_check[type=checkbox]', 'on');
		test_val	('form#followup_form input#own_notify_check[type=checkbox]', 'on');
	
		// tester qu'une fois cliqué, le bouton à le nvo label, et qu'une adresse est disponible
		// tester que si on reclique l'adresse est changée

		test_unlogged_footer ();
	});

	suite ('settings restoration', function () {
        test_page_loading	('/settings/', 'Settings');
		test_fill_settings (z);
		test ('Restore settings ', dsl (function () {
			elt ('#settings input[type="submit"]').click ();
			browser.waitForPageLoad ();
		}));
		test_page_loading ('/settings/design/', 'Settings');
		test_fill_design (z);
		test ('Restore design settings ', dsl (function () {
			elt ('#settings input[type="submit"]').click ();
			browser.waitForPageLoad ();
		}));
		// next instruction must be a page loading
        // test_page_loading	('/settings/', 'Settings');
    });

});

function test_default_tabs () {
	test_count	('#main-tabs a', 5);
	test_text	('#main-tabs li:nth-of-type(1) a[href="/"]',			'Dashboard');
	test_match	('#main-tabs li:nth-of-type(2) a[href="/text/"]',		/^Texts \(\d+\) $/);
	test_match	('#main-tabs li:nth-of-type(3) a[href="/user/"]',		/^People  \(\d+\)$/);
	test_text	('#main-tabs li:nth-of-type(4) a[href="/settings/"]',	'Settings');
	test_text	('#main-tabs li:nth-of-type(5) a[href="/followup/"]',	'Followup');
	test ('right tab nb', dsl(function () {
		elt ('#main-tabs a[href="/text/"]').text (function (t) {
			var r = t.match (/^Texts \((\d+)\) $/);
			if (r.length != 2) throw 'for Texts expected 2 matches got '+r.length;
			if (z.text_nb != r[1]) throw 'expected tab text nb ('+r[1]+') to be '+z.text_nb;
		});
		elt ('#main-tabs a[href="/user/"]').text (function (t) {
			var r = t.match (/^People  \((\d+)\)$/);
			if (r.length != 2) throw 'for People expected 2 matches got '+r.length;
			if (z.user_nb != r[1]) throw 'expected tab people nb ('+r[1]+') to be '+z.user_nb;
		});
	}));
}

function test_logged_header (username, is_tagline) {
	is_tagline = typeof is_tagline == 'undefined' ? true : is_tagline;

	test_text	('#header_controls b', username)
	test_count	('#header_controls a', 6);
	test_text	('#header_controls a:nth-of-type(1)[href="/"]',					'Home');
	test_text	('#header_controls a:nth-of-type(2)[href="/create/content/"]',	'Create a text');
	test_text	('#header_controls a:nth-of-type(3)[href="/create/upload/"]',	'Upload a text');
	test_text	('#header_controls a:nth-of-type(4)[href="/create/import/"]',	'Import a co-mented text');
	test_text	('#header_controls a:nth-of-type(5)[href="/profile/"]',			'Profile');
	test_text	('#header_controls a:nth-of-type(6)[href="/logout/"]',			'Logout');
	test_text	('#content h1.main_title a[href="/"]',							t['#id_workspace_name']);

	if (is_tagline) {
		test_match	('#content h1.main_title  + div', new RegExp (t['#id_workspace_tagline'], 'm'));
	}
}

function test_unlogged_header () {
	test_count	('#header_controls a', 2);
	test_text	('#header_controls a[href="/"]',		'Home');
	test_text	('#header_controls a[href="/login/"]',	'Login');
}

function test_unlogged_footer (url) {
	test_count	('#footer a', 9);
	test_text	('#footer a:nth-of-type(1)[href="/contact/"]',				'Contact');
	test_match	('#footer #comentlink[href="http://www.co-ment.com"]',		/Powered by/m);
	test_text	('#footer a:nth-of-type(3)[href="/help/"]',					'Help');
	test_text	('#footer a:nth-of-type(4)[href="/i18n/setlang/fr/"]',		'Français');
	test_text	('#footer a:nth-of-type(5)[href="/i18n/setlang/no/"]',		'Norsk');
	test_text	('#footer a:nth-of-type(6)[href="/i18n/setlang/pt_BR/"]',	'Português Brasileiro');
	test_text	('#footer a:nth-of-type(7)[href="/i18n/setlang/es/"]',		'Español');
	test_text	('#footer a:nth-of-type(8)[href="/i18n/setlang/bg/"]',		'Български');
	test_text	('#footer a:nth-of-type(9)[href="/i18n/setlang/it/"]',		'Italiano');
}

function test_i18n () {
	test ('can change lang to french', dsl(function () {
		element ('#footer a[href="/i18n/setlang/fr/"]').click ();
//		browser.waitForPageLoad ();
//		browser.navigateTo ('/');
//		browser.reload ();
		expect (elt ('#footer a[href="/help/"]').text ()).toBe ('Aide');
		element ('#footer a[href="/i18n/setlang/en/"]').click ();
//		browser.waitForPageLoad ();
//		browser.navigateTo ('/');
	}));
}

function test_page_loading (url, title) {
	test (url+' loads', dsl(function () {
		// here we are in Karma page
		browser.navigateTo (url);
		expect (element ('title').text ()).toMatch (new RegExp (title,'m'));
		// The same test agin vaniller javascript
		element ('title').text (function (page_title) {
			// here we got a value from the test iframe
			// to display the tested value : console.log (page_title);
			if (!(new RegExp (title, 'm').test (page_title))) throw 'got page '+page_title+' instead';
		});
	}));
}

/** Test if the selected DOM element is defined or has a given value : .val()
 *  s : CSS selector
 *  e : expected value, if omited, test existence
 */
function test_val (s, e) {
	e = typeof e == 'undefined' ? '' : e; // .val() returns defined ? '' : undefined; // if no value
	test (s+' is '+e, dsl(function () {
		expect (elt (s).val ()).toMatch (new RegExp (e, 'm'));
	}));
}

/** Test if the selected DOM element has the given text : .text()
 *  s : CSS selector
 *  e : expected value
 *  v : should we test a visible value ?
 */
function test_text (s, e, v) {
	v = typeof v == 'undefined' ? true : v;
	test (s+' has text '+e, dsl(function () {
		expect (elt (s, v).text ()).toBe (e);
	}));
}

/** Test if the selected DOM element .text() value match the given regexp
 *  s : CSS selector
 *  r : regexp to match
 */
function test_match (s, r) {
	test (s+' text match '+r, dsl(function () {
		expect (elt (s).text ()).toMatch (r);
	}));
}

/** Count selector occurences
 *  s : CSS selector
 *  e : expected count
 */
function test_count (s, e) {
	test (s+' count is '+e, dsl(function () {
		expect (elt (s).count ()).toBe (e);
	}));
}

/** Test Django form field presence
 */
function test_form_field (form_id, field_id, type, position, label, mandatory) {
	test ('has a '+label+' form field', dsl(function () {
		var s = '';
		switch (type) {
			case 'textarea':s = 'textarea#'+field_id; break;
			case 'select':	s = 'select#'+field_id; break;
			default:		s = 'input#'+field_id+'[type="'+type+'"]';
		}
//		var s = type == 'textarea' ? 'textarea#'+field_id : 'input#'+field_id+'[type='+type+']';
		expect (elt (s).val ()).toBeDefined ();
		expect (elt ('#'+form_id+' :input:eq('+position+')#'+field_id).val ()).toBeDefined ();
		expect (elt ('label[for='+field_id+']').text ()).toBe (label);

		if (mandatory)
			expect (elt ('label[for='+field_id+'] + span.required_star').val ()).toBeDefined ();
	}));
}

function test_readz_field (field_id) {
	test ('get '+field_id, dsl(function () {
		element (field_id).val (function (v) {
			z[field_id] = v;
		});
	}));
}

function test_fill_field (field_id, stored) {
	test ('set '+field_id, dsl(function () {
		input (field_id).enter (stored[field_id]);
	}));
}

function test_fill_settings (s) {
	test_fill_field ('#id_workspace_name', s);
	test_fill_field ('#id_workspace_tagline', s);
	test_fill_field ('#id_workspace_registration', s);
	test_fill_field ('#id_workspace_registration_moderation', s);
	test_fill_field ('#id_workspace_role_model', s);
	test_fill_field ('#id_workspace_category_1', s);
	test_fill_field ('#id_workspace_category_2', s);
	test_fill_field ('#id_workspace_category_3', s);
	test_fill_field ('#id_workspace_category_4', s);
	test_fill_field ('#id_workspace_category_5', s);
}

function test_fill_design (s) {
	test_fill_field ('#id_custom_css', s);
	test_fill_field ('#id_custom_font', s);
	test_fill_field ('#id_custom_titles_font', s);
}

/** Ensure the given element is visible
 *  s : CSS selector of the DOM element to check
 *  v : should the element being visible
 */
function elt (s, v) {
	return element (s + (v ? ':visible' : ''));
}
