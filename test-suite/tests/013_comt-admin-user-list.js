
suite ('comt logged admin user list', function () {

	this.timeout(20000);

	suite ('people list page conformity', function () {
		test_page_loading	('/user/', 'People\' list\n - '+C['#id_workspace_name']);
		test_comt_logged_header (C.W.USER_ADMIN);
		test_comt_default_tabs	(test_comt.text_nb, test_comt.user_nb);
		test_count	('#user ul.sub_list:eq(0) a', 2);
		test_text	('#user ul.sub_list:eq(0) a:eq(0)[href="/user/add/"]', 'Add a new user');
		test_text	('#user ul.sub_list:eq(0) a:eq(1)[href="/user/mass-add/"]', 'Add users in bulk');
		test_text	('#filter_form a[href="?display=1"]', 'Display suspended users');
		test_count	('form#filter_form[action="."] :input', 1);
		test_text	('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(0)[selected][value="-1"]', '- Bulk Actions -', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(1)[value="disable"]', 'Suspend access', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(2)[value="enable"]', 'Enable access', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(3)[value="role_1"]', 'Change role to Manager', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(4)[value="role_2"]', 'Change role to Editor', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(5)[value="role_3"]', 'Change role to Moderator', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(6)[value="role_4"]', 'Change role to Commentator', C.HIDDEN);
		test_text	('select#bulk_actions option:eq(7)[value="role_5"]', 'Change role to Observer', C.HIDDEN);
		test_val	('form#user_form input#apply[type=button][disabled]', 'Apply');
		test_match	('#paginator', /\s1-4 of 4\s/m);
		test_count	('table.large_table:eq(1) th', 6);
		test_val	('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
		test_text	('table.large_table:eq(1) th:eq(1) a[href="?order=user__username"]', 'User');
		test_text	('table.large_table:eq(1) th:eq(2) a[href="?order=user__email"]', 'Email');
		test_text	('table.large_table:eq(1) th:eq(3) a[href="?order=-user__date_joined"]', 'Date joined');
		test_text	('table.large_table:eq(1) th:eq(4) a[href="?order=role__name"]', 'Role');
		test_text	('table.large_table:eq(1) th:eq(5)', 'Last week activity');
		test_text	('table.large_table:eq(1) tr:last a[href="/user/-/edit/"]', 'Anonymous users');
		test_text	('table.large_table:eq(1) a.main_object_title[href="/profile/"]', C.W.USER_ADMIN);
		test_text	('table.large_table:eq(1) div.hidden-user-actions a[href="/profile/"]', 'Your profile');
		test_val	('form#user_form input#save[type="submit"][disabled]', 'Save');
		test_exist	('#user_form tr:eq(1) td:eq(4) select[disabled]');
		test_exist	('#user_form tr:eq(1) td:eq(0) input[type=checkbox][disabled]');

		for (var i=1; i < 5; i++) {
			test_text	('#user_form tr:eq('+i+') td:eq(1) a.main_object_title', C.USERS[i].name);
			test_text	('#user_form tr:eq('+i+') td:eq(2) a[href="mailto:'+C.USERS[i].email+'"]', C.USERS[i].email);
			test_text	('#user_form tr:eq('+i+') td:eq(3)', C.USERS[i].date);
			test_count	('#user_form tr:eq('+i+') td:eq(4) select option', 6);
			test_text	('#user_form tr:eq('+i+') td:eq(4) select option:eq(0)[value=""]', '---------', C.H);
			test_text	('#user_form tr:eq('+i+') td:eq(4) select option:eq(1)[value="1"]', 'Manager', C.H);
			test_text	('#user_form tr:eq('+i+') td:eq(4) select option:eq(2)[value="2"]', 'Editor', C.H);
			test_text	('#user_form tr:eq('+i+') td:eq(4) select option:eq(3)[value="3"]', 'Moderator', C.H);
			test_text	('#user_form tr:eq('+i+') td:eq(4) select option:eq(4)[value="4"]', 'Commentator', C.H);
			test_text	('#user_form tr:eq('+i+') td:eq(4) select option:eq(5)[value="5"]', 'Observer', C.H);
			test_val	('#user_form tr:eq('+i+') td:eq(4) select', C.USERS[i].role);
		}

		test_text	('#user_form tr:eq(6) td:eq(1) a.main_object_title[href="/user/-/edit/"]', 'Anonymous users');
		test_text	('#user_form tr:eq(6) td:eq(2)', '-');
		test_text	('#user_form tr:eq(6) td:eq(3)', '-');
		test_exist	('#user_form tr:eq(6) td:eq(4) select');
		test_count	('#user_form tr:eq(6) td:eq(4) select option', 3);
		test_text	('#user_form tr:eq(6) td:eq(4) select option:eq(0)[value=""][selected]', '---------', C.H);
		test_text	('#user_form tr:eq(6) td:eq(4) select option:eq(1)[value="4"]', 'Commentator', C.H);
		test_text	('#user_form tr:eq(6) td:eq(4) select option:eq(2)[value="5"]', 'Observer', C.H);
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(0)[href^="/user/"][href$="/edit/"]', 'Edit');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(1)[href^="/use"][href$="ontact/"]','Contact');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(2)[id^="user-suspend-"]', 'Suspend access');
		test_text	('#user_form div.hidden-user-actions:eq(1) a:eq(3)[id^="user-resen"]','(Re-)send invitation');
		test_comt_unlogged_footer ();
	});

	suite_check_user_nb (1);

	suite ('Reset fixture user roles', function () {
		test		('set user-com Commentator', dsl(function () {
			input ('#user_form tr:eq(2) td:eq(4) select').option ('4');
			input ('#user_form tr:eq(3) td:eq(4) select').option ('2');
			input ('#user_form tr:eq(4) td:eq(4) select').option ('5');
			input ('#save').prop ('disabled', false);
		}));
		test_click	('#save', C.WAIT_PAGE_LOAD);
		test_page_loading ('/user/', 'People\' list\n - '+C['#id_workspace_name']);
		test_val	('#user_form tr:eq(2) td:eq(4) select option:selected', '4');
		test_val	('#user_form tr:eq(3) td:eq(4) select option:selected', '2');
		test_val	('#user_form tr:eq(4) td:eq(4) select option:selected', '5');
	});

	suite ('Add a single user', function () {
		test_comt_create_user (C.USERS[5]);
	});

	suite_check_user_nb (2);

	suite ('Add users in bulk', function () {
		this.timeout(100000);
		test_page_loading ('/user/mass-add/', 'Add users in bulk\n - '+C['#id_workspace_name']);
	    test ('fill emails', dsl(function (){
	        elt ('#id_email').val ('uc2@t.co,uc3@t.co,uc4@t.co,uc5@t.co,uc6@t.co,uc7@t.co');
	    }));
		test_fill_field	('#id_tags', {'#id_tags': 'tag_ucs, other_tag' });
		// TOTEST fill note field
		test_click  ('#user input[type="submit"]', C.WAIT_PAGE_LOAD);
		test_comt.user_nb += 6;
	});

	suite_check_user_nb (3);

    suite ('users list pagination conformity', function () {
		test_page_loading	('/user/', 'People\' list\n - '+C['#id_workspace_name']);
        test_count  ('#user_form :input', 6 + (test_comt.user_nb < 10 ? test_comt.user_nb : 10) * 2);
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+test_comt.user_nb+'\\s','m'));
        test_text   ('#paginator a:eq(0)[href="?page=2"]', '»');
        test_text   ('#paginator a:eq(1)[href="?paginate=0"]', 'all');
        test_click  ('#paginator a:eq(0)[href="?page=2"]');
        test_match  ('#paginator', new RegExp ('\\s11-11 of '+test_comt.user_nb+'\\s','m'));
        test_count  ('#user_form :input', test_comt.user_nb % 10 * 2 + 6);
        test_click  ('#paginator a:eq(0)[href="?page=1"]');
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+test_comt.user_nb+'\\s','m'));
        test_count  ('#user_form :input', (test_comt.user_nb < 10 ? test_comt.user_nb : 10) * 2 + 6);
        test_click  ('#paginator a:eq(1)[href="?paginate=0&page=1"]');
        test_match  ('#paginator', /\s\(paginate\)\s/m);
        test_count  ('#user_form :input', test_comt.user_nb * 2 + 6);
        test_click  ('#paginator a:eq(0)[href="?paginate=&page=1"]');
        test_count  ('#user_form :input', (test_comt.user_nb < 10 ? test_comt.user_nb : 10) * 2 + 6);
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+test_comt.user_nb+'\\s','m'));
    });

    suite ('users list filter by tag conformity', function () {
		test_page_loading ('/user/?tag_selected=tag_ucs', 'People\' list\n - '+C['#id_workspace_name']);
		test_count	('#user_form :input', 6 + 6 * 2);
		test_match	('#paginator', new RegExp ('\\s1-6 of 6\\s','m'));
		
    });

	// TOTEST : filter by tag -> commentator user should be tagged commentator (to change in fixture)
	  // bug roles are erased at 1st settings edition
	// TOTEST : Bulk Actions -> Apply does enable
	// suspend users
	// TOTEST display suspended users
	// TOTEST user édition

	// TOTEST suspended user can't login anymore
	// TOTEST roles of users
	// TOTEST si les users anonymes ont droits, ils ont droits…
});

function suite_check_user_nb (n) {
	suite ('check user number #'+n, function () {
		test_page_loading	('/user/?display=1', 'People\' list\n - '+C['#id_workspace_name']);
		test_count	('#user_form :input', 6 + (test_comt.user_nb < 10 ? test_comt.user_nb : 10) * 2);
		test_match	('#paginator', new RegExp ('\\s\\d+-\\d+ of '+test_comt.user_nb+'\\s','m'));
	});
}
