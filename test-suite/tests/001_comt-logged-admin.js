
// " Vim settings
// set tabstop=4		  " number of spaces in a tab
// set softtabstop=4	  " as above
// set shiftwidth=4		  " as above

var k = __karma__.config,
	test_ = JSON.parse (k.t, new Function (['k','v'], k.r)), // revive helper functions sent from Karma
	t = {'text_nb': 0, 'user_nb': 4};

var long_text = '';

for (var i = 20; i--;)
	long_text += 'Contenu du troisième texte.<br/>Sur <b>plusieurs</b> lignes<br/>';

const non_visible = false,
	no_tagline = false,
	c = {
	'#id_workspace_name':	'Test workspace name',
	'#id_workspace_tagline':	'Test workspace tagline',
	'#id_workspace_registration':			'on',	// registration
	'#id_workspace_registration_moderation':'on',	// registration moderation
	'#id_workspace_role_model':	'generic',
	'#id_workspace_category_1':	'ws_cat_1',
	'#id_workspace_category_2':	'ws_cat_2',
	'#id_workspace_category_3':	'ws_cat_3',
	'#id_workspace_category_4':	'ws_cat_4',
	'#id_workspace_category_5':	'ws_cat_5',
	'#id_custom_css': "h2 {  font-family: Test_Sopinspace !important; }",
	'#id_custom_font': 'Test_Sopinspace_custom_font',
	'#id_custom_titles_font': 'Test_Sopinspace_custom_titles_font',
	'texts':	[
		{
			'#id_title':	'Text One Sopinspace-Test éléguant',
			'#id_format':	'markdown',
			'#id_content':	'Contenu du premier texte.\nSur plusieurs lignes\nPour tester un cas réaliste',
			'#id_tags':		'test_text, Text Premier'
		},
		{
			'#id_title':	'Text Two Sopinspace-Test éléguant',
			'#id_format':	'rst',
			'#id_content':	'Contenu du deuxième texte.\nSur plusieurs lignes aussi\nPour tester un cas réaliste',
			'#id_tags':		'test_text, Text Second'
		},
		{
			'#id_title':	'Text Three Sopinspace-Test éléguant',
			'#id_format':	'html',
			'#id_content':	long_text,
			'#id_tags':		'test_text, Text Troisième'
		}
	]
};

