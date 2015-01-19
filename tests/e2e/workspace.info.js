// Config used by travis tests.
// TODO: move away.

define("BROWSERS", ['PhantomJS']);
define("WORKSPACE_URL", 'http://127.0.0.1:8000/');
define("USER_ADMIN", 'admin');
define("PASS_ADMIN", 'dev@co-ment');

function define(name, value) {
  Object.defineProperty(exports, name, {
    value:      value,
    enumerable: true
  });
}

