
// console.log ('args '+args);

// try to login

// create texts and co-ments
// collect newly created URLs

// unlog

// check that public texts still work while unlogged

// check that non public texts are unavailable

describe ('comt', function () {

	this.timeout(150000);

	describe ('login page', function () {
		it ('should load', dsl(function () {
			// here we are in Karma page
			browser.navigateTo ('/');

			/*element ('title').text (function (page_title) {
				// here we got a value from the test iframe
				if (typeof page_title != 'string') throw 'page_title not a string, network problem ?';
				if (!/(Accueil|Home) - Workspace/.test (page_title)) throw 'got page '+page_title+' instead';
			});*/

			expect (element ('title').text ()).toBeDefined ();
			expect (element ('title').text ()).toMatch (/Home/);

		}));
		it ('should have 2 links in #header_controls', dsl(function () {
			expect (element ('#header_controls a').count ()).toBe (2);
		}));
		it ('should have a Home link in #header_controls', dsl(function () {
			expect (element ('#header_controls a[href="/"]').val ()).toBeDefined ();
			// to display the tested value :
			//element ('#header_controls a[href="/"]').text ( function (txt) { console.log (txt); });
			// returns defined ? "" : undefined;
		}));
		it ('should have a Login link in #header_controls', dsl(function () {
			expect (element ('#header_controls a[href="/login/"]').val ()).toBeDefined ();
		}));
		it ('should not have a XXX link in #header_controls', dsl(function () {
			expect (element ('#header_controls a[href="/xxx/"]').val ()).not ().toBeDefined ();
		}));
				// with visible homepage and login links
			// it should have a title
				// with workspace name in it… ?
			// it may have public texts
				// 0-5
				// do we announce the right number of texts ?
			// it should have a login form
				// with labels
				// with red stars
				// green button
				// forgoten password link
			// it should have a footer
				// with contact link, powered by co-ment logo, help link, languages links

			// we should try the links
			// we should try urls as not logged to check the access avoidance

		it ('should log in', dsl(function () {
			browser.navigateTo ('/');
			input ('#id_username').enter ('siltaar');
			input ('#id_password').enter ('oaueoaue');
			element ('#login input[type=submit]').click ();
			browser.waitForPageLoad ()
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard/m);

		}));
	});
});