suite ('comt logged admin', function () {

	this.timeout(20000);

	suite ('logs as an admin', function () {
		test ('logs an admin in', dsl(function () {
			browser.navigateTo ('/');
			input ('#id_username').enter (k.w.USER_ADMIN);
			input ('#id_password').enter (k.w.PASS_ADMIN);
			test_.elt ('#login input[type=submit]').click ();
			browser.waitForPageLoad (); // Must be done here in this test() block
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard/m);
		}));
	});

	suite ('setting settings to test-values', function () {
		test_.page_loading ('/settings/', 'Settings');
		test_fill_settings (c);
		test_.val ('#id_workspace_name', c['#id_workspace_name']);
		test_.submit ('#settings input[type="submit"]');
		test_.page_loading	('/settings/', 'Settings');
		test_.text ('#content h1.main_title a[href="/"]', c['#id_workspace_name']);
		test_.page_loading	('/settings/design/', 'Settings');
		test_fill_design (c);
		test_.submit ('#settings input[type="submit"]');
	});

	suite ('admin dashboard page conformity', function () {
		test_.page_loading ('/', 'Dashboard\n - '+c['#id_workspace_name']);
		test_logged_header (k.w.USER_ADMIN);
		test_default_tabs (t.text_nb, t.user_nb);
		test_.count	('table.dash_table', 5);
		test_.text	('table.dash_table th:eq(0)', 'Actions');
		test_.match	('table.dash_table:eq(0) a:eq(0)[href="/create/content/"]', /\sCreate a text/);
		test_.text	('table.dash_table:eq(0) a:eq(1).tip[href="#"]', '\xa0');
		test_.match	('table.dash_table:eq(0) a:eq(2)[href="/create/upload/"]', /\sUpload a text/);
		test_.text	('table.dash_table:eq(0) a:eq(3).tip[href="#"]', '\xa0');
		test_.match	('table.dash_table:eq(0) a:eq(4)[href="/create/import/"]', /\sImport a co-mented text/);
		test_.text	('table.dash_table:eq(0) a:eq(5).tip[href="#"]', '\xa0');
		test_.match	('table.dash_table:eq(0) a:eq(6)[href="/user/add/"]', /\sInvite user/);
		test_.match	('table.dash_table:eq(0) a:eq(7)[href="/profile/"]', /\sEdit your profile/);
		test_.match	('table.dash_table:eq(0) a:eq(8)[href="/text/"]', /\sView text list/);
		test_.match	('table.dash_table:eq(0) a:eq(9)[href="/settings/"]', /\sConfigure workspace/);
		test_.text	('table.dash_table th:eq(1)', 'Recent texts (all)');
		test_.text	('table.dash_table:eq(1) a:eq(0)[href="/text/"]', 'all');
		test_.text	('table.dash_table th:eq(2)', 'Recent comments');
		test_.match	('table.dash_table th:eq(3)', /^Workspace activity\n\s+\(month\/week\/24 hours\)$/m);
		test_.text	('table.dash_table:eq(3) a:eq(0)[href="?span=month"]', 'month');
		test_.text	('table.dash_table:eq(3) a:eq(1)[href="?span=day"]', '24 hours');
		test_.text	('table.dash_table th:eq(4) span.em', 'Activities');
		test_unlogged_footer ();
	});

	suite ('empty texts list page conformity', function () {
		test_.page_loading	('/text/', 'Texts\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#text ul.sub_list:eq(0) a', 3);
		test_.text	('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_.match	('#text', /No texts yet/m);
		test_.count	('#texts_form :input', 0);
	});

	suite ('create a text page conformity', function () {
		test_.page_loading	('/create/content/', 'Create a text - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#text ul.sub_list:eq(0) a', 3);
		test_.text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_.text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_.count	('#text form[action="."]:eq(0) :input', 6);
		test_.field ('text', 'id_title',	'text', 0, 'Title', true);
		test_.field ('text', 'id_format',	'select', 1, 'Format', true);
		test_.field ('text', 'id_content',	'textarea', 2, 'Content', true);
		test_.field ('text', 'id_tags',		'text', 3, 'Tags');
		test_.val	('#text :input:eq(4)[type=submit]', 'Save');
		test_.val	('#text :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_.count	('select#id_format option', 3);
		test_.text	('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', non_visible);
		test_.text	('select#id_format option:eq(1)[value="rst"]', 'rst', non_visible);
		test_.text	('select#id_format option:eq(2)[value="html"]', 'html', non_visible);
		test_.count	('.markdown #markItUpId_content li', 20); // How many buttons in the WYSIWYG editor toolbar ?
		test_unlogged_footer ();
		test_.submit('#text input[type="submit"]');
		test_.count ('div.help_text span.error-text', 2);
		test_.field ('text div.error', 'id_title',		'text', 0, 'Title', true);
		test_.field ('text div.error', 'id_content',	'textarea', 1, 'Content', true);
	});

	suite ('upload text page conformity', function () {
		test_.page_loading	('/create/upload/', 'Upload a text - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#text ul.sub_list:eq(0) a', 3);
		test_.text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_.text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_.count	('#text form[action="."]:eq(0) :input', 6);
		test_.field ('text', 'id_title',	'text', 0, 'Title');
		test_.field ('text', 'id_format',	'select', 1, 'Format', true);
		test_.field ('text', 'id_tags',		'text', 2, 'Tags');
		test_.field ('text', 'id_file',		'file', 3, 'Upload file');
		test_.val	('#text :input:eq(4)[type=submit]', 'Save');
		test_.val	('#text :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_.count	('select#id_format option', 3);
		test_.text	('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', non_visible);
		test_.text	('select#id_format option:eq(1)[value="rst"]', 'rst', non_visible);
		test_.text	('select#id_format option:eq(2)[value="html"]', 'html', non_visible);
		test_unlogged_footer ();
		test_.submit('#text input[type="submit"]');
		test_.count ('div.help_text span.error-text', 1);
		test_.field ('text div.error', 'id_file',		'file', 0, 'Upload file');
		test_.match	('#text div.help_text:eq(3) span.error-text:eq(0)', /You should specify a file to upload/m);
	});

	suite ('import a co-mented text page conformity', function () {
		test_.page_loading	('/create/import/', 'Import a co-mented text - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#text ul.sub_list:eq(0) a', 3);
		test_.text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_.text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/upload/"]', 'Upload a text');
		test_.count	('#text form[action="."]:eq(0) :input', 3);
		test_.field ('text', 'id_file',	'file', 0, 'Upload XML file', true);
		test_.val	('#text :input:eq(1)[type=submit]', 'Save');
		test_.val	('#text :input:eq(2)#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test_.submit('#text input[type="submit"]');
		test_.count	('div.help_text span.error-text', 1);
		test_.field ('text div.error', 'id_file',		'file', 0, 'Upload XML file', true);
		test_.match	('#text div.help_text:eq(0) span.error-text:eq(0)', /You should specify a file to upload/m);
	});

	suite ('create texts', function () {
		for (var i=3; i--;)
			create_text (i);
	});

	// check that public texts still work while unlogged
	// check that non public texts are unavailable
	// Are the public texts displayed in the login page ?

	// vérifier les valeurs de settings sauvées
	// Tester les liens masqués des textes listés si bien créés
	// Tester suppression de text
	// Tester bulk actions sur les textes

	// tester l'affichage d'un texte
	// tester que : #textcontainer.custom h1 font: Test_Sopinspace_custom_titles_font
	// tester que si Text preferences -> custom -> #textcontainer.custom font: Test_Sopinspace_custom_font
	// #textcontainer #add_comment_btn span -> #textcontainer font-family: Test_Sopinspace

	suite ('texts list page conformity', function () {
		test_.page_loading	('/text/', 'Texts\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#text ul.sub_list:eq(0) a', 3);
		test_.text	('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_.text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		// TOTEST : filter by tag
		test_.count	('form#filter_form[action="."] :input', 1);
		test_.text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', non_visible);
		test_.count	('#texts_form :input', 3 + t.text_nb % 10);
		test_.match	('#paginator', new RegExp ('\\s\\d+-\\d+ of '+t.text_nb+'\\s','m'));
		// TOTEST : pagination
		// TOTEST : Bulk Actions -> Apply does enable
		test_.text	('select#bulk_actions option:eq(0)[selected][value="-1"]', 'Bulk Actions', non_visible);
		test_.text	('select#bulk_actions option:eq(1)[value="delete"]', 'Delete', non_visible);
		test_.val	('form#texts_form input#apply[type=button][disabled]', 'Apply');
		test_.count	('table.large_table:eq(1) th', 6);
		test_.val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_.text	('table.large_table:eq(1) th:eq(1) a[href="?order=title"]', 'Text');
		test_.text	('table.large_table:eq(1) th:eq(2)', 'Author');
		test_.text	('table.large_table:eq(1) th:eq(3) a[href="?order=-modified"]', 'Modified');
		test_.text	('table.large_table:eq(1) th:eq(4)', '# comments');
		test_.text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_unlogged_footer ();
	});

	suite ('edit profile page conformity', function () {
		test_.page_loading	('/profile/', 'Your profile [(]'+k.w.USER_ADMIN+'[)]\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN, no_tagline);
		test_.count	('#content ul.sub_list:eq(0) a', 1);
		test_.text	('#content ul.sub_list:eq(0) a:eq(0)[href="/profile-pw/"]', 'Password');
		test_.count	('form#profile[action="."]:eq(0) :input', 5);
		test_.field ('profile', 'id_email',		'text', 0, 'E-mail address', true);
		test_.field ('profile', 'id_first_name','text', 1, 'First name');
		test_.field ('profile', 'id_last_name',	'text', 2, 'Last name');
		test_.field ('profile', 'id_tags',		'text', 3, 'Tags');
		test_.val	('#profile :input:eq(4)[type=submit]', 'Save');
		test_unlogged_footer ();
	});

	suite ('edit password page conformity', function () {
		test_.page_loading	('/profile-pw/', 'Your profile [(]'+k.w.USER_ADMIN+'[)]\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN, no_tagline);
		test_.count	('#content ul.sub_list:eq(0) a', 1);
		test_.text	('#content ul.sub_list:eq(0) a:eq(0)[href="/profile/"]', 'Profile');
		test_.count	('form#profile[action="."]:eq(0) :input', 4);
		test_.field ('profile', 'id_old_password',	'password', 0, 'Old password', true);
		test_.field ('profile', 'id_new_password1', 'password', 1, 'New password', true);
		test_.field ('profile', 'id_new_password2',	'password', 2, 'New password confirmation', true);
		test_.val	('#profile :input:eq(3)[type=submit]', 'Save');
		test_unlogged_footer ();
	});

	suite ('people list page conformity', function () {
		test_.page_loading	('/user/', 'People\' list\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#user ul.sub_list:eq(0) a', 2);
		test_.text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/add/"]', 'Add a new user');
		test_.text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
		// TOTEST : filter by tag -> commentator user should be tagged commentator (to change in fixture)
		test_.count	('form#filter_form[action="."] :input', 1);
		test_.text	('#filter_form a[href="?display=1"]', 'Display suspended users');
		test_.text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', non_visible);
		// TOTEST : pagination
		// TOTEST : Bulk Actions -> Apply does enable
		// TOTEST display suspended users
		test_.text	('select#bulk_actions option:eq(0)[selected][value="-1"]', '- Bulk Actions -', non_visible);
		test_.text	('select#bulk_actions option:eq(1)[value="disable"]', 'Suspend access', non_visible);
		test_.text	('select#bulk_actions option:eq(2)[value="enable"]', 'Enable access', non_visible);
		test_.text	('select#bulk_actions option:eq(3)[value="role_1"]', 'Change role to Manager', non_visible);
		test_.text	('select#bulk_actions option:eq(4)[value="role_2"]', 'Change role to Editor', non_visible);
		test_.text	('select#bulk_actions option:eq(5)[value="role_3"]', 'Change role to Moderator', non_visible);
		test_.text	('select#bulk_actions option:eq(6)[value="role_4"]', 'Change role to Commentator', non_visible);
		test_.text	('select#bulk_actions option:eq(7)[value="role_5"]', 'Change role to Observer', non_visible);
		test_.val	('form#user_form input#apply[type=button][disabled]', 'Apply');
		test_.count	('table.large_table:eq(1) th', 6);
		test_.val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_.text	('table.large_table:eq(1) th:eq(1) a[href="?order=user__username"]', 'User');
		test_.text	('table.large_table:eq(1) th:eq(2) a[href="?order=user__email"]', 'Email');
		test_.text	('table.large_table:eq(1) th:eq(3) a[href="?order=-user__date_joined"]', 'Date joined');
		test_.text	('table.large_table:eq(1) th:eq(4) a[href="?order=role__name"]', 'Role');
		test_.text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_.text	('table.large_table:eq(1) tr:last a[href="/user/-/edit/"]', 'Anonymous users');
		test_.text	('table.large_table:eq(1) a.main_object_title[href="/profile/"]', k.w.USER_ADMIN);
		test_.text	('table.large_table:eq(1) div.hidden-user-actions a[href="/profile/"]', 'Your profile');
		// TOTEST roles of users
		test_unlogged_footer ();
	});

	suite ('check user number', function () {
		test_.page_loading	('/user/?display=1', 'People\' list\n - '+c['#id_workspace_name']);
		test_.count	('#user_form :input', 6 + (t.user_nb % 10) * 2);
		test_.match	('#paginator', new RegExp ('\\s\\d+-\\d+ of '+t.user_nb+'\\s','m'));
	});

	suite ('add a user page conformity', function () {
		test_.page_loading	('/user/add/', 'Add a new user\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#user ul.sub_list:eq(0) a', 2);
		test_.text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
		test_.text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
		test_.count	('#user form[action="."]:eq(0) :input', 8);
		test_.field ('user', 'id_email',		'text', 0, 'E-mail address', true);
		test_.field ('user', 'id_first_name',	'text', 1, 'First name');
		test_.field ('user', 'id_last_name',	'text', 2, 'Last name');
		test_.field ('user', 'id_tags',			'text', 3, 'Tags');
		test_.field ('user', 'id_role',			'select', 4, 'Workspace level role');
		test_.field ('user', 'id_note',			'textarea', 5, 'Note');
		test_.count	('select#id_role option', 6);
		test_.text	('select#id_role option:eq(0)[value][selected]', '---------', non_visible);
		test_.text	('select#id_role option:eq(1)[value="1"]', 'Manager', non_visible);
		test_.text	('select#id_role option:eq(2)[value="2"]', 'Editor', non_visible);
		test_.text	('select#id_role option:eq(3)[value="3"]', 'Moderator', non_visible);
		test_.text	('select#id_role option:eq(4)[value="4"]', 'Commentator', non_visible);
		test_.text	('select#id_role option:eq(5)[value="5"]', 'Observer', non_visible);
		test_.val	('#user :input:eq(6)[type=submit]', 'Add user');
		test_.val	('#user :input:eq(7)#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test_.submit('#user input[type="submit"]');
		test_.count	('div.help_text span.error-text', 1);
		test_.field ('user div.error', 'id_email', 'text', 0, 'E-mail address', true);
		test_.match	('#user div.help_text:eq(0) span.error-text:eq(0)', /This field is required/m);
		// X TOTEST add user (pending)
	});

	suite ('add-users-in-bulk page conformity', function () {
		test_.page_loading	('/user/mass-add/', 'Add users in bulk\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#user ul.sub_list:eq(0) a', 2);
		test_.text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
		test_.text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/add/"]', 'Add a new user');
		test_.count	('#user form[action="."]:eq(0) :input', 6);
		test_.field ('user', 'id_email',		'textarea', 0, 'Emails', true);
		test_.field ('user', 'id_tags',			'text',		1, 'Tags');
		test_.field ('user', 'id_role',			'select',	2, 'Workspace level role');
		test_.field ('user', 'id_note',			'textarea', 3, 'Note');
		test_.count	('select#id_role option', 6);
		test_.text	('select#id_role option:eq(0)[value][selected]', '---------', non_visible);
		test_.text	('select#id_role option:eq(1)[value="1"]', 'Manager', non_visible);
		test_.text	('select#id_role option:eq(2)[value="2"]', 'Editor', non_visible);
		test_.text	('select#id_role option:eq(3)[value="3"]', 'Moderator', non_visible);
		test_.text	('select#id_role option:eq(4)[value="4"]', 'Commentator', non_visible);
		test_.text	('select#id_role option:eq(5)[value="5"]', 'Observer', non_visible);
		test_.val	('#user :input:eq(4)[type=submit]', 'Add users');
		test_.val	('#user :input:eq(5)#cancel_button[type=button]', 'Cancel');
		// X TOTEST add users (pending) -> can't be deleted
		test_unlogged_footer ();
		test_.submit('#user input[type="submit"]');
		test_.count	('div.help_text span.error-text', 1);
		test_.field ('user div.error', 'id_email', 'textarea', 0, 'Emails', true);
		test_.match	('#user div.help_text:eq(0) span.error-text:eq(0)', /This field is required/m);
	});

	suite ('settings page conformity', function () {
		test_.page_loading	('/settings/', 'Settings - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#settings ul.sub_list:eq(0) a', 1);
		test_.text	('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/design/"]', 'Appearance');
		test_.count	('#settings form[action="."]:eq(0) :input', 12);
		test_.field ('settings', 'id_workspace_name', 'text', 0, 'Workspace name');
		test_.field ('settings', 'id_workspace_tagline', 'text', 1, 'Workspace tagline');
		test_.field ('settings', 'id_workspace_registration', 'checkbox', 2, 'Workspace registration');
		test_.field ('settings', 'id_workspace_registration_moderation', 'checkbox', 3, 'Workspace registration moderation');
		test_.field ('settings', 'id_workspace_role_model', 'select', 4, 'Role model');
		test_.text	('select#id_workspace_role_model option:eq(0)[selected][value="generic"]', 'Generic', non_visible);
		test_.text	('select#id_workspace_role_model option:eq(1)[value="teacher"]', 'Class (education)', non_visible);
		test_.field ('settings', 'id_workspace_category_1', 'text', 5, 'Label for the first category of comments');
		test_.field ('settings', 'id_workspace_category_2', 'text', 6, 'Label for the second category of comments');
		test_.field ('settings', 'id_workspace_category_3', 'text', 7, 'Label for the third category of comments');
		test_.field ('settings', 'id_workspace_category_4', 'text', 8, 'Label for the fourth category of comments');
		test_.field ('settings', 'id_workspace_category_5', 'text', 9, 'Label for the fifth category of comments');
		test_.val	('#settings :input:eq(10)[type=submit]', 'Save');
		test_.val	('#settings :input:eq(11)#cancel_button[type=button]', 'Cancel');
		// TOTEST Workspace registration feature (with newly accessible page)
		test_unlogged_footer ();
	});

	suite ('settings design page conformity', function () {
		test_.page_loading	('/settings/design/', 'Settings - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.count	('#settings ul.sub_list:eq(0) a', 1);
		test_.text	('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/"]', 'General');
		test_.count	('#settings form[action="."]:eq(0) :input', 7);
		test_.field ('settings', 'id_workspace_logo_file', 'file', 0, 'Workspace logo');
		test_.field ('settings', 'id_custom_css', 'textarea', 1, 'Custom CSS rules');
		test_.field ('settings', 'id_custom_font', 'text', 2, 'Custom font');
		test_.field ('settings', 'id_custom_titles_font', 'text', 3, 'Custom font for titles');
		test_.val	('#settings :input:eq(4)[type=submit]', 'Save');
		test_.val	('#settings :input:eq(5)#cancel_button[type=button]', 'Cancel');
		test_.val	('#settings :input:eq(6)#delete_logo_button[type=submit]', 'Delete logo');
		test_unlogged_footer ();
	});

	suite ('followup page conformity', function () {
		test_.page_loading	('/followup/', 'Followup\n - '+c['#id_workspace_name']);
		test_logged_header	(k.w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_.text	('#followup a:eq(0)[href="/help/#public_private_feed"]', '?');
		test_.match	('#followup a:eq(1)[href$="/feed/"]', new RegExp (k.w.WORKSPACE_URL+'feed/', 'm'));
		test_.text	('#followup a:eq(2)[href="/help/#public_private_feed"]', '?');
		test_.count	('form#followup_form[action="."] :input', 3);
		test_.val	('form#followup_form input[type=submit]', '(Activate private feed|Reset private feed url)');
		test_.val	('form#followup_form input#workspace_notify_check[type=checkbox]', 'on');
		test_.val	('form#followup_form input#own_notify_check[type=checkbox]', 'on');
	
		// X TOTEST qu'une fois cliqué, le bouton a le nvo label, et qu'une adresse est disponible
		// X TOTEST que si on reclique l'adresse est changée

		test_unlogged_footer ();
	});

});

function test_default_tabs (text_nb, user_nb) {
	test_.count	('#main-tabs a', 5);
	test_.text	('#main-tabs li:nth-of-type(1) a[href="/"]',			'Dashboard');
	test_.match	('#main-tabs li:nth-of-type(2) a[href="/text/"]',		/^Texts \(\d+\) $/);
	test_.match	('#main-tabs li:nth-of-type(3) a[href="/user/"]',		/^People  \(\d+\)$/);
	test_.text	('#main-tabs li:nth-of-type(4) a[href="/settings/"]',	'Settings');
	test_.text	('#main-tabs li:nth-of-type(5) a[href="/followup/"]',	'Followup');
	test_.match	('#main-tabs a[href="/text/"]', new RegExp ('^Texts\\s*\\('+text_nb+'\\)\\s*$'));
	test_.match	('#main-tabs a[href="/user/"]', new RegExp ('^People\\s*\\('+user_nb+'\\)\\s*$'));
}

function test_logged_header (username, is_tagline) {
	is_tagline = typeof is_tagline == 'undefined' ? true : is_tagline;

	test_.text	('#header_controls b', username)
	test_.count	('#header_controls a', 6);
	test_.text	('#header_controls a:nth-of-type(1)[href="/"]',					'Home');
	test_.text	('#header_controls a:nth-of-type(2)[href="/create/content/"]',	'Create a text');
	test_.text	('#header_controls a:nth-of-type(3)[href="/create/upload/"]',	'Upload a text');
	test_.text	('#header_controls a:nth-of-type(4)[href="/create/import/"]',	'Import a co-mented text');
	test_.text	('#header_controls a:nth-of-type(5)[href="/profile/"]',			'Profile');
	test_.text	('#header_controls a:nth-of-type(6)[href="/logout/"]',			'Logout');
	test_.text	('#content h1.main_title a[href="/"]',							c['#id_workspace_name']);

	if (is_tagline) {
		test_.match	('#content h1.main_title  + div', new RegExp (c['#id_workspace_tagline'], 'm'));
	}
}

function test_fill_settings (s) {
	test_.fill_field ('#id_workspace_name', s);
	test_.fill_field ('#id_workspace_tagline', s);
	test_.fill_field ('#id_workspace_registration', s);
	test_.fill_field ('#id_workspace_registration_moderation', s);
	test_.fill_field ('#id_workspace_role_model', s);
	test_.fill_field ('#id_workspace_category_1', s);
	test_.fill_field ('#id_workspace_category_2', s);
	test_.fill_field ('#id_workspace_category_3', s);
	test_.fill_field ('#id_workspace_category_4', s);
	test_.fill_field ('#id_workspace_category_5', s);
}

function test_fill_design (s) {
	test_.fill_field ('#id_custom_css', s);
	test_.fill_field ('#id_custom_font', s);
	test_.fill_field ('#id_custom_titles_font', s);
}

function create_text (i) {
	test_.page_loading	('/create/content/', 'Create a text - '+c['#id_workspace_name']);
	test ('test creation', dsl(function () {
		dropdownlist ('#id_format').option (c['texts'][i]['#id_format']);
	}));

	test_.fill_field ('#id_title', c['texts'][i]);
	test ('fill content', dsl(function (){
		test_.elt ('#id_content').val (c['texts'][i]['#id_content']);
	}));

	test_.fill_field ('#id_tags', c['texts'][i]);
	test_.submit ('#save_button');
	t.text_nb++;
}
