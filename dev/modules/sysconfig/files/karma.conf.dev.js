// Karma configuration
// Generated on Wed Jan 29 2014 15:32:16 GMT+0100 (CET)


// SID: get WORKSPACE_URL configuration from one single file to customize
var W = require ('./workspace.info.dev.js');

module.exports = function(config) {
	config.set({
		// list of files or patterns to load in the browser, from current directory
		files: [
			{pattern: 'tests/**/*.js', included: true}
		],
		// list of files to exclude
		exclude: [ ],
		// Start these browsers, currently available:
		// - Firefox	; Safari	(only Mac; run `npm install karma-safari-launcher` first)
		// - Chrome		; ChromeCanary ; Opera (run `npm install karma-opera-launcher` first)
		// - PhantomJS	; IE		(only Windows; run `npm install karma-ie-launcher` first)
		browsers: W.BROWSERS,
		// frameworks to use. SID: choosen mocha, added karma-e2e-dsl (end-to-end testing)
		frameworks: ['mocha', 'karma-e2e-dsl'],
		// SID: Karma will start and run somewhere else than '/', to allow proxying '/'
		urlRoot: '/karma/',
		// SID: directive added on karma-e2e-dsl purpose. Map of path-proxy pairs.
		proxies: {
			'/': W.WORKSPACE_URL
		},
		client: {
			mocha: {
				ui: 'tdd'
			},
			W: W // SID: exports the variable in the test execution browser window
		},
		// test results reporter to use : 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['progress'],
		// web server port
		port: 9876,
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// level of logging : config.LOG_DISABLE || _ERROR || _WARN || _INFO || _DEBUG
		logLevel: config.LOG_INFO,
		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 20000,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,
		// Continuous Integration mode : if true, it capture browsers, run tests and exit
		singleRun: true,
		browserNoActivityTimeout: 100000,
	});
};
