
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
const non_visible = false;
var text_nb = 0;
var user_nb = 0;
var pub_text_nb = 0;
var workspace_name = '';
var workspace_tagline = '';

suite ('comt', function () {

	this.timeout(150000);

	suite ('contact page', function () {
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

	suite ('help page', function () {
		test_page_loading ('/help/', 'Help');
		test_unlogged_header ();
		test_unlogged_footer ();
	});

	suite ('reset password page', function () {
		test_page_loading ('/password_reset/', 'Reset my password');
		test_unlogged_header ();
		test_val	('form#profile[action="."]');
		test_count	('form#profile :input', 3);
		test_form_field ('profile', 'id_email', 'text', 1, 'E-mail', true);
		test_val	('#profile input[type=submit]', 'Reset my password');
		test_unlogged_footer ();
	});

	suite ('login page', function () {
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

	suite ('admin dashboard', function () {
		// Should starts with :
		// test_page_loading ('/', 'Dashboard');
		// But its the last thing we did in the previous test
		test_logged_header (w.USER_ADMIN);
		test ('get text and user nb', dsl(function () {
			element ('span.metadata:eq(0)').text (function (metadata) {
				var r = metadata.match (/(\d+) texts, (\d+) users/);
				if (r.length != 3) throw 'expected 3 matches got '+r.length;
				text_nb = r[1];
				user_nb = r[2];
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

	suite ('texts list', function () {
		test_page_loading ('/text/', 'Texts');
		test_logged_header (w.USER_ADMIN);
		test_default_tabs ();
		test_count	('#text ul.sub_list:eq(0) a', 3);
		test_text	('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
		test_text	('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
		// TOTEST : filter by tag
		test_count	('form#filter_form[action="."] :input', 1);
		test_text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', non_visible);
		test		('#texts_form input count', dsl (function () {
			elt ('form#texts_form[action="."] :input').count (function (c) {
				var n = 3 + text_nb % 10;
				if (c != n) throw 'expected computed '+n+' to equal got '+c;
			});
		}));
		test		('#paginator "of #" value', dsl (function () {
			elt ('span#paginator').text (function (t) {
				var r = t.match (/\s\d+-\d+ of (\d+)\s/m);
				if (r.length != 2) throw 'expected 2 matches got '+r.length;
				if (r[1] != text_nb) throw 'expected paginator total ('+r[1]+') to be '+text_nb;
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

	suite ('followup', function () {
		test_logged_header (w.USER_ADMIN);
		test_default_tabs ();
		test_page_loading ('/followup/', 'Followup');
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
			if (text_nb != r[1]) throw 'expected tab text nb ('+r[1]+') to be '+text_nb;
		});
		elt ('#main-tabs a[href="/user/"]').text (function (t) {
			var r = t.match (/^People  \((\d+)\)$/);
			if (r.length != 2) throw 'for People expected 2 matches got '+r.length;
			if (user_nb != r[1]) throw 'expected tab people nb ('+r[1]+') to be '+user_nb;
		});
	}));
}

function test_logged_header (username) {
	test_text	('#header_controls b', username)
	test_count	('#header_controls a', 6);
	test_text	('#header_controls a:nth-of-type(1)[href="/"]',					'Home');
	test_text	('#header_controls a:nth-of-type(2)[href="/create/content/"]',	'Create a text');
	test_text	('#header_controls a:nth-of-type(3)[href="/create/upload/"]',	'Upload a text');
	test_text	('#header_controls a:nth-of-type(4)[href="/create/import/"]',	'Import a co-mented text');
	test_text	('#header_controls a:nth-of-type(5)[href="/profile/"]',			'Profile');
	test_text	('#header_controls a:nth-of-type(6)[href="/logout/"]',			'Logout');
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
		var s = type == 'textarea' ? 'textarea#'+field_id : 'input#'+field_id+'[type='+type+']';
		expect (elt (s).val ()).toBeDefined ();
		expect (elt ('#'+form_id+' :input:eq('+position+')#'+field_id).val ()).toBeDefined ();
		expect (elt ('label[for='+field_id+']').text ()).toBe (label);

		if (mandatory)
			expect (elt ('label[for='+field_id+'] + span.required_star').val ()).toBeDefined ();
	}));
}

/** Ensure the given element is visible
 *  s : CSS selector of the DOM element to check
 *  v : should the element being visible
 */
function elt (s, v) {
	return element (s + (v ? ':visible' : ''));
}
