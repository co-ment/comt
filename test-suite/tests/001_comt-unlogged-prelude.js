
// " Vim settings
// set tabstop=4		  " number of spaces in a tab
// set softtabstop=4	  " as above
// set shiftwidth=4		  " as above

const wait_page_load = true;

suite ('comt unlogged prelude', function () {

	this.timeout(20000);

	suite ('contact page conformity', function () {
		test_page_loading ('/contact/', 'Contact');
		test_unlogged_header ();
		test_exist	('form#profile[action="."]'); // the form exists
		test_count	('form#profile :input', 7); // it has no more than 5 labels (may be no more fields)
		test_field	('profile', 'id_name', 'text', 0, 'Your name', true); // the field id_name is…
		test_field	('profile', 'id_email', 'text', 1, 'Your email address', true);
		test_field	('profile', 'id_title', 'text', 2, 'Subject of the message', true);
		test_field	('profile', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_field	('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
		test_val	('#profile input[type=submit]','Send'); // test that a the .val() of the element is
		test_val	('input#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test		('to check that toBeDefined test still works', dsl(function () {
			expect (elt ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
		}));
		test ('get back to / to avoid bugging next page load', dsl(function () { browser.navigateTo ('/'); }));
	});

	suite ('help page conformity', function () {
		test_page_loading ('/help/', 'Help');
		test_unlogged_header ();
		test_unlogged_footer ();
	});

	suite ('can change lang', function () {
		test ('get back to / to avoid bugging next page load', dsl(function () { browser.navigateTo ('/'); }));
		test_i18n ('fr', 'Aide');
		test_i18n ('en', 'Help');
		test_i18n ('es', 'Ayuda');
		test_i18n ('it', 'Aiuto');
		test_i18n ('de', 'Hilfe');
		test_i18n ('pt_BR', 'Ajuda');
		test_i18n ('nb', 'Hjelp');
		test_i18n ('bg', 'Помощ');
		test_i18n ('en', 'Help');
	});

	suite ('contact page mandatory field test', function () {
		test_page_loading ('/contact/', 'Contact');
		test_click	('#profile input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 4);
		test_field	('profile div.error', 'id_name', 'text', 0, 'Your name', true); // the field id_name is…
		test_field	('profile div.error', 'id_email', 'text', 1, 'Your email address', true);
		test_field	('profile div.error', 'id_title', 'text', 2, 'Subject of the message', true);
		test_field	('profile div.error', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_field	('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
	});

	suite ('reset password page conformity', function () {
		test_page_loading ('/password_reset/', 'Reset my password');
		test_unlogged_header ();
		test_count	('form#profile :input', 3);
		test_field	('profile', 'id_email', 'text', 1, 'E-mail', true);
		test_val	('#profile input[type=submit]', 'Reset my password');
		test_unlogged_footer ();
		test_click	('#profile input[type="submit"]', wait_page_load);
		test_count	('div.help_text span.error-text', 1);
		test_field	('profile div.error', 'id_email', 'text', 0, 'E-mail', true);
	});

	suite ('login page conformity', function () {
		test_page_loading ('/', 'Home');
		test_unlogged_header ();
		test_count	('form#login[action="/login/"] :input', 3);
		test_field	('login', 'id_username', 'text', 0, 'Username', true);
		test_field	('login', 'id_password', 'password', 1, 'Password', true);
		test_val	('form#login input[type=submit]', 'Login');
		test_text	('form#login a[href="/password_reset/"]', 'Forgot password?');
		test_unlogged_footer ();
		// test_i18n ();

		test ('get back to / to avoid bugging next page load', dsl(function () {
			browser.navigateTo ('/');
		}));
		test_page_loading ('/login/', 'Login');
		test_click	('#login input[type="submit"]', wait_page_load);
		test_field	('login div.error', 'id_username', 'text', 0, 'Username', true);
		test_field	('login div.error', 'id_password', 'password', 1, 'Password', true);
	});
});

function test_unlogged_header () {
	test_count	('#header_controls a', 2);
	test_text	('#header_controls a[href="/"]',		'Home');
	test_text	('#header_controls a[href="/login/"]',	'Login');
}

function test_unlogged_footer (url) {
	test_count	('#footer a', 10);
	test_text	('#footer a:nth-of-type(1)[href="/contact/"]',				'Contact');
	test_match	('#footer #comentlink[href="http://www.co-ment.com"]',		/Powered by/m);
	test_text	('#footer a:nth-of-type(3)[href="/help/"]',					'Help');
	test_text	('#footer a:nth-of-type(4)[href="/i18n/setlang/fr/"]',		'Français');
	test_text	('#footer a:nth-of-type(5)[href="/i18n/setlang/es/"]',		'Español');
	test_text	('#footer a:nth-of-type(6)[href="/i18n/setlang/it/"]',		'Italiano');
	test_text	('#footer a:nth-of-type(7)[href="/i18n/setlang/de/"]',		'Deutsch');
	test_text	('#footer a:nth-of-type(8)[href="/i18n/setlang/pt_BR/"]',	'Português Brasileiro');
	test_text	('#footer a:nth-of-type(9)[href="/i18n/setlang/nb/"]',		'Norsk');
	test_text	('#footer a:nth-of-type(10)[href="/i18n/setlang/bg/"]',		'Български');
}

