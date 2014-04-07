// Test helpers for karma-e2e-dsl environment
//	
// https://github.com/winsonwq/karma-e2e-dsl


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

/** Test if the selected DOM element is defined or has a given value : .val()
 *	s : CSS selector
 *	e : expected value, if omited, test existence
 */
function test_val (s, e) {
	e = typeof e == 'undefined' ? '' : e; // .val() returns defined ? '' : undefined; // if no value
	test (s+' is '+e, dsl(function () {
		expect (elt (s).val ()).toMatch (new RegExp (e, 'm'));
	}));
}

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

/** Test if the selected DOM element .text() value match the given regexp
 *	s : CSS selector
 *	r : regexp to match
 */
function test_match (s, r) {
	test (s+' text match '+r, dsl(function () {
		expect (elt (s).text ()).toMatch (r);
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
 * Click somewhere
 * s : selector of the item to click on
 */
function test_click (s) {
    test ('click '+s, dsl(function () {
        elt (s).click ();
    }));
}

/**
 * Submit a form
 * s : selector of the submit button
 */
function test_submit (s) {
	test ('submit '+s, dsl(function () {
		elt (s).click ();
		browser.waitForPageLoad ();
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

