
suite ('comt admin text view', function () {
// suite.only ('comt admin text view', function () {

	this.timeout(2000000);

	suite ('comt admin text view conformity', function () {
/*		test_comt_login (C.W.USER_ADMIN, C.W.PASS_ADMIN);
		test_comt_create_text (C.TEXTS[1]);
		test_comt_create_text (C.TEXTS[2]);*/

		test_page_loading ('/text/', 'Texts\n - ');
		
		test_click	('#text a.main_object_title:eq(1)');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_text('#content h1.main_title_text a.title[href^="/text/"][href$="/view/"]', C.TEXTS[2]['#id_title']);
		test_match('#content span.metadata', '\\s*0 comments,\\s*1 version,\\s*.*last modified \\d* minutes? ago\\s*');
		test_match('#content span.metadata span', 'last modified \\d* minutes? ago');
		test_match('#share', 'Share');
		test_text('#share-options li:eq(0) a[href^="http://www.facebook.com/sharer.php"]', ' Facebook', C.HIDDEN);
		test_text('#share-options li:eq(1) a[href^="http://digg.com/remote-submit/"]', ' Digg', C.HIDDEN);
		test_text('#share-options li:eq(2) a[href^="http://www.linkedin.com/shareArticle"]', ' Linkedin', C.HIDDEN);
		test_comt_text_tabs (1);

/*		test ('Get into the inner frame', dsl(function () {
			expect (browser.navigateTo (element ('#text_view_frame').attr ('src')));
		}));

		test_text('#outer-north table:eq(0) tr:eq(0) td:eq(0) span#c_filter_results', '-/ 0 discussions');*/
	});

	suite ('comt admin text view edit conformity', function () {
		test_click	('#text-tabs li:nth-of-type(2) a[href^="/text/"][href$="/edit/"]');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_comt_text_tabs (1);
		test_exist	('#text-tabs li:nth-of-type(2).ui-tabs-active a#edit_tab_link');
		test_count	('#edit_form :input', 10);
		test_field	('edit_form', 'id_title',					'text',		0, 'Title', true);
		test_field	('edit_form', 'id_format',					'select',	1, 'Format');
		test_field	('edit_form', 'id_content',					'textarea',	2, 'Content', true);
		test_field	('edit_form', 'id_new_version',				'checkbox',	3, 'New version (optional)');
		test_field	('edit_form', 'id_tags',					'text',		4, 'Tags');
		test_field	('edit_form', 'id_note',					'text',		5, 'Note (optional)');
		test_field	('edit_form', 'id_keep_comments',			'checkbox',	6, 'Keep comments (optional)');
		test_field	('edit_form', 'id_cancel_modified_scopes',	'checkbox', 7, 'Detach comments (optional)');
//		test_count	('.markdown #markItUpId_content li', 20);
		test_val	('#edit_form :input:eq(9)#save[type=button]', 'Save');
	});

	suite ('comt admin text view people conformity', function () {
		test_click	('#text-tabs li:eq(2) a[href$="/share/"]');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_comt_text_tabs (1);
		// look into people list
		test_comt_unlogged_footer ();
	});

	suite ('comt admin text view versions conformity', function () {
		test_click	('#text-tabs li:eq(3) a[href$="/history/"]');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_comt_text_tabs (1);

		test_comt_unlogged_footer ();
	});

	suite ('comt admin text view settings conformity', function () {
		test_click	('#text-tabs li:eq(4) a[href$="/settings/"]');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_comt_text_tabs (1);
		test_count	('#settings_form :input', 7);
		test_field	('settings_form', 'id_mod_posteriori','checkbox',	0, 'Moderation a posteriori?');
		test_field	('settings_form', 'id_category_1',	'text',	1, 'Label for the first category of comments');
		test_field	('settings_form', 'id_category_2',	'text',	2, 'Label for the second category of comments');
		test_field	('settings_form', 'id_category_3',	'text',	3, 'Label for the third category of comments');
		test_field	('settings_form', 'id_category_4',	'text',	4, 'Label for the fourth category of comments');
		test_field	('settings_form', 'id_category_5',	'text',	5, 'Label for the fifth category of comments');
		test_val	('#settings_form :input:eq(6)#save[type=submit]', 'Save');
		test_comt_unlogged_footer ();
		// TOTEST: Moderation a posteriori
		// TOTEST: Labels of the categories
	});

	suite ('comt admin text view followup conformity', function () {
		test_click	('#text-tabs li:eq(5) a[href$="/followup/"]');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_comt_text_tabs (1);
		var p = C.W.WORKSPACE_URL+'text/(\\d|\\w)+/feed/'; // public feed url
		test_match	('#followup_settings a:eq(0)[href$="/feed/"]', new RegExp (p, 'm'));
		test_count	('form#notifications[action="."] :input', 2);
		test_val	('form#notifications input#activate[type=submit]', 'Activate private feed');
		test_click	('#activate', C.WAIT_PAGE_LOAD);
		test_match	('#followup_settings a:eq(1)', new RegExp (p+'(\\d|\\w)+/', 'm'));
		test_val	('form#notifications input#reset[type=submit]', 'Reset private feed url');
		test_exist	('form#notifications input#text_notify_check[type=checkbox]:not(:checked)');
		// TOTEST notifications ?
		test_comt_unlogged_footer ();
	});

	suite ('comt admin text view embed conformity', function () {
		test_click	('#text-tabs li:eq(6) a[href$="/embed/"]');
		test_comt_logged_header (C.W.USER_ADMIN, C.NO_TAGLINE, C.IS_TEXT);
		test_comt_text_tabs (1);
		test_count	('form#embed', 1);
		test_val	('input#embed_txt.copy_link[type="text"][readonly="true"]', '<iframe  frameborder="0" src="'+C.W.WORKSPACE_URL+'text/(\\d|\\w)+/comments_frame/\\?" style="height: 600px; width: 99.9%; position: relative; top: 0px;"></iframe>');
		// TOTEST is text selected in input ?
		test_comt_unlogged_footer ();
	});
});
