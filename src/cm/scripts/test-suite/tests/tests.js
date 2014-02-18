
// try to login

// create texts and co-ments
// collect newly created URLs

// Get workspace name, public texts…

// unlog

// check that public texts still work while unlogged
// check that non public texts are unavailable

// Is the workspace name correctly displayed ? 
// Are the public texts displayed in the login page ?

var w = __karma__.config.w;

suite ('comt', function () {

	this.timeout(150000);

	suite ('contact page', function () {
		test_page_loading ('/contact/', 'Contact');
		test_unlogged_header ();

		test ('has a contact form', dsl(function () {
			expect (elt ('#profile[action="."]').val ()).toBeDefined ();
		}));

		test_form_field ('id_name', 'text', 'Your name', true);
		test_form_field ('id_email', 'text', 'Your email address', true);
		test_form_field ('id_title', 'text', 'Subject of the message', true);
		test_form_field ('id_body', 'textarea', 'Body of the message', true);
		test_form_field ('id_copy', 'checkbox', 'Send me a copy of the email', false);

		test ('has some submit and cancel buttons', dsl(function () {
			expect (elt ('#profile input[type=submit]').val ()).toBe ('Send');
			expect (elt ('input#cancel_button[type=button]').val ()).toBe ('Cancel');
		}));

		test_unlogged_footer ();

		// To avoid bugging in loading the 2nd page
		test ('just get back to /', dsl(function () {
			browser.navigateTo ('/');
		}));
	});

	suite ('help page', function () {
		test_page_loading ('/help/', 'Help');
		test_unlogged_header ();
		test_unlogged_footer ();
	});

	suite ('reset password page', function () {
		test_page_loading ('/password_reset/', 'Reset my password');
		test_unlogged_header ();

		test ('has a contact form', dsl(function () {
			expect (elt ('#profile[action="."]').val ()).toBeDefined ();
		}));

		test_form_field ('id_email', 'text', 'E-mail', true);

		test ('has a submit button', dsl(function () {
			expect (elt ('#profile input[type=submit]').val ()).toBe ('Reset my password');
		}));

		test_unlogged_footer ();
	});

	suite ('login page', function () {
		test_page_loading ('/', 'Home');
		test_unlogged_header ();

		test ('has a #login form', dsl(function () {
			expect (elt ('#login[action="/login/"]').val ()).toBeDefined ();
		}));

		test_form_field ('id_username', 'text', 'Username', true);
		test_form_field ('id_password', 'password', 'Password', true);

		test ('has a login button and reset password links', dsl(function () {
			expect (elt ('#login input[type=submit]').val ()).toBe ('Login');
			expect (elt ('#login a[href="/password_reset/"]').text ()).toBe ('Forgot password?');
		}));

		test_unlogged_footer ();

		test ('logs an admin in', dsl(function () {
			input ('#id_username').enter (w.USER_ADMIN);
			input ('#id_password').enter (w.PASS_ADMIN);
			elt ('#login input[type=submit]').click ();
			// Must be done here in this test() block
			browser.waitForPageLoad ();
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard/m);
		}));
	});

	suite ('admin dashboard', function () {
		// Should starts with :
		test_page_loading ('/', 'Dashboard');
		// But its the last thing we did in the previous test
		test_logged_header (w.USER_ADMIN);
		test_unlogged_footer ();
	});
});

function test_page_loading (url, title) {
	test ('loads', dsl(function () {
		// here we are in Karma page
		browser.navigateTo (url);
		expect (element ('title').text ()).toMatch (new RegExp (title,'m'));
		element ('title').text (function (page_title) { // The same test with more vanilla javascript
			// here we got a value from the test iframe
			if (!(new RegExp (title, 'm').test (page_title))) throw 'got page '+page_title+' instead';
		});
	}));
}

function test_logged_header (username) {
	test ('has 6 links in #header_controls', dsl(function () {
		expect (elt ('#header_controls a').count ()).toBe (6);
	}));
	test ('displays current connected user name', dsl(function () {
		expect (elt ('#header_controls b').text ()).toBe (username);
	}));
	test ('has links', dsl(function () {
		expect (elt ('#header_controls a:nth-of-type(1)[href="/"]').text ()).toBe ('Home');
		expect (elt ('#header_controls a:nth-of-type(2)[href="/create/content/"]').text ()).toBe ('Create a text');
		expect (elt ('#header_controls a:nth-of-type(3)[href="/create/upload/"]').text ()).toBe ('Upload a text');
		expect (elt ('#header_controls a:nth-of-type(4)[href="/create/import/"]').text ()).toBe ('Import a co-mented text');
		expect (elt ('#header_controls a:nth-of-type(5)[href="/profile/"]').text ()).toBe ('Profile');
		expect (elt ('#header_controls a:nth-of-type(6)[href="/logout/"]').text ()).toBe ('Logout');
	}));
}

function test_unlogged_header () {
	test ('has 2 links', dsl(function () {
		expect (elt ('#header_controls a').count ()).toBe (2);
		expect (elt ('#header_controls a[href="/"]').val ()).toBeDefined ();
		// to display the tested value :
		//elt ('#header_controls a[href="/"]').text ( function (txt) { console.log (txt); });
		// test returns defined ? "" : undefined;
		expect (elt ('#header_controls a[href="/"]').text ()).toBe ('Home');
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		expect (elt ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
	}));
}

function test_unlogged_footer (url) {
	test ('has >= 9 links in #footer', dsl(function () {
		expect (elt ('#footer a').count ()).toBeGreaterThan (8);
		expect (elt ('#footer a[href="/contact/"]').text ()).toBe ('Contact');
		expect (elt ('#footer #comentlink[href="http://www.co-ment.com"]').text ()).toMatch (/Powered by/m);
		expect (elt ('#footer a[href="/help/"]').text ()).toBe ('Help');
	}));
/*	test ('can change lang to french', dsl(function () {
		element ('#footer a[href="/i18n/setlang/fr/"]').click ();
//		browser.waitForPageLoad ();
//		browser.navigateTo ('/');
		expect (elt ('#footer a[href="/help/"]').text ()).toBe ('Aide');
		element ('#footer a[href="/i18n/setlang/en/"]').click ();
//		browser.waitForPageLoad ();
//		browser.navigateTo ('/');
	}));*/
}

/* Test Django form field presence */
function test_form_field (id, type, label, mandatory) {
	test ('has a '+label+' field', dsl(function () {
		var s = type == 'textarea' ? 'textarea#'+id : 'input#'+id+'[type='+type+']';
		expect (elt (s).val ()).toBeDefined ();
		expect (elt ('label[for='+id+']').text ()).toBe (label);

		if (mandatory)
			expect (elt ('label[for='+id+'] + span.required_star').val ()).toBeDefined ();
	}));
}

function elt (selector) {
	return element (selector + ':visible');
}
