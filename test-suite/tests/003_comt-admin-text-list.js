
// " Vim settings
// set tabstop=4          " number of spaces in a tab
// set softtabstop=4      " as above
// set shiftwidth=4       " as above

var long_text = '';

for (var i = 20; i--;)
    long_text += 'Contenu du troisième texte.<br/>Sur <b>plusieurs</b> lignes<br/>';

const ctexts = [ 
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
        '#id_content':  long_text, 
        '#id_tags':     'test_text, Text Troisième' 
    } 
];

suite ('comt admin text list', function () {

    this.timeout(200000);

    suite ('empty texts list page conformity', function () {
        test_page_loading   ('/text/', 'Texts\n - '+c['#id_workspace_name']);
        test_logged_header  (w.USER_ADMIN);
        test_default_tabs   (t.text_nb, t.user_nb);
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
        test_match  ('#text', /No texts yet/m);
        test_count  ('#texts_form :input', 0);
    });

    suite ('create texts', function () {
        for (var j=4; j--;)
            for (var i=3; i--;)
                 create_text (i);
    });

    suite ('texts list page conformity', function () {
        test_page_loading   ('/text/', 'Texts\n - '+c['#id_workspace_name']);
        test_logged_header  (w.USER_ADMIN);
        test_default_tabs   (t.text_nb, t.user_nb);
        test_count  ('#text ul.sub_list:eq(0) a', 3);
        test_text   ('#text ul.sub_list:eq(0) a:eq(0)[href="/create/content/"]', 'Create a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(1)[href="/create/upload/"]', 'Upload a text');
        test_text   ('#text ul.sub_list:eq(0) a:eq(2)[href="/create/import/"]', 'Import a co-mented text');
        test_count  ('form#filter_form[action="."] :input', 1);
        test_text   ('select#tag_selected option:eq(0)[selected][value="0"]', '- All -', hidden);
        test_text   ('select#bulk_actions option:eq(0)[selected][value="-1"]', 'Bulk Actions', hidden);
        test_text   ('select#bulk_actions option:eq(1)[value="delete"]', 'Delete', hidden);
        test_val    ('form#texts_form input#apply[type=button][disabled]', 'Apply');
        test_count  ('table.large_table:eq(1) th', 6);
        test_val    ('table.large_table:eq(1) th:eq(0) input#all_check[type="checkbox"]', 'on');
        test_text   ('table.large_table:eq(1) th:eq(1) a[href="?order=title"]', 'Text');
        test_text   ('table.large_table:eq(1) th:eq(2)', 'Author');
        test_text   ('table.large_table:eq(1) th:eq(3) a[href="?order=-modified"]', 'Modified');
        test_text   ('table.large_table:eq(1) th:eq(4)', '# comments');
        test_text   ('table.large_table:eq(1) th:eq(5)', 'Last week activity');
        test_unlogged_footer ();
    });

    suite ('texts list filter', function () {
        test_page_loading ('/text/?tag_selected=Text+Troisième', 'Texts\n - '+c['#id_workspace_name']);
        test_count  ('#texts_form :input', 4 + 3);
        test_match  ('#paginator', /\s1-4 of 4\s/m);

        for (var i=4; i--;) {
            test_text   ('a.main_object_title:eq('+i+')', ctexts[2]['#id_title']);
            test_match  ('.tag_list:eq('+i+')', /tags: test_text Text Troisième /);
            test_text   ('.tag_list:eq('+i+') a:eq(0)[href="?tag_selected=test_text"]', 'test_text');
            test_text   ('.tag_list:eq('+i+') a:eq(1)[href="?tag_selected=Text+Troisi%C3%A8me"]','Text Troisième');
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
        test_page_loading ('/text/', 'Texts\n - '+c['#id_workspace_name']);
        test_count  ('#texts_form :input', (t.text_nb < 10 ? t.text_nb : 10) + 3);
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
        test_text   ('#paginator a:eq(0)[href="?page=2"]', '»');
        test_text   ('#paginator a:eq(1)[href="?paginate=0"]', 'all');
        test_click  ('#paginator a:eq(0)[href="?page=2"]');
        test_match  ('#paginator', new RegExp ('\\s11-12 of '+t.text_nb+'\\s','m'));
        test_count  ('#texts_form :input', t.text_nb % 10 + 3);
        test_click  ('#paginator a:eq(0)[href="?page=1"]');
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
        test_count  ('#texts_form :input', (t.text_nb < 10 ? t.text_nb : 10) + 3);
        test_click  ('#paginator a:eq(1)[href="?paginate=0&page=1"]');
        test_match  ('#paginator', /\s\(paginate\)\s/m);
        test_count  ('#texts_form :input', t.text_nb + 3);
        test_click  ('#paginator a:eq(0)[href="?paginate=&page=1"]');
        test_count  ('#texts_form :input', (t.text_nb < 10 ? t.text_nb : 10) + 3);
        test_match  ('#paginator', new RegExp ('\\s1-10 of '+t.text_nb+'\\s','m'));
    });

    suite ('texts list bulk deletion', function () {
        test_page_loading ('/text/?page=2', 'Texts\n - '+c['#id_workspace_name']);
        test        ('choose bulk action Delete', dsl(function () { input('#bulk_actions').option('delete'); }));
        test_click  ('#all_check');
        test_count  ('form#texts_form input:checked', t.text_nb % 10 + 1);
        test_val    ('form#texts_form input#apply[type=button]:not([disabled])', 'Apply');
        /* test_click   ('#texts_form #apply'); // can't click on the confirm dialog */
        test_submit ('#texts_form');
        test_page_loading ('/text/', 'Texts\n - '+c['#id_workspace_name']);
        t.text_nb -= 2;
        test_count  ('form#texts_form :input', t.text_nb + 3);
        test_match  ('#paginator', new RegExp ('\\s1-'+t.text_nb+' of '+t.text_nb+'\\s','m'));
    });

    suite ('texts list single deletion', function () {
        test        ('choose bulk action Delete', dsl(function () { input('#bulk_actions').option('delete'); }));
        test_click  ('.text_check:eq(0)');
        test_count  ('form#texts_form input:checked', 1);
        test_val    ('form#texts_form input#apply[type=button]:not([disabled])', 'Apply');
        test_submit ('#texts_form');
        test_page_loading ('/text/', 'Texts\n - '+c['#id_workspace_name']);
        t.text_nb -= 1;
        test_count  ('form#texts_form :input', t.text_nb + 3);
        test_match  ('#paginator', new RegExp ('\\s1-'+t.text_nb+' of '+t.text_nb+'\\s','m'));
    });

});

function create_text (i) {
    test_page_loading   ('/create/content/', 'Create a text - '+c['#id_workspace_name']);
    test ('test creation', dsl(function () {
        dropdownlist ('#id_format').option (ctexts[i]['#id_format']);
    }));

    test_fill_field ('#id_title', ctexts[i]);
    test ('fill content', dsl(function (){
        elt ('#id_content').val (ctexts[i]['#id_content']);
    }));

    test_fill_field ('#id_tags', ctexts[i]);
    test_click   ('#save_button', wait_page_load);
    t.text_nb++;
}

