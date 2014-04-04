// Test helpers for karma-e2e-dsl environment
//	
// https://github.com/winsonwq/karma-e2e-dsl


exports.page_loading = function (url, title) {
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
exports.i18n = function (c, l) {
	test ('to '+c, dsl(function () {
		element ('#footer a[href="/i18n/setlang/'+c+'/"]').click ();
		browser.navigateTo ('/');
		expect (test_.elt ('#footer a[href="/help/"]').text ()).toMatch (new RegExp (l, 'm'));
	}));
}

/** Test if the selected DOM element is defined or has a given value : .val()
 *	s : CSS selector
 *	e : expected value, if omited, test existence
 */
exports.val = function (s, e) {
	e = typeof e == 'undefined' ? '' : e; // .val() returns defined ? '' : undefined; // if no value
	test (s+' is '+e, dsl(function () {
		expect (test_.elt (s).val ()).toMatch (new RegExp (e, 'm'));
	}));
}

exports.exist = function (s) {
	test_.val (s);
}

/** Test if the selected DOM element has the given text : .text()
 *	s : CSS selector
 *	e : expected value
 *	v : should we test a visible value ?
 */
exports.text = function (s, e, v) {
	v = typeof v == 'undefined' ? true : v;
	test (s+' has text '+e, dsl(function () {
		expect (test_.elt (s, v).text ()).toBe (e);
	}));
}

/** Test if the selected DOM element .text() value match the given regexp
 *	s : CSS selector
 *	r : regexp to match
 */
exports.match = function (s, r) {
	test (s+' text match '+r, dsl(function () {
		expect (test_.elt (s).text ()).toMatch (r);
	}));
}

/** Count selector occurences
 *	s : CSS selector
 *	e : expected count
 */
exports.count = function (s, e) {
	test (s+' count is '+e, dsl(function () {
		expect (test_.elt (s).count ()).toBe (e);
	}));
}

/** Test Django form field presence
 */
exports.field = function (form_id, field_id, type, position, label, mandatory) {
	test ('has a '+label+' form field', dsl(function () {
		var s = '';

		switch (type) {
			case 'textarea':s = 'textarea#'+field_id; break;
			case 'select':	s = 'select#'+field_id; break;
			default:		s = 'input#'+field_id+'[type="'+type+'"]';
		}

		expect (test_.elt (s).val ()).toBeDefined ();
		expect (test_.elt ('#'+form_id+' :input:eq('+position+')#'+field_id).val ()).toBeDefined ();
		expect (test_.elt ('label[for='+field_id+']').text ()).toBe (label);

		if (mandatory)
			expect (test_.elt ('label[for='+field_id+'] + span.required_star').val ()).toBeDefined ();
	}));
}

/**
 * Fill form field
 * s : form field id
 * v : array containing the value to use
 */
exports.fill_field = function (s, v) {
	test ('set '+s, dsl(function () {
		input (s).enter (v[s]);
	}));
}

/**
 * Submit a form
 * s : selector of the submit button
 */
exports.submit = function (s) {
	test ('submit '+s, dsl(function () {
		test_.elt (s).click ();
		browser.waitForPageLoad ();
	}));
}

/**
 * Fails a test
 */
exports.fail = function () {
	test ('must fail', dsl(function () {
		throw 'have been programmed to fail now';
	}));
}

/**
 * Inbrowser debugger statement
 */
exports.debug = function () {
	test ('debugger', dsl(function (){
		debugger; // not seen to work
	}));
}

/**
 * Have the browser waiting
 */
exports.pause = function () {
	test ('pause', dsl(function () {
		browser.pause ();
	}));
}

/**
 * Start back the testcases
 */
exports.resume = function () {
	test ('resume', dsl(function (){
		browser.resume ();
	}));
}

/** Ensure the given element is visible
 *	s : CSS selector of the DOM element to check
 *	v : should the element being visible
 */
exports.elt = function (s, v) {
	return element (s + (v ? ':visible' : ''));
}

/** Revive functions after a JSON.stringify which prevented their disappearence
 * k : key in the object to revive functions in
 * v : value
 * 
 * We keep only the string of the body part in order to use it to define a new function in tests files
 * /!\ do NEVER minify this code ! /!\
 *
 */
exports.reviveFunc = multilineString (function (k, v) {
/*!	if (v && typeof v === 'string' && v.substr (0, 8) == 'function') { 
		var a = v.indexOf ('{') + 1, // start function body 
		b = v.lastIndexOf ('}'),	
		c = v.indexOf ('(') + 1,	 // start args 
		d = v.indexOf (')');		
		return new Function (v.substring (c, d), v.substring (a, b)); 
	}

	return v;*/
});

function multilineString (f) { return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, ''); }
