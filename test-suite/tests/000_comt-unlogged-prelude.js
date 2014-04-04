
// " Vim settings
// set tabstop=4		  " number of spaces in a tab
// set softtabstop=4	  " as above
// set shiftwidth=4		  " as above

var k = __karma__.config,
	test_ = JSON.parse (k.t, new Function (['k','v'], k.r)); // revive helper functions sent from Karma

suite ('comt unlogged prelude', function () {

	this.timeout(20000);

	suite ('contact page conformity', function () {
		test_.page_loading ('/contact/', 'Contact');
		test_unlogged_header ();
		test_.exist	('form#profile[action="."]'); // the form exists
		test_.count	('form#profile :input', 7); // it has no more than 5 labels (may be no more fields)
		test_.field ('profile', 'id_name', 'text', 0, 'Your name', true); // the field id_name is…
		test_.field ('profile', 'id_email', 'text', 1, 'Your email address', true);
		test_.field ('profile', 'id_title', 'text', 2, 'Subject of the message', true);
		test_.field ('profile', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_.field ('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
		test_.val	('#profile input[type=submit]','Send'); // test that a the .val() of the element is
		test_.val	('input#cancel_button[type=button]', 'Cancel');
		test_unlogged_footer ();
		test		('to check that toBeDefined test still works', dsl(function () {
			expect (test_.elt ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
		}));
		test ('get back to / to avoid bugging next page load', dsl(function () { browser.navigateTo ('/'); }));
	});

	suite ('help page conformity', function () {
		test_.page_loading ('/help/', 'Help');
		test_unlogged_header ();
		test_unlogged_footer ();
	});

	suite ('can change lang', function () {
		test ('get back to / to avoid bugging next page load', dsl(function () { browser.navigateTo ('/'); }));
		test_.i18n ('fr', 'Aide');
		test_.i18n ('en', 'Help');
		test_.i18n ('es', 'Ayuda');
		test_.i18n ('it', 'Aiuto');
		test_.i18n ('de', 'Hilfe');
		test_.i18n ('pt_BR', 'Ajuda');
		test_.i18n ('nb', 'Hjelp');
		test_.i18n ('bg', 'Помощ');
		test_.i18n ('en', 'Help');
	});

	suite ('contact page mandatory field test', function () {
		test_.page_loading ('/contact/', 'Contact');
		test_.submit('#profile input[type="submit"]');
		test_.count ('div.help_text span.error-text', 4);
		test_.field ('profile div.error', 'id_name', 'text', 0, 'Your name', true); // the field id_name is…
		test_.field ('profile div.error', 'id_email', 'text', 1, 'Your email address', true);
		test_.field ('profile div.error', 'id_title', 'text', 2, 'Subject of the message', true);
		test_.field ('profile div.error', 'id_body', 'textarea', 3, 'Body of the message', true);
		test_.field ('profile', 'id_copy', 'checkbox', 4, 'Send me a copy of the email', false);
	});

	suite ('reset password page conformity', function () {
		test_.page_loading ('/password_reset/', 'Reset my password');
		test_unlogged_header ();
		test_.count	('form#profile :input', 3);
		test_.field ('profile', 'id_email', 'text', 1, 'E-mail', true);
		test_.val	('#profile input[type=submit]', 'Reset my password');
		test_unlogged_footer ();
		test_.submit('#profile input[type="submit"]');
		test_.count ('div.help_text span.error-text', 1);
		test_.field ('profile div.error', 'id_email', 'text', 0, 'E-mail', true);
	});

	suite ('login page conformity', function () {
		test_.page_loading ('/', 'Home');
		test_unlogged_header ();
		test_.count	('form#login[action="/login/"] :input', 3);
		test_.field ('login', 'id_username', 'text', 0, 'Username', true);
		test_.field ('login', 'id_password', 'password', 1, 'Password', true);
		test_.val	('form#login input[type=submit]', 'Login');
		test_.text	('form#login a[href="/password_reset/"]', 'Forgot password?');
		test_unlogged_footer ();
		// test_.i18n ();

		test ('get back to / to avoid bugging next page load', dsl(function () {
			browser.navigateTo ('/');
		}));
		test_.page_loading ('/login/', 'Login');
		test_.submit('#login input[type="submit"]');
		test_.field ('login div.error', 'id_username', 'text', 0, 'Username', true);
		test_.field ('login div.error', 'id_password', 'password', 1, 'Password', true);
	});
});

function test_unlogged_header () {
	test_.count	('#header_controls a', 2);
	test_.text	('#header_controls a[href="/"]',		'Home');
	test_.text	('#header_controls a[href="/login/"]',	'Login');
}

function test_unlogged_footer (url) {
	test_.count	('#footer a', 10);
	test_.text	('#footer a:nth-of-type(1)[href="/contact/"]',				'Contact');
	test_.match	('#footer #comentlink[href="http://www.co-ment.com"]',		/Powered by/m);
	test_.text	('#footer a:nth-of-type(3)[href="/help/"]',					'Help');
	test_.text	('#footer a:nth-of-type(4)[href="/i18n/setlang/fr/"]',		'Français');
	test_.text	('#footer a:nth-of-type(5)[href="/i18n/setlang/es/"]',		'Español');
	test_.text	('#footer a:nth-of-type(6)[href="/i18n/setlang/it/"]',		'Italiano');
	test_.text	('#footer a:nth-of-type(7)[href="/i18n/setlang/de/"]',		'Deutsch');
	test_.text	('#footer a:nth-of-type(8)[href="/i18n/setlang/pt_BR/"]',	'Português Brasileiro');
	test_.text	('#footer a:nth-of-type(9)[href="/i18n/setlang/nb/"]',		'Norsk');
	test_.text	('#footer a:nth-of-type(10)[href="/i18n/setlang/bg/"]',		'Български');
}

