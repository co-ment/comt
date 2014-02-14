
define ("WORKSPACE_URL", 'http://192.168.2.61:8000/');
define ("USER_ADMIN", 'siltaar');
define ("PASS_ADMIN", 'oaueoaue');

// TODO: decide wether we should populate workspaces with standard users or
// create them on the fly ?

define ("USER_EDIT", '');
define ("PASS_EDIT", '');

define ("USER_COM", '');
define ("PASS_COM", '');

define ("USER_OBSERV", '');
define ("PASS_OBSERV", '');

function define (name, value) {
    Object.defineProperty (exports, name, {
        value:      value,
        enumerable: true
    });
}

