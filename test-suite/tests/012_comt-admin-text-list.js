
// " Vim settings
// set tabstop=4          " number of spaces in a tab
// set softtabstop=4      " as above
// set shiftwidth=4       " as above


suite ('comt admin text list', function () {

    this.timeout(200000);

    suite ('empty texts list page conformity', function () {
        test_page_loading   ('/text/', 'Texts\n - '+C['#id_workspace_name']);
        test_comt_logged_header  (C.W.USER_ADMIN);
        test_comt_default_tabs   (test_comt.text_nb, test_comt.user_nb);
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
        test_match  ('#text', /No texts yet/m);
        test_count  ('#texts_form :input', 0);
    });

    suite ('create texts', function () {
      // test_pause();
        for (var j=4; j--;)
            for (var i=3; i--;)
                 test_comt_create_text (C.TEXTS[i]);
    });

    suite ('texts list page conformity', function () {
        test_page_loading   ('/text/', 'Texts\n - '+C['#id_workspace_name']);
        test_comt_logged_header  (C.W.USER_ADMIN);
        test_comt_default_tabs   (test_comt.text_nb, test_comt.user_nb);
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
        test_count  ('form#filter_form[action="."] :input', 1);
        test_text   ('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', C.HIDDEN);
        test_text   ('select#bulk_actions option:eq(0)[selected][value="-1"]', 'Bulk Actions', C.HIDDEN);
        test_text   ('select#bulk_actions option:eq(1)[value="delete"]', 'Delete', C.HIDDEN);
        test_val    ('form#texts_form input#apply[type=button][disabled]', 'Apply');
        test_count  ('table.large_table:eq(1) th', 6);
        test_val    ('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
        test_text   ('table.large_table:eq(1) th:eq(1) a[href="?order=title"]', 'Text');
        test_text   ('table.large_table:eq(1) th:eq(2)', 'Author');
        test_text   ('table.large_table:eq(1) th:eq(3) a[href="?order=-modified"]', 'Modified');
        test_text   ('table.large_table:eq(1) th:eq(4)', '# comments');
        test_text   ('table.large_table:eq(1) th:eq(5)', 'Last week activity');
        test_comt_unlogged_footer ();
    });

    suite ('texts list filter', function () {
        test_page_loading ('/text/?tag_selected=Text+Troisième', 'Texts\n - '+C['#id_workspace_name']);
        test_count  ('#texts_form :input', 4 + 3);
        test_match  ('#paginator', /\s1-4 of 4\s/m);

        for (var i=4; i--;) {
            test_text   ('a.main_object_title:eq('+i+')', C.TEXTS[2]['#id_title']);
            test_match  ('.tag_list:eq('+i+')', /tags:(?:\sText Troisième|\stest_text){2}\s/);
            test_text   ('.tag_list:eq('+i+') a[href="?tag_selected=test_text"]', 'test_text');
            test_text   ('.tag_list:eq('+i+') a[href="?tag_selected=Text+Troisi%C3%A8me"]','Text Troisième');
            test_text   ('#text .hidden-text-actions:eq('+i+') a:eq(0)[href^="/text/"][href$="/view/"]', 'View');
            test_text   ('#text .hidden-text-actions:eq('+i+') a:eq(1)[href^="/text/"][href$="/edit/"]', 'Edit');
            test_text   ('#text .hidden-text-actions:eq('+i+') a:eq(2)[href="#"][id*="text-delete-"]', 'Delete');
            test_text   ('#text .hidden-text-actions:eq('+i+') a:eq(3)[href^="/text/"][href$="/share/"]', 'Users');
            test_text   ('#text .hidden-text-actions:eq('+i+') a:eq(4)[href^="/text/"][href$="/settings/"]', 'Settings');
            test_text   ('#text a[title="Edit user"][href^="/user/"][href$="/edit/"]:eq('+i+')', 'admin');
            test_text   ('#text table[summary="text list"] tr:eq('+(i+1)+') td:eq(4)', '0');
        }
    });

    suite ('texts list pagination conformity', function () {
        test_page_loading ('/text/', 'Texts\n - '+C['#id_workspace_name']);
        test_count  ('#texts_form :input', (test_comt.text_nb < 10 ? test_comt.text_nb : 10) + 3);
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+test_comt.text_nb+'\\s','m'));
        test_text   ('#paginator a:eq(0)[href="?page=2"]', '»');
        test_text   ('#paginator a:eq(1)[href="?paginate=0"]', 'all');
        test_click  ('#paginator a:eq(0)[href="?page=2"]');
        test_match  ('#paginator', new RegExp ('\\s11-12 of '+test_comt.text_nb+'\\s','m'));
        test_count  ('#texts_form :input', test_comt.text_nb % 10 + 3);
        test_click  ('#paginator a:eq(0)[href="?page=1"]');
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+test_comt.text_nb+'\\s','m'));
        test_count  ('#texts_form :input', (test_comt.text_nb < 10 ? test_comt.text_nb : 10) + 3);
        test_click  ('#paginator a:eq(1)[href="?paginate=0&page=1"]');
        test_match  ('#paginator', /\s\(paginate\)\s/m);
        test_count  ('#texts_form :input', test_comt.text_nb + 3);
        test_click  ('#paginator a:eq(0)[href="?paginate=&page=1"]');
        test_count  ('#texts_form :input', (test_comt.text_nb < 10 ? test_comt.text_nb : 10) + 3);
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+test_comt.text_nb+'\\s','m'));
    });

    suite ('texts list bulk deletion', function () {
        test_page_loading ('/text/?page=2', 'Texts\n - '+C['#id_workspace_name']);
        test        ('choose bulk action Delete', dsl(function () { input('#bulk_actions').option('delete'); }));
        test_click  ('#all_check');
        test_count  ('form#texts_form input:checked', test_comt.text_nb % 10 + 1);
        test_val    ('form#texts_form input#apply[type=button]:not([disabled])', 'Apply');
        /* test_click   ('#texts_form #apply'); // can't click on the confirm dialog */
        test_submit ('#texts_form');
        test_page_loading ('/text/', 'Texts\n - '+C['#id_workspace_name']);
        test_comt.text_nb -= 2;
        test_count  ('form#texts_form :input', test_comt.text_nb + 3);
        test_match  ('#paginator', new RegExp ('\\s1-'+test_comt.text_nb+' of '+test_comt.text_nb+'\\s','m'));
    });

    suite ('texts list single deletion', function () {
        test        ('choose bulk action Delete', dsl(function () { input('#bulk_actions').option('delete'); }));
        test_click  ('.text_check:eq(0)');
        test_count  ('form#texts_form input:checked', 1);
        test_val    ('form#texts_form input#apply[type=button]:not([disabled])', 'Apply');
        test_submit ('#texts_form');
        test_page_loading ('/text/', 'Texts\n - '+C['#id_workspace_name']);
        test_comt.text_nb -= 1;
        test_count  ('form#texts_form :input', test_comt.text_nb + 3);
        test_match  ('#paginator', new RegExp ('\\s1-'+test_comt.text_nb+' of '+test_comt.text_nb+'\\s','m'));
    });

});

