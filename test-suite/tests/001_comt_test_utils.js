
// " Vim settings
// set tabstop=4          " number of spaces in a tab
// set softtabstop=4      " as above
// set shiftwidth=4       " as above

/**
 * Constants and variables
 */

var test_comt = { text_nb: 0, user_nb: 4, long_text: '' };

for (var i = 20; i--;)
    test_comt.long_text += 'Contenu du troisième texte.<br/>Sur <b>plusieurs</b> lignes<br/>';

const C = { 'HIDDEN': false,
	'H': false,
	'NO_TAGLINE': false,
	'WAIT_PAGE_LOAD': true,
	'W': __karma__.config.W,
	'#id_workspace_name':	'Test workspace name',
	'#id_workspace_tagline':	'Test workspace tagline',
	'#id_workspace_registration':			'on',	// registration
	'#id_workspace_registration_moderation':'on',	// registration moderation
	'#id_workspace_role_model': 'generic',
	'#id_workspace_category_1': 'ws_cat_1',
	'#id_workspace_category_2': 'ws_cat_2',
	'#id_workspace_category_3': 'ws_cat_3',
	'#id_workspace_category_4': 'ws_cat_4',
	'#id_workspace_category_5': 'ws_cat_5',
	'#id_custom_css': "h2 {  font-family: Test_Sopinspace !important; }",
	'#id_custom_font': 'Test_Sopinspace_custom_font',
	'#id_custom_titles_font': 'Test_Sopinspace_custom_titles_font',
	'TEXTS': [
	    {
	        '#id_title':    'Text One Sopinspace-Test éléguant',
	        '#id_format':   'markdown',
	        '#id_content':  'Contenu du premier texte.\nSur plusieurs lignes\nPour tester un cas réaliste',
	        '#id_tags':     'test_text, Text Premier'
	    },
	    {
	        '#id_title':    'Text Two Sopinspace-Test éléguant',
	        '#id_format':   'rst',
	        '#id_content':  'Contenu du deuxième texte.\nSur plusieurs lignes aussi\nPour tester un cas réaliste',
	        '#id_tags':     'test_text, Text Second'
	    },
	    {
	        '#id_title':    'Text Three Sopinspace-Test éléguant',
    	    '#id_format':   'html',
	        '#id_content':  test_comt.long_text,
	        '#id_tags':     'test_text, Text Troisième'
	    }
	],
	'USERS': [
	    {}, // to start counting at one
		// SID roles should be : '', 4, 2, 5 ; but we're facing a bug here 
	    { name: 'admin',        email: 'admin@mail.com',            date:'March 8, 2014 at 3:12 p.m.', role:'' },
	    { name: 'user-com',     email: 'user-com@example.com',      date:'March 9, 2014 at 2:40 p.m.', role:'5'},
    	{ name: 'user-edit',    email: 'user-edit@example.com',     date:'March 9, 2014 at 2:40 p.m.', role:'5'},
	    { name: 'user-observ',  email: 'user-observ@example.com',   date:'March 9, 2014 at 2:40 p.m.', role:'5'},
	    { '#id_tags': 'user-created-1',   '#id_email': 'uc1@example.com',   '#id_role':'2'},
	    { '#id_tags': 'user-created-2',   '#id_email': 'uc2@example.com',   '#id_role':'4'}
	]
};


/**
 * COMT test API
 */

function test_comt_login (user, pass) {
	test ('with '+user+' - '+pass, dsl(function () {
		browser.navigateTo ('/');
		input ('#id_username').enter (user);
		input ('#id_password').enter (pass);
		elt ('#login input[type=submit]').click ();
		browser.waitForPageLoad (); // Must be done here in this test() block
		browser.navigateTo ('/');
		expect (element ('title').text ()).toMatch (/Dashboard/m);
	}));
}

function test_comt_logout () {
	test_page_loading ('/logout/', 'Home - '+C['#id_workspace_name']);
};

function test_comt_create_text (t) {
	test_page_loading	('/create/content/', 'Create a text - '+C['#id_workspace_name']);
	test ('test creation', dsl(function () {
		dropdownlist ('#id_format').option (t['#id_format']);
	}));

	test_fill_field ('#id_title', t);
	test ('fill content', dsl(function (){
		elt ('#id_content').val (t['#id_content']);
	}));

	test_fill_field ('#id_tags', t);
	test_click	 ('#save_button', C.WAIT_PAGE_LOAD);
	test_comt.text_nb++;
}

function test_comt_create_user (u) {
    test_page_loading   ('/user/add/', 'Add a new user\n - '+C['#id_workspace_name']);
	test_fill_field ('#id_email', u);
	test_fill_field ('#id_tags', u);

    test ('test creation', dsl(function () {
        dropdownlist ('#id_role').option (u['#id_role']);
    }));

    test_click   ('#user input[type="submit"]', C.WAIT_PAGE_LOAD);
    test_comt.user_nb++;
}


/**
 * Other factorized tests
 */



function test_comt_default_tabs (txt_nb, usr_nb) {
	test_count	('#main-tabs a', 5);
	test_text	('#main-tabs li:nth-of-type(1) a[href="/"]',			'Dashboard');
	test_match	('#main-tabs li:nth-of-type(2) a[href="/text/"]',		/^Texts \(\d+\) $/);
	test_match	('#main-tabs li:nth-of-type(3) a[href="/user/"]',		/^People  \(\d+\)$/);
	test_text	('#main-tabs li:nth-of-type(4) a[href="/settings/"]',	'Settings');
	test_text	('#main-tabs li:nth-of-type(5) a[href="/followup/"]',	'Followup');
	test_match	('#main-tabs a[href="/text/"]', new RegExp ('^Texts\\s*\\('+txt_nb+'\\)\\s*$'));
	test_match	('#main-tabs a[href="/user/"]', new RegExp ('^People\\s*\\('+usr_nb+'\\)\\s*$'));
}

function test_comt_logged_header (username, is_tagline) {
	is_tagline = typeof is_tagline == 'undefined' ? true : is_tagline;

	test_text	('#header_controls b', username)
	test_count	('#header_controls a', 6);
	test_text	('#header_controls a:nth-of-type(1)[href="/"]',					'Home');
	test_text	('#header_controls a:nth-of-type(2)[href="/create/content/"]',	'Create a text');
	test_text	('#header_controls a:nth-of-type(3)[href="/create/upload/"]',	'Upload a text');
	test_text	('#header_controls a:nth-of-type(4)[href="/create/import/"]',	'Import a co-mented text');
	test_text	('#header_controls a:nth-of-type(5)[href="/profile/"]',			'Profile');
	test_text	('#header_controls a:nth-of-type(6)[href="/logout/"]',			'Logout');
	test_text	('#content h1.main_title a[href="/"]',							C['#id_workspace_name']);

	if (is_tagline) {
		test_match	('#content h1.main_title  + div', new RegExp (C['#id_workspace_tagline'], 'm'));
	}
}

function test_comt_fill_settings (s) {
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

function test_comt_fill_design (s) {
	test_fill_field ('#id_custom_css', s);
	test_fill_field ('#id_custom_font', s);
	test_fill_field ('#id_custom_titles_font', s);
}

/** Test if it's possible to change lang to the specified :
 *  c : lang code
 *  l : help label
 */
function test_comt_i18n (c, l) {
    test ('to '+c, dsl(function () {
        element ('#footer a[href="/i18n/setlang/'+c+'/"]').click ();
        browser.navigateTo ('/');
        expect (elt ('#footer a[href="/help/"]').text ()).toMatch (new RegExp (l, 'm'));
    }));
}

