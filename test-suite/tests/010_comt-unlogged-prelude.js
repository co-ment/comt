
// " Vim settings
// set tabstop=4		  " number of spaces in a tab
// set softtabstop=4	  " as above
// set shiftwidth=4		  " as above

suite ('comt unlogged prelude', function () {

	this.timeout(20000);

	suite ('contact page conformity', function () {
		test_page_loading ('/contact/', 'Contact');
		test_comt_unlogged_header ();
		test_exist	('form#profile[action="."]'); // the form exists
		test_count	('form#profile :input', 7);
		test_field	('profile', 'id_name', 'text', 0, 'Your name', true); // the field id_name is…
		test_field	('profile', 'id_email', 'text', 1, 'Your email address', true);
		test_field	('profile', 'id_title', 'text', 2, 'Subject of the message', true);
		test_field	('profile', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_field	('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
		test_val	('#profile input[type=submit]','Send'); // test that a the .val() of the element is
		test_val	('input#cancel_button[type=button]', 'Cancel');
		test_comt_unlogged_footer ();
		test		('to check that toBeDefined test still works', dsl(function () {
			expect (elt ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
		}));
		test_click	('#profile input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 4);
		test_field	('profile div.error', 'id_name', 'text', 0, 'Your name', true); // #id_name is mandatory
		test_field	('profile div.error', 'id_email', 'text', 1, 'Your email address', true);
		test_field	('profile div.error', 'id_title', 'text', 2, 'Subject of the message', true);
		test_field	('profile div.error', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_field	('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
	});

	suite ('help page conformity', function () {
		test_page_loading ('/help/', 'Help');
		test_comt_unlogged_header ();
		test_comt_unlogged_footer ();
	});

	suite ('can change lang', function () {
		test_comt_i18n ('fr',	'Aide');
		test_comt_i18n ('en',	'Help');
		test_comt_i18n ('es',	'Ayuda');
		test_comt_i18n ('it',	'Aiuto');
		test_comt_i18n ('de',	'Hilfe');
		test_comt_i18n ('pt_BR','Ajuda');
		test_comt_i18n ('nb',	'Hjelp');
		test_comt_i18n ('bg',	'Помощ');
		test_comt_i18n ('en',	'Help');
	});

	suite ('reset password page conformity', function () {
		test_page_loading ('/password_reset/', 'Reset my password');
		test_comt_unlogged_header ();
		test_count	('form#profile :input', 3);
		test_field	('profile', 'id_email', 'text', 1, 'E-mail', true);
		test_val	('#profile input[type=submit]', 'Reset my password');
		test_comt_unlogged_footer ();
		test_click	('#profile input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_count	('div.help_text span.error-text', 1);
		test_field	('profile div.error', 'id_email', 'text', 0, 'E-mail', true);
	});

	suite ('login page conformity', function () {
		test_page_loading ('/', 'Home');
		test_comt_unlogged_header ();
		test_count	('form#login[action="/login/"] :input', 3);
		test_field	('login', 'id_username', 'text', 0, 'Username', true);
		test_field	('login', 'id_password', 'password', 1, 'Password', true);
		test_val	('form#login input[type=submit]', 'Login');
		test_text	('form#login a[href="/password_reset/"]', 'Forgot password?');
		test_comt_unlogged_footer ();
		test_page_loading ('/login/', 'Login');
		test_click	('#login input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_field	('login div.error', 'id_username', 'text', 0, 'Username', true);
		test_field	('login div.error', 'id_password', 'password', 1, 'Password', true);
	});
});

