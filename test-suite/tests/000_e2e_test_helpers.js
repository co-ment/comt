// Test helpers for karma-e2e-dsl environment
//	
// https://github.com/winsonwq/karma-e2e-dsl
//
// " Vim settings
// set tabstop=4          " number of spaces in a tab
// set softtabstop=4      " as above
// set shiftwidth=4       " as above


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

/** Test if it's possible to change lang to the specified :
 *	c : lang code
 *	l : help label
 */
function test_i18n (c, l) {
	test ('to '+c, dsl(function () {
		element ('#footer a[href="/i18n/setlang/'+c+'/"]').click ();
		browser.navigateTo ('/');
		expect (elt ('#footer a[href="/help/"]').text ()).toMatch (new RegExp (l, 'm'));
	}));
}

/** Test if the selected DOM element .text() value match the given regexp
 *	s : CSS selector
 *	r : regexp to match
 */
function test_match (s, r) {
	test (s+' text match '+r, dsl(function () {
		expect (elt (s).text ()).toMatch (r);
	}));
}

/** Test if the selected DOM element has a given value : .val()
 *	s : CSS selector
 *	e : expected value, if omited, test existence
 */
function test_val (s, e) {
	e = typeof e == 'undefined' ? '' : e; // .val() returns defined ? '' : undefined; // if no value
	test (s+' is '+e, dsl(function () {
		expect (elt (s).val ()).toMatch (new RegExp (e, 'm'));
	}));
}

/**
 *
 */
function test_exist (s) {
	test_val (s);
}

/** Test if the selected DOM element has the given text : .text()
 *	s : CSS selector
 *	e : expected value
 *	v : should we test a visible value ?
 */
function test_text (s, e, v) {
	v = typeof v == 'undefined' ? true : v;
	test (s+' has text '+e, dsl(function () {
		expect (elt (s, v).text ()).toBe (e);
	}));
}

/** Count selector occurences
 *	s : CSS selector
 *	e : expected count
 */
function test_count (s, e) {
	test (s+' count is '+e, dsl(function () {
		expect (elt (s).count ()).toBe (e);
	}));
}

/** Test Django form field presence
 */
function test_field (form_id, field_id, type, position, label, mandatory) {
	test ('has a '+label+' form field', dsl(function () {
		var s = '';

		switch (type) {
			case 'textarea':s = 'textarea#'+field_id; break;
			case 'select':	s = 'select#'+field_id; break;
			default:		s = 'input#'+field_id+'[type="'+type+'"]';
		}

		expect (elt (s).val ()).toBeDefined ();
		expect (elt ('#'+form_id+' :input:eq('+position+')#'+field_id).val ()).toBeDefined ();
		expect (elt ('label[for='+field_id+']').text ()).toBe (label);

		if (mandatory)
			expect (elt ('label[for='+field_id+'] + span.required_star').val ()).toBeDefined ();
	}));
}

/**
 * Fill form field
 * s : form field id
 * v : array containing the value to use
 */
function test_fill_field (s, v) {
	test ('set '+s, dsl(function () {
		input (s).enter (v[s]);
	}));
}

/**
 * Click on something
 * s : selector of the item to click on
 * w : should we wait for a page to load in the browser after the click
 * v : is the element visible or not
 */
function test_click (s, w, v) {
	var t = 'click '+ w ? 'to submit form ' : '';
	test (t+s, dsl(function () {
		elt (s, v).click ();
		if (w)
			browser.waitForPageLoad ();
	}));
}

/**
 * Send submit event to the given form
 * s : selector of the form to submit
 */
function test_submit (s) {
	test ('send submit event to '+s, dsl(function () {
		elt (s).submit ();
		browser.waitForPageLoad ();
	}));
}


/**
 * Reload a page
 */
function test_reload () {
	test ('reload current page', dsl(function () {
		browser.reload ();
	}));
}

/**
 * Fails a test
 */
function test_fail () {
	test ('must fail', dsl(function () {
		throw 'have been programmed to fail now';
	}));
}

/**
 * Have the browser waiting while you inspect what's going on
 */
function test_pause () {
	test ('pause', dsl(function () {
		browser.pause ();
	}));
}

/**
 * Start back the testcases
 */
function test_resume () {
	test ('resume', dsl(function (){
		browser.resume ();
	}));
}

/** Ensure the given element is visible
 *	s : CSS selector of the DOM element to check
 *	v : should the element being visible
 */
function elt (s, v) {
	return element (s + (v ? ':visible' : ''));
}

