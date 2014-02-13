
// console.log ('args '+args);

describe ('comt', function () {

	this.timeout(150000);

	describe ('connexion', function () {
		it ('should load login page', dsl(function () {
			// here we are in Karma page
			browser.navigateTo ('/');

			/*element ('title').text (function (page_title) {
				// here we got a value from the test iframe
				if (typeof page_title != 'string') throw 'page_title not a string, network problem ?';
				if (!/(Accueil|Home) - Workspace/.test (page_title)) throw 'got page '+page_title+' instead';
			});*/

			expect (element ('title').text ()).toBeDefined ();
			expect (element ('title').text ()).toMatch (/Home - Workspace/);

			// it should have a header
				// with visible homepage and login links
			// it should have a title
				// with workspace name in it… ?
			// it may have public texts
				// how many max ?
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

		}));
		it ('should log in', dsl(function () {
			browser.navigateTo ('/');
			input ('#id_username').enter ('siltaar');
			input ('#id_password').enter ('oaueoaue');
			element ('#login input[type=submit]').click ();
			browser.waitForPageLoad ()
			browser.navigateTo ('/');
			expect (element ('title').text ()).toMatch (/Dashboard\n - Workspace/m);

		}));
	});
});
