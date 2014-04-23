
// " Vim settings
// set tabstop=4		  " number of spaces in a tab
// set softtabstop=4	  " as above
// set shiftwidth=4		  " as above

suite ('comt logged admin', function () {

	this.timeout(20000);

	suite ('logs as an admin', function () {
		test_comt_login (C.W.USER_ADMIN, C.W.PASS_ADMIN);
	});

	suite ('setting settings to test-values', function () {
		test_page_loading ('/settings/', 'Settings');
		test_comt_fill_settings (C);
		test_val	('#id_workspace_name', C['#id_workspace_name']);
		test_click	('#settings input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_page_loading	('/settings/', 'Settings');
		test_text	('#content h1.main_title a[href="/"]', C['#id_workspace_name']);
		test_page_loading	('/settings/design/', 'Settings');
		test_comt_fill_design (C);
		test_click	('#settings input[type="submit"]', C.WAIT_PAGE_LOAD);
	});

	suite ('admin dashboard page conformity', function () {
		test_page_loading ('/', 'Dashboard\n - '+C['#id_workspace_name']);
		test_comt_logged_header (C.W.USER_ADMIN);
		test_comt_default_tabs (test_comt.text_nb, test_comt.user_nb);
		test_count	('table.dash_table', 5);
		test_text	('table.dash_table th:eq(0)', 'Actions');
		test_match	('table.dash_table:eq(0) a:eq(0)[href="/create/content/"]', /\sCreate a text/);
		test_text	('table.dash_table:eq(0) a:eq(1).tip[href="#"]', '\xa0');
		test_match	('table.dash_table:eq(0) a:eq(2)[href="/create/upload/"]', /\sUpload a text/);
		test_text	('table.dash_table:eq(0) a:eq(3).tip[href="#"]', '\xa0');
		test_match	('table.dash_table:eq(0) a:eq(4)[href="/create/import/"]', /\sImport a co-mented text/);
		test_text	('table.dash_table:eq(0) a:eq(5).tip[href="#"]', '\xa0');
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
		test_comt_unlogged_footer ();
	});

	suite ('create a text page conformity', function () {
		test_page_loading	('/create/content/', 'Create a text - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_count	('#text form[action="."]:eq(0) :input', 6);
		test_field	('text', 'id_title',	'text', 0, 'Title', true);
		test_field	('text', 'id_format',	'select', 1, 'Format', true);
		test_field	('text', 'id_content',	'textarea', 2, 'Content', true);
		test_field	('text', 'id_tags',		'text', 3, 'Tags');
		test_val	('#text :input:eq(4)[type=submit]', 'Save');
		test_val	('#text :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_count	('select#id_format option', 3);
		test_text	('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', C.HIDDEN);
		test_text	('select#id_format option:eq(1)[value="rst"]', 'rst', C.HIDDEN);
		test_text	('select#id_format option:eq(2)[value="html"]', 'html', C.HIDDEN);
		test_count	('.markdown #markItUpId_content li', 20); // How many buttons in the WYSIWYG editor toolbar ?
		test_comt_unlogged_footer ();
		test_click	('#text input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 2);
		test_field	('text div.error', 'id_title',		'text', 0, 'Title', true);
		test_field	('text div.error', 'id_content',	'textarea', 1, 'Content', true);
	});

	suite ('upload text page conformity', function () {
		test_page_loading	('/create/upload/', 'Upload a text - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_count	('#text form[action="."]:eq(0) :input', 6);
		test_field	('text', 'id_title',	'text', 0, 'Title');
		test_field	('text', 'id_format',	'select', 1, 'Format', true);
		test_field	('text', 'id_tags',		'text', 2, 'Tags');
		test_field	('text', 'id_file',		'file', 3, 'Upload file');
		test_val	('#text :input:eq(4)[type=submit]', 'Save');
		test_val	('#text :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_count	('select#id_format option', 3);
		test_text	('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', C.HIDDEN);
		test_text	('select#id_format option:eq(1)[value="rst"]', 'rst', C.HIDDEN);
		test_text	('select#id_format option:eq(2)[value="html"]', 'html', C.HIDDEN);
		test_comt_unlogged_footer ();
		test_click	('#text input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 1);
		test_field	('text div.error', 'id_file',		'file', 0, 'Upload file');
		test_match	('#text div.help_text:eq(3) span.error-text:eq(0)', /You should specify a file to upload/m);
	});

	suite ('import a co-mented text page conformity', function () {
		test_page_loading	('/create/import/', 'Import a co-mented text - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/upload/"]', 'Upload a text');
		test_count	('#text form[action="."]:eq(0) :input', 3);
		test_field	('text', 'id_file',	'file', 0, 'Upload XML file', true);
		test_val	('#text :input:eq(1)[type=submit]', 'Save');
		test_val	('#text :input:eq(2)#cancel_button[type=button]', 'Cancel');
		test_comt_unlogged_footer ();
		test_click	('#text input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 1);
		test_field	('text div.error', 'id_file',		'file', 0, 'Upload XML file', true);
		test_match	('#text div.help_text:eq(0) span.error-text:eq(0)', /You should specify a file to upload/m);
	});

	suite ('edit profile page conformity', function () {
		test_page_loading	('/profile/', 'Your profile \\('+C.W.USER_ADMIN+'\\)\n - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN, C.NO_TAGLINE);
		test_count	('#content ul.sub_list:eq(0) a', 1);
		test_text	('#content ul.sub_list:eq(0) a:eq(0)[href="/profile-pw/"]', 'Password');
		test_count	('form#profile[action="."]:eq(0) :input', 5);
		test_field	('profile', 'id_email',		'text', 0, 'E-mail address', true);
		test_field	('profile', 'id_first_name','text', 1, 'First name');
		test_field	('profile', 'id_last_name',	'text', 2, 'Last name');
		test_field	('profile', 'id_tags',		'text', 3, 'Tags');
		test_val	('#profile :input:eq(4)[type=submit]', 'Save');
		test_comt_unlogged_footer ();
	});

	suite ('edit password page conformity', function () {
		test_page_loading	('/profile-pw/', 'Your profile [(]'+C.W.USER_ADMIN+'[)]\n - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN, C.NO_TAGLINE);
		test_count	('#content ul.sub_list:eq(0) a', 1);
		test_text	('#content ul.sub_list:eq(0) a:eq(0)[href="/profile/"]', 'Profile');
		test_count	('form#profile[action="."]:eq(0) :input', 4);
		test_field	('profile', 'id_old_password',	'password', 0, 'Old password', true);
		test_field	('profile', 'id_new_password1', 'password', 1, 'New password', true);
		test_field	('profile', 'id_new_password2',	'password', 2, 'New password confirmation', true);
		test_val	('#profile :input:eq(3)[type=submit]', 'Save');
		test_comt_unlogged_footer ();
	});

	suite ('people list page conformity', function () {
		test_page_loading	('/user/', 'People\' list\n - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#user ul.sub_list:eq(0) a', 2);
		test_text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/add/"]', 'Add a new user');
		test_text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
		test_text	('#filter_form a[href="?display=1"]', 'Display suspended users');
		test_count	('form#filter_form[action="."] :input', 1);
		test_text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(0)[selected][value="-1"]', '- Bulk Actions -', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(1)[value="disable"]', 'Suspend access', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(2)[value="enable"]', 'Enable access', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(3)[value="role_1"]', 'Change role to Manager', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(4)[value="role_2"]', 'Change role to Editor', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(5)[value="role_3"]', 'Change role to Moderator', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(6)[value="role_4"]', 'Change role to Commentator', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(7)[value="role_5"]', 'Change role to Observer', C.HIDDEN);
		test_val	('form#user_form input#apply[type=button][disabled]', 'Apply');
		test_match  ('#paginator', /\s1-4 of 4\s/m);
		test_count	('table.large_table:eq(1) th', 6);
		test_val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_text	('table.large_table:eq(1) th:eq(1) a[href="?order=user__username"]', 'User');
		test_text	('table.large_table:eq(1) th:eq(2) a[href="?order=user__email"]', 'Email');
		test_text	('table.large_table:eq(1) th:eq(3) a[href="?order=-user__date_joined"]', 'Date joined');
		test_text	('table.large_table:eq(1) th:eq(4) a[href="?order=role__name"]', 'Role');
		test_text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_text	('table.large_table:eq(1) tr:last a[href="/user/-/edit/"]', 'Anonymous users');
		test_text	('table.large_table:eq(1) a.main_object_title[href="/profile/"]', C.W.USER_ADMIN);
		test_text	('table.large_table:eq(1) div.hidden-user-actions a[href="/profile/"]', 'Your profile');
		test_val	('form#user_form input#save[type="submit"][disabled]', 'Save');
		test_exist	('#user_form tr:eq(1) td:eq(4) select[disabled]');
		test_count	('#user_form tr:eq(1) td:eq(4) select[disabled] option', 6);
		test_text	('#user_form tr:eq(1) td:eq(4) select option:eq(0)[value=""][selected]', '---------', C.H);
		test_text	('#user_form tr:eq(1) td:eq(4) select[disabled] option:eq(1)[value="1"]', 'Manager', C.H);
		test_text	('#user_form tr:eq(1) td:eq(4) select[disabled] option:eq(2)[value="2"]', 'Editor', C.H);
		test_text	('#user_form tr:eq(1) td:eq(4) select[disabled] option:eq(3)[value="3"]', 'Moderator', C.H);
		test_text	('#user_form tr:eq(1) td:eq(4) select[disabled] option:eq(4)[value="4"]', 'Commentator', C.H);
		test_text	('#user_form tr:eq(1) td:eq(4) select[disabled] option:eq(5)[value="5"]', 'Observer', C.H);
		test_val	('#user_form tr:eq(2) td:eq(4) select', '5'); // this is a bug should be 4
		test_val	('#user_form tr:eq(3) td:eq(4) select', '5'); // this is a bug should be 2
		test_val	('#user_form tr:eq(4) td:eq(4) select', '5');
		test_exist	('#user_form tr:eq(6) td:eq(4) select');
		test_count	('#user_form tr:eq(6) td:eq(4) select option', 3);
		test_text	('#user_form tr:eq(6) td:eq(4) select option:eq(0)[value=""][selected]', '---------', C.H);
		test_text	('#user_form tr:eq(6) td:eq(4) select option:eq(1)[value="4"]', 'Commentator', C.H);
		test_text	('#user_form tr:eq(6) td:eq(4) select option:eq(2)[value="5"]', 'Observer', C.H);
		test_exist	('#user_form tr:eq(1) td:eq(0) input[type=checkbox][disabled]');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(0)[href^="/user/"][href$="/edit/"]', 'Edit');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(1)[href^="/use"][href$="ontact/"]', 'Contact');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(2)[id^="user-suspend-"]', 'Suspend access');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(3)[id^="user-resen"]', '(Re-)send invitation');
		test_comt_unlogged_footer ();
	});

	suite ('check user number', function () {
		test_page_loading	('/user/?display=1', 'People\' list\n - '+C['#id_workspace_name']);
		test_count	('#user_form :input', 6 + (test_comt.user_nb % 10) * 2);
		test_match	('#paginator', new RegExp ('\\s\\d+-\\d+ of '+test_comt.user_nb+'\\s','m'));
	});

	suite ('Reset fixture user roles', function () {
		test        ('set user-com Commentator', dsl(function () {
			input ('#user_form tr:eq(2) td:eq(4) select').option ('4');
			input ('#user_form tr:eq(3) td:eq(4) select').option ('2');
			input ('#user_form tr:eq(4) td:eq(4) select').option ('5');
			input ('#save').prop ('disabled', false);
		}));
		test_click	('#save', C.WAIT_PAGE_LOAD);
		test_page_loading ('/user/', 'People\' list\n - '+C['#id_workspace_name']);
		test_val	('#user_form tr:eq(2) td:eq(4) select option:selected', '4');
		test_val	('#user_form tr:eq(3) td:eq(4) select option:selected', '2');
		test_val	('#user_form tr:eq(4) td:eq(4) select option:selected', '5');


		// TOTEST roles of users
		// TOTEST : filter by tag -> commentator user should be tagged commentator (to change in fixture)
		// TOTEST : pagination
		// TOTEST : Bulk Actions -> Apply does enable
		// TOTEST display suspended users
	});

	suite ('add a user page conformity', function () {
		test_page_loading	('/user/add/', 'Add a new user\n - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#user ul.sub_list:eq(0) a', 2);
		test_text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
		test_text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
		test_count	('#user form[action="."]:eq(0) :input', 8);
		test_field	('user', 'id_email',		'text', 0, 'E-mail address', true);
		test_field	('user', 'id_first_name',	'text', 1, 'First name');
		test_field	('user', 'id_last_name',	'text', 2, 'Last name');
		test_field	('user', 'id_tags',			'text', 3, 'Tags');
		test_field	('user', 'id_role',			'select', 4, 'Workspace level role');
		test_field	('user', 'id_note',			'textarea', 5, 'Note');
		test_count	('select#id_role option', 6);
		test_text	('select#id_role option:eq(0)[value][selected]', '---------', C.HIDDEN);
		test_text	('select#id_role option:eq(1)[value="1"]', 'Manager', C.HIDDEN);
		test_text	('select#id_role option:eq(2)[value="2"]', 'Editor', C.HIDDEN);
		test_text	('select#id_role option:eq(3)[value="3"]', 'Moderator', C.HIDDEN);
		test_text	('select#id_role option:eq(4)[value="4"]', 'Commentator', C.HIDDEN);
		test_text	('select#id_role option:eq(5)[value="5"]', 'Observer', C.HIDDEN);
		test_val	('#user :input:eq(6)[type=submit]', 'Add user');
		test_val	('#user :input:eq(7)#cancel_button[type=button]', 'Cancel');
		test_comt_unlogged_footer ();
		test_click	('#user input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 1);
		test_field	('user div.error', 'id_email', 'text', 0, 'E-mail address', true);
		test_match	('#user div.help_text:eq(0) span.error-text:eq(0)', /This field is required/m);
	});

	suite ('add-users-in-bulk page conformity', function () {
		test_page_loading	('/user/mass-add/', 'Add users in bulk\n - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#user ul.sub_list:eq(0) a', 2);
		test_text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
		test_text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/add/"]', 'Add a new user');
		test_count	('#user form[action="."]:eq(0) :input', 6);
		test_field	('user', 'id_email',		'textarea', 0, 'Emails', true);
		test_field	('user', 'id_tags',			'text',		1, 'Tags');
		test_field	('user', 'id_role',			'select',	2, 'Workspace level role');
		test_field	('user', 'id_note',			'textarea', 3, 'Note');
		test_count	('select#id_role option', 6);
		test_text	('select#id_role option:eq(0)[value][selected]', '---------', C.HIDDEN);
		test_text	('select#id_role option:eq(1)[value="1"]', 'Manager', C.HIDDEN);
		test_text	('select#id_role option:eq(2)[value="2"]', 'Editor', C.HIDDEN);
		test_text	('select#id_role option:eq(3)[value="3"]', 'Moderator', C.HIDDEN);
		test_text	('select#id_role option:eq(4)[value="4"]', 'Commentator', C.HIDDEN);
		test_text	('select#id_role option:eq(5)[value="5"]', 'Observer', C.HIDDEN);
		test_val	('#user :input:eq(4)[type=submit]', 'Add users');
		test_val	('#user :input:eq(5)#cancel_button[type=button]', 'Cancel');
		// X TOTEST add users (pending) -> can't be deleted
		test_comt_unlogged_footer ();
		test_click	('#user input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 1);
		test_field	('user div.error', 'id_email', 'textarea', 0, 'Emails', true);
		test_match	('#user div.help_text:eq(0) span.error-text:eq(0)', /This field is required/m);
	});

	suite ('settings page conformity', function () {
		test_page_loading	('/settings/', 'Settings - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#settings ul.sub_list:eq(0) a', 1);
		test_text	('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/design/"]', 'Appearance');
		test_count	('#settings form[action="."]:eq(0) :input', 12);
		test_field	('settings', 'id_workspace_name', 'text', 0, 'Workspace name');
		test_field	('settings', 'id_workspace_tagline', 'text', 1, 'Workspace tagline');
		test_field	('settings', 'id_workspace_registration', 'checkbox', 2, 'Workspace registration');
		test_field	('settings', 'id_workspace_registration_moderation', 'checkbox', 3, 'Workspace registration moderation');
		test_field	('settings', 'id_workspace_role_model', 'select', 4, 'Role model');
		test_text	('select#id_workspace_role_model option:eq(0)[selected][value="generic"]', 'Generic', C.HIDDEN);
		test_text	('select#id_workspace_role_model option:eq(1)[value="teacher"]', 'Class (education)', C.HIDDEN);
		test_field	('settings', 'id_workspace_category_1', 'text', 5, 'Label for the first category of comments');
		test_field	('settings', 'id_workspace_category_2', 'text', 6, 'Label for the second category of comments');
		test_field	('settings', 'id_workspace_category_3', 'text', 7, 'Label for the third category of comments');
		test_field	('settings', 'id_workspace_category_4', 'text', 8, 'Label for the fourth category of comments');
		test_field	('settings', 'id_workspace_category_5', 'text', 9, 'Label for the fifth category of comments');
		test_val	('#settings :input:eq(10)[type=submit]', 'Save');
		test_val	('#settings :input:eq(11)#cancel_button[type=button]', 'Cancel');
		// TOTEST Workspace registration feature (with newly accessible page)
		test_comt_unlogged_footer ();
	});

	suite ('settings design page conformity', function () {
		test_page_loading	('/settings/design/', 'Settings - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#settings ul.sub_list:eq(0) a', 1);
		test_text	('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/"]', 'General');
		test_count	('#settings form[action="."]:eq(0) :input', 7);
		test_field	('settings', 'id_workspace_logo_file', 'file', 0, 'Workspace logo');
		test_field	('settings', 'id_custom_css', 'textarea', 1, 'Custom CSS rules');
		test_field	('settings', 'id_custom_font', 'text', 2, 'Custom font');
		test_field	('settings', 'id_custom_titles_font', 'text', 3, 'Custom font for titles');
		test_val	('#settings :input:eq(4)[type=submit]', 'Save');
		test_val	('#settings :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_val	('#settings :input:eq(6)#delete_logo_button[type=submit]', 'Delete logo');
		test_comt_unlogged_footer ();
	});

	suite ('followup page conformity', function () {
		test_page_loading	('/followup/', 'Followup\n - '+C['#id_workspace_name']);
		test_comt_logged_header	(C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_text	('#followup a:eq(0)[href="/help/#public_private_feed"]', '?');
		test_match	('#followup a:eq(1)[href$="/feed/"]', new RegExp (C.W.WORKSPACE_URL+'feed/', 'm'));
		test_text	('#followup a:eq(2)[href="/help/#public_private_feed"]', '?');
		test_count	('form#followup_form[action="."] :input', 3);
		test_val	('form#followup_form input[type=submit]', '(Activate private feed|Reset private feed url)');
		test_val	('form#followup_form input#workspace_notify_check[type=checkbox]', 'on');
		test_val	('form#followup_form input#own_notify_check[type=checkbox]', 'on');
	
		// X TOTEST qu'une fois cliqué, le bouton a le nvo label, et qu'une adresse est disponible
		// X TOTEST que si on reclique l'adresse est changée

		test_comt_unlogged_footer ();
	});

});

