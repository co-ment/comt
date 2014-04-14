
// " Vim settings
// set tabstop=4		  " number of spaces in a tab
// set softtabstop=4	  " as above
// set shiftwidth=4		  " as above

var w = __karma__.config.w,
	t = {'text_nb': 0, 'user_nb': 4},
	long_text = '';

for (var i = 20; i--;)
	long_text += 'Contenu du troisième texte.<br/>Sur <b>plusieurs</b> lignes<br/>';

const hidden = false,
	no_tagline = false,
	wait_page_load = true,
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

	this.timeout(200000);

	suite ('logs as an admin', function () {
		test ('logs an admin in', dsl(function () {
			browser.navigateTo ('/');
			input ('#id_username').enter (w.USER_ADMIN);
			input ('#id_password').enter (w.PASS_ADMIN);
			elt ('#login input[type=submit]').click ();
			browser.waitForPageLoad (); // Must be done here in this test() block
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard/m);
		}));
	});

	suite ('setting settings to test-values', function () {
		test_page_loading ('/settings/', 'Settings');
		test_fill_settings (c);
		test_val	('#id_workspace_name', c['#id_workspace_name']);
		test_click	('#settings input[type="submit"]', wait_page_load);
		test_page_loading	('/settings/', 'Settings');
		test_text	('#content h1.main_title a[href="/"]', c['#id_workspace_name']);
		test_page_loading	('/settings/design/', 'Settings');
		test_fill_design (c);
		test_click	('#settings input[type="submit"]', wait_page_load);
	});

	suite ('admin dashboard page conformity', function () {
		test_page_loading ('/', 'Dashboard\n - '+c['#id_workspace_name']);
		test_logged_header (w.USER_ADMIN);
		test_default_tabs (t.text_nb, t.user_nb);
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
		test_unlogged_footer ();
	});

	suite ('empty texts list page conformity', function () {
		test_page_loading	('/text/', 'Texts\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_match	('#text', /No texts yet/m);
		test_count	('#texts_form :input', 0);
	});

	suite ('create a text page conformity', function () {
		test_page_loading	('/create/content/', 'Create a text - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
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
		test_text	('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', hidden);
		test_text	('select#id_format option:eq(1)[value="rst"]', 'rst', hidden);
		test_text	('select#id_format option:eq(2)[value="html"]', 'html', hidden);
		test_count	('.markdown #markItUpId_content li', 20); // How many buttons in the WYSIWYG editor toolbar ?
		test_unlogged_footer ();
		test_click	('#text input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 2);
		test_field	('text div.error', 'id_title',		'text', 0, 'Title', true);
		test_field	('text div.error', 'id_content',	'textarea', 1, 'Content', true);
	});

	suite ('upload text page conformity', function () {
		test_page_loading	('/create/upload/', 'Upload a text - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
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
		test_text	('select#id_format option:eq(0)[value="markdown"][selected]', 'markdown', hidden);
		test_text	('select#id_format option:eq(1)[value="rst"]', 'rst', hidden);
		test_text	('select#id_format option:eq(2)[value="html"]', 'html', hidden);
		test_unlogged_footer ();
		test_click	('#text input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 1);
		test_field	('text div.error', 'id_file',		'file', 0, 'Upload file');
		test_match	('#text div.help_text:eq(3) span.error-text:eq(0)', /You should specify a file to upload/m);
	});

	suite ('import a co-mented text page conformity', function () {
		test_page_loading	('/create/import/', 'Import a co-mented text - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/text/"]', 'Text list');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/upload/"]', 'Upload a text');
		test_count	('#text form[action="."]:eq(0) :input', 3);
		test_field	('text', 'id_file',	'file', 0, 'Upload XML file', true);
		test_val	('#text :input:eq(1)[type=submit]', 'Save');
		test_val	('#text :input:eq(2)#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test_click	('#text input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 1);
		test_field	('text div.error', 'id_file',		'file', 0, 'Upload XML file', true);
		test_match	('#text div.help_text:eq(0) span.error-text:eq(0)', /You should specify a file to upload/m);
	});

	suite ('create texts', function () {
		for (var j=4; j--;)
			for (var i=3; i--;)
				 create_text (i);
	});

	// check that public texts still worwhile unlogged
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
		test_page_loading	('/text/', 'Texts\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		test_count	('form#filter_form[action="."] :input', 1);
		test_text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', hidden);
		test_page_loading ('/text/?tag_selected=Text+Troisième', 'Texts\n - '+c['#id_workspace_name']);
		test_count	('#texts_form :input', 4 + 3);
		test_match	('#paginator', /\s1-4 of 4\s/m);

		for (var i=4; i--;) {
			test_text	('a.main_object_title:eq('+i+')', c.texts[2]['#id_title']);
			test_match	('.tag_list:eq('+i+')', /tags: test_text Text Troisième /);
			test_text	('.tag_list:eq('+i+') a:eq(0)[href="?tag_selected=test_text"]', 'test_text');
			test_text	('.tag_list:eq('+i+') a:eq(1)[href="?tag_selected=Text+Troisi%C3%A8me"]','Text Troisième');
			test_text	('#text .hidden-text-actions:eq('+i+') a:eq(0)[href^="/text/"][href$="/view/"]', 'View');
			test_text	('#text .hidden-text-actions:eq('+i+') a:eq(1)[href^="/text/"][href$="/edit/"]', 'Edit');
			test_text	('#text .hidden-text-actions:eq('+i+') a:eq(2)[href$="#"][id*=delete]', 'Delete');
			test_text	('#text .hidden-text-actions:eq('+i+') a:eq(3)[href^="/text/"][href$="/share/"]', 'Users');
			test_text	('#text .hidden-text-actions:eq('+i+') a:eq(4)[href^="/text/"][href$="/settings/"]', 'Settings');
			test_text	('#text a[title="Edit user"][href^="/user/"][href$="/edit/"]:eq('+i+')', 'admin');
			test_text	('#text table[summary="text list"] tr:eq('+(i+1)+') td:eq(4)', '0');
		}

		test_page_loading ('/text/', 'Texts\n - '+c['#id_workspace_name']);
		test_count	('#texts_form :input', (t.text_nb < 10 ? t.text_nb : 10) + 3);
		test_match	('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
		test_text	('#paginator a:eq(0)[href="?page=2"]', '»');
		test_text	('#paginator a:eq(1)[href="?paginate=0"]', 'all');
		test_click	('#paginator a:eq(0)[href="?page=2"]');
		test_match	('#paginator', new RegExp ('\\s11-12 of '+t.text_nb+'\\s','m'));
		test_count	('#texts_form :input', t.text_nb % 10 + 3);
		test_click	('#paginator a:eq(0)[href="?page=1"]');
		test_match	('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
		test_count	('#texts_form :input', (t.text_nb < 10 ? t.text_nb : 10) + 3);
		test_click	('#paginator a:eq(1)[href="?paginate=0&page=1"]');
		test_match	('#paginator', /\s\(paginate\)\s/m);
		test_count	('#texts_form :input', t.text_nb + 3);
		test_click	('#paginator a:eq(0)[href="?paginate=&page=1"]');
		test_count	('#texts_form :input', (t.text_nb < 10 ? t.text_nb : 10) + 3);
		test_match	('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
		test_page_loading	('/text/', 'Texts\n - '+c['#id_workspace_name']);
		test_text	('select#bulk_actions option:eq(0)[selected][value="-1"]', 'Bulk Actions', hidden);
		test_text	('select#bulk_actions option:eq(1)[value="delete"]', 'Delete', hidden);
		test_val	('form#texts_form input#apply[type=button][disabled]', 'Apply');
		test_count	('table.large_table:eq(1) th', 6);
		test_val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_text	('table.large_table:eq(1) th:eq(1) a[href="?order=title"]', 'Text');
		test_text	('table.large_table:eq(1) th:eq(2)', 'Author');
		test_text	('table.large_table:eq(1) th:eq(3) a[href="?order=-modified"]', 'Modified');
		test_text	('table.large_table:eq(1) th:eq(4)', '# comments');
		test_text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_page_loading ('/text/?page=2', 'Texts\n - '+c['#id_workspace_name']);
		test		('choose bulk action Delete', dsl(function () { input ('#bulk_actions').option ('delete'); }));
		test_click	('#all_check');
		test_count	('form#texts_form input:checked', t.text_nb % 10 + 1);
		test_val	('form#texts_form input#apply[type=button]:not([disabled])', 'Apply');
		// test_click	('#texts_form #apply'); // can't click on the confirm dialog
		test_submit	('#texts_form');
		test_page_loading ('/text/', 'Texts\n - '+c['#id_workspace_name']);
		t.text_nb -= 2;
		test_count	('form#texts_form :input', t.text_nb + 3);
		test_match	('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
		// TOTEST : unitary delete 

		test_unlogged_footer ();
	});

	suite ('edit profile page conformity', function () {
		test_page_loading	('/profile/', 'Your profile \\('+w.USER_ADMIN+'\\)\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN, no_tagline);
		test_count	('#content ul.sub_list:eq(0) a', 1);
		test_text	('#content ul.sub_list:eq(0) a:eq(0)[href="/profile-pw/"]', 'Password');
		test_count	('form#profile[action="."]:eq(0) :input', 5);
		test_field	('profile', 'id_email',		'text', 0, 'E-mail address', true);
		test_field	('profile', 'id_first_name','text', 1, 'First name');
		test_field	('profile', 'id_last_name',	'text', 2, 'Last name');
		test_field	('profile', 'id_tags',		'text', 3, 'Tags');
		test_val	('#profile :input:eq(4)[type=submit]', 'Save');
		test_unlogged_footer ();
	});

	suite ('edit password page conformity', function () {
		test_page_loading	('/profile-pw/', 'Your profile [(]'+w.USER_ADMIN+'[)]\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN, no_tagline);
		test_count	('#content ul.sub_list:eq(0) a', 1);
		test_text	('#content ul.sub_list:eq(0) a:eq(0)[href="/profile/"]', 'Profile');
		test_count	('form#profile[action="."]:eq(0) :input', 4);
		test_field	('profile', 'id_old_password',	'password', 0, 'Old password', true);
		test_field	('profile', 'id_new_password1', 'password', 1, 'New password', true);
		test_field	('profile', 'id_new_password2',	'password', 2, 'New password confirmation', true);
		test_val	('#profile :input:eq(3)[type=submit]', 'Save');
		test_unlogged_footer ();
	});

	suite ('people list page conformity', function () {
		test_page_loading	('/user/', 'People\' list\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_count	('#user ul.sub_list:eq(0) a', 2);
		test_text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/add/"]', 'Add a new user');
		test_text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
		// TOTEST : filter by tag -> commentator user should be tagged commentator (to change in fixture)
		test_count	('form#filter_form[action="."] :input', 1);
		test_text	('#filter_form a[href="?display=1"]', 'Display suspended users');
		test_text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', hidden);
		// TOTEST : pagination
		// TOTEST : Bulk Actions -> Apply does enable
		// TOTEST display suspended users
		test_text	('select#bulk_actions option:eq(0)[selected][value="-1"]', '- Bulk Actions -', hidden);
		test_text	('select#bulk_actions option:eq(1)[value="disable"]', 'Suspend access', hidden);
		test_text	('select#bulk_actions option:eq(2)[value="enable"]', 'Enable access', hidden);
		test_text	('select#bulk_actions option:eq(3)[value="role_1"]', 'Change role to Manager', hidden);
		test_text	('select#bulk_actions option:eq(4)[value="role_2"]', 'Change role to Editor', hidden);
		test_text	('select#bulk_actions option:eq(5)[value="role_3"]', 'Change role to Moderator', hidden);
		test_text	('select#bulk_actions option:eq(6)[value="role_4"]', 'Change role to Commentator', hidden);
		test_text	('select#bulk_actions option:eq(7)[value="role_5"]', 'Change role to Observer', hidden);
		test_val	('form#user_form input#apply[type=button][disabled]', 'Apply');
		test_count	('table.large_table:eq(1) th', 6);
		test_val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_text	('table.large_table:eq(1) th:eq(1) a[href="?order=user__username"]', 'User');
		test_text	('table.large_table:eq(1) th:eq(2) a[href="?order=user__email"]', 'Email');
		test_text	('table.large_table:eq(1) th:eq(3) a[href="?order=-user__date_joined"]', 'Date joined');
		test_text	('table.large_table:eq(1) th:eq(4) a[href="?order=role__name"]', 'Role');
		test_text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_text	('table.large_table:eq(1) tr:last a[href="/user/-/edit/"]', 'Anonymous users');
		test_text	('table.large_table:eq(1) a.main_object_title[href="/profile/"]', w.USER_ADMIN);
		test_text	('table.large_table:eq(1) div.hidden-user-actions a[href="/profile/"]', 'Your profile');
		// TOTEST roles of users
		test_unlogged_footer ();
	});

	suite ('check user number', function () {
		test_page_loading	('/user/?display=1', 'People\' list\n - '+c['#id_workspace_name']);
		test_count	('#user_form :input', 6 + (t.user_nb % 10) * 2);
		test_match	('#paginator', new RegExp ('\\s\\d+-\\d+ of '+t.user_nb+'\\s','m'));
	});

	suite ('add a user page conformity', function () {
		test_page_loading	('/user/add/', 'Add a new user\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
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
		test_text	('select#id_role option:eq(0)[value][selected]', '---------', hidden);
		test_text	('select#id_role option:eq(1)[value="1"]', 'Manager', hidden);
		test_text	('select#id_role option:eq(2)[value="2"]', 'Editor', hidden);
		test_text	('select#id_role option:eq(3)[value="3"]', 'Moderator', hidden);
		test_text	('select#id_role option:eq(4)[value="4"]', 'Commentator', hidden);
		test_text	('select#id_role option:eq(5)[value="5"]', 'Observer', hidden);
		test_val	('#user :input:eq(6)[type=submit]', 'Add user');
		test_val	('#user :input:eq(7)#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test_click	('#user input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 1);
		test_field	('user div.error', 'id_email', 'text', 0, 'E-mail address', true);
		test_match	('#user div.help_text:eq(0) span.error-text:eq(0)', /This field is required/m);
		// X TOTEST add user (pending)
	});

	suite ('add-users-in-bulk page conformity', function () {
		test_page_loading	('/user/mass-add/', 'Add users in bulk\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_count	('#user ul.sub_list:eq(0) a', 2);
		test_text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/"]', 'Users\' list');
		test_text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/add/"]', 'Add a new user');
		test_count	('#user form[action="."]:eq(0) :input', 6);
		test_field	('user', 'id_email',		'textarea', 0, 'Emails', true);
		test_field	('user', 'id_tags',			'text',		1, 'Tags');
		test_field	('user', 'id_role',			'select',	2, 'Workspace level role');
		test_field	('user', 'id_note',			'textarea', 3, 'Note');
		test_count	('select#id_role option', 6);
		test_text	('select#id_role option:eq(0)[value][selected]', '---------', hidden);
		test_text	('select#id_role option:eq(1)[value="1"]', 'Manager', hidden);
		test_text	('select#id_role option:eq(2)[value="2"]', 'Editor', hidden);
		test_text	('select#id_role option:eq(3)[value="3"]', 'Moderator', hidden);
		test_text	('select#id_role option:eq(4)[value="4"]', 'Commentator', hidden);
		test_text	('select#id_role option:eq(5)[value="5"]', 'Observer', hidden);
		test_val	('#user :input:eq(4)[type=submit]', 'Add users');
		test_val	('#user :input:eq(5)#cancel_button[type=button]', 'Cancel');
		// X TOTEST add users (pending) -> can't be deleted
		test_unlogged_footer ();
		test_click	('#user input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 1);
		test_field	('user div.error', 'id_email', 'textarea', 0, 'Emails', true);
		test_match	('#user div.help_text:eq(0) span.error-text:eq(0)', /This field is required/m);
	});

	suite ('settings page conformity', function () {
		test_page_loading	('/settings/', 'Settings - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_count	('#settings ul.sub_list:eq(0) a', 1);
		test_text	('#settings ul.sub_list:eq(0) a:eq(0)[href="/settings/design/"]', 'Appearance');
		test_count	('#settings form[action="."]:eq(0) :input', 12);
		test_field	('settings', 'id_workspace_name', 'text', 0, 'Workspace name');
		test_field	('settings', 'id_workspace_tagline', 'text', 1, 'Workspace tagline');
		test_field	('settings', 'id_workspace_registration', 'checkbox', 2, 'Workspace registration');
		test_field	('settings', 'id_workspace_registration_moderation', 'checkbox', 3, 'Workspace registration moderation');
		test_field	('settings', 'id_workspace_role_model', 'select', 4, 'Role model');
		test_text	('select#id_workspace_role_model option:eq(0)[selected][value="generic"]', 'Generic', hidden);
		test_text	('select#id_workspace_role_model option:eq(1)[value="teacher"]', 'Class (education)', hidden);
		test_field	('settings', 'id_workspace_category_1', 'text', 5, 'Label for the first category of comments');
		test_field	('settings', 'id_workspace_category_2', 'text', 6, 'Label for the second category of comments');
		test_field	('settings', 'id_workspace_category_3', 'text', 7, 'Label for the third category of comments');
		test_field	('settings', 'id_workspace_category_4', 'text', 8, 'Label for the fourth category of comments');
		test_field	('settings', 'id_workspace_category_5', 'text', 9, 'Label for the fifth category of comments');
		test_val	('#settings :input:eq(10)[type=submit]', 'Save');
		test_val	('#settings :input:eq(11)#cancel_button[type=button]', 'Cancel');
		// TOTEST Workspace registration feature (with newly accessible page)
		test_unlogged_footer ();
	});

	suite ('settings design page conformity', function () {
		test_page_loading	('/settings/design/', 'Settings - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
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
		test_unlogged_footer ();
	});

	suite ('followup page conformity', function () {
		test_page_loading	('/followup/', 'Followup\n - '+c['#id_workspace_name']);
		test_logged_header	(w.USER_ADMIN);
		test_default_tabs	(t.text_nb, t.user_nb);
		test_text	('#followup a:eq(0)[href="/help/#public_private_feed"]', '?');
		test_match	('#followup a:eq(1)[href$="/feed/"]', new RegExp (w.WORKSPACE_URL+'feed/', 'm'));
		test_text	('#followup a:eq(2)[href="/help/#public_private_feed"]', '?');
		test_count	('form#followup_form[action="."] :input', 3);
		test_val	('form#followup_form input[type=submit]', '(Activate private feed|Reset private feed url)');
		test_val	('form#followup_form input#workspace_notify_check[type=checkbox]', 'on');
		test_val	('form#followup_form input#own_notify_check[type=checkbox]', 'on');
	
		// X TOTEST qu'une fois cliqué, le bouton a le nvo label, et qu'une adresse est disponible
		// X TOTEST que si on reclique l'adresse est changée

		test_unlogged_footer ();
	});

});

function test_default_tabs (text_nb, user_nb) {
	test_count	('#main-tabs a', 5);
	test_text	('#main-tabs li:nth-of-type(1) a[href="/"]',			'Dashboard');
	test_match	('#main-tabs li:nth-of-type(2) a[href="/text/"]',		/^Texts \(\d+\) $/);
	test_match	('#main-tabs li:nth-of-type(3) a[href="/user/"]',		/^People  \(\d+\)$/);
	test_text	('#main-tabs li:nth-of-type(4) a[href="/settings/"]',	'Settings');
	test_text	('#main-tabs li:nth-of-type(5) a[href="/followup/"]',	'Followup');
	test_match	('#main-tabs a[href="/text/"]', new RegExp ('^Texts\\s*\\('+text_nb+'\\)\\s*$'));
	test_match	('#main-tabs a[href="/user/"]', new RegExp ('^People\\s*\\('+user_nb+'\\)\\s*$'));
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
	test_text	('#content h1.main_title a[href="/"]',							c['#id_workspace_name']);

	if (is_tagline) {
		test_match	('#content h1.main_title  + div', new RegExp (c['#id_workspace_tagline'], 'm'));
	}
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

function create_text (i) {
	test_page_loading	('/create/content/', 'Create a text - '+c['#id_workspace_name']);
	test ('test creation', dsl(function () {
		dropdownlist ('#id_format').option (c['texts'][i]['#id_format']);
	}));

	test_fill_field ('#id_title', c['texts'][i]);
	test ('fill content', dsl(function (){
		elt ('#id_content').val (c['texts'][i]['#id_content']);
	}));

	test_fill_field ('#id_tags', c['texts'][i]);
	test_click	 ('#save_button', wait_page_load);
	t.text_nb++;
}
