
// console.log ('args '+args);

// try to login

// create texts and co-ments
// collect newly created URLs

// Get workspace name, public texts…

// unlog

// check that public texts still work while unlogged
// check that non public texts are unavailable

// Is the workspace name correctly displayed ? 
// Are the public texts displayed in the login page ?

// var w = require ('./workspace.info.js');

var admin_username = 'siltaar';
var admin_password = 'oaueoaue';

describe ('comt', function () {

	this.timeout(150000);

	describe ('help page', function () {
		it_checks_page_loading ('/help/', 'Help');
		it_checks_unlogged_header ();
		it_checks_unlogged_footer ();
	});

	describe ('contact page', function () {
		it_checks_page_loading ('/contact/', 'Contact');
		it_checks_unlogged_header ();

		it ('should have a contact form', dsl(function () {
			expect (elt ('#profile[action="."]').val ()).toBeDefined ();
		}));

		it_checks_form_field ('id_name', 'text', 'Your name', true);
		it_checks_form_field ('id_email', 'text', 'Your email address', true);
		it_checks_form_field ('id_title', 'text', 'Subject of the message', true);
		it_checks_form_field ('id_body', 'textarea', 'Body of the message', true);
		it_checks_form_field ('id_copy', 'checkbox', 'Send me a copy of the email', false);

		it ('should have some submit and cancel buttons', dsl(function () {
			expect (elt ('#profile input[type=submit]').val ()).toBe ('Send');
			expect (elt ('input#cancel_button[type=button]').val ()).toBe ('Cancel');
		}));

		it_checks_unlogged_footer ();
	});

	describe ('reset password page', function () {
		it_checks_page_loading ('/password_reset/', 'Reset my password');
		it_checks_unlogged_header ();

		it ('should have a contact form', dsl(function () {
			expect (elt ('#profile[action="."]').val ()).toBeDefined ();
		}));

		it_checks_form_field ('id_email', 'text', 'E-mail', true);

		it ('should have a submit button', dsl(function () {
			expect (elt ('#profile input[type=submit]').val ()).toBe ('Reset my password');
		}));

		it_checks_unlogged_footer ();
	});

	describe ('login page', function () {
		it_checks_page_loading ('/', 'Home');
		it_checks_unlogged_header ();

		it ('should have a #login form', dsl(function () {
			expect (elt ('#login[action="/login/"]').val ()).toBeDefined ();
		}));

		it_checks_form_field ('id_username', 'text', 'Username', true);
		it_checks_form_field ('id_password', 'password', 'Password', true);

		it ('should have a login button and reset password links', dsl(function () {
			expect (elt ('#login input[type=submit]').val ()).toBe ('Login');
			expect (elt ('#login a[href="/password_reset/"]').text ()).toBe ('Forgot password?');
		}));

		it_checks_unlogged_footer ();

		it ('should log an admin in', dsl(function () {
			input ('#id_username').enter (admin_username);
			input ('#id_password').enter (admin_password);
			elt ('#login input[type=submit]').click ();
			browser.waitForPageLoad ();
			// Must be done here in this 'it' block
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard/m);
		}));
	});

	describe ('admin dashboard', function () {
//		it_checks_page_loading ('/', 'Dashboard');
		it_checks_logged_header (admin_username);
		it_checks_unlogged_footer ();
	});
});

function it_checks_page_loading (url, title) {
	it ('should load', dsl(function () {
		// here we are in Karma page
		browser.navigateTo (url);
		expect (element ('title').text ()).toMatch (new RegExp (title,'m'));
		element ('title').text (function (page_title) { // The same test with more vanilla javascript
			// here we got a value from the test iframe
			if (!(new RegExp (title, 'm').test (page_title))) throw 'got page '+page_title+' instead';
		});
	}));
}

function it_checks_logged_header (username) {
	it ('should have 6 links in #header_controls', dsl(function () {
		expect (elt ('#header_controls a').count ()).toBe (6);
	}));
	it ('should display current connected username', dsl(function () {
		expect (elt ('#header_controls b').text ()).toBe (username);
	}));
		it ('should have a Home link', dsl(function () {
		expect (elt ('#header_controls a:nth-of-type(1)[href="/"]').text ()).toBe ('Home');
	}));
/*		it ('should have a Login link', dsl(function () {
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		}));*/
}

function it_checks_unlogged_header () {
	it ('should have 2 links', dsl(function () {
		expect (elt ('#header_controls a').count ()).toBe (2);
		expect (elt ('#header_controls a[href="/"]').val ()).toBeDefined ();
		// to display the tested value :
		//elt ('#header_controls a[href="/"]').text ( function (txt) { console.log (txt); });
		// it returns defined ? "" : undefined;
		expect (elt ('#header_controls a[href="/"]').text ()).toBe ('Home');
		expect (elt ('#header_controls a[href="/login/"]').text ()).toBe ('Login');
		expect (elt ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
	}));
}

function it_checks_unlogged_footer () {
	it ('should have >= 9 links in #footer', dsl(function () {
		expect (elt ('#footer a').count ()).toBeGreaterThan (8);
		expect (elt ('#footer a[href="/contact/"]').text ()).toBe ('Contact');
		expect (elt ('#footer #comentlink[href="http://www.co-ment.com"]').text ()).toMatch (/Powered by/m);
		expect (elt ('#footer a[href="/help/"]').text ()).toBe ('Help');
	}));
}

function it_checks_form_field (id, type, label, mandatory) {
	it ('should have a '+label+' field', dsl(function () {
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
