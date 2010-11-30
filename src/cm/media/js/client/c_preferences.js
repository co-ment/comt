// manages user preferences through cookies


// globals used: gConf
// YUI3 used: cookie

Preferences = function() {
  this.prefs = {} ;  
}

Preferences.prototype = {
  init : function() {
    this._read() ;
  },
  //read user preferences from cookie
  _read : function() {
    for (var key1 in gConf['defaultPrefs']) {
      
      this.prefs[key1] = {} ;
      
      for (var key2 in gConf['defaultPrefs'][key1]) {

        var val = null ;
        if (key1 == 'user' && (key2 == 'name' || key2 == 'email'))
          val = CY.Cookie.get("user_" + key2);
        else 
          val = CY.Cookie.getSub(key1, key2);
        this.prefs[key1][key2] = (val == null) ? gConf['defaultPrefs'][key1][key2] : val ;
      }
    }
  },
  // to be used only on values in gDefaultPrefs
  persist : function(key1, key2, val) {
    var cookieOptions = {path:"/", expires:(new Date()).setFullYear(2100,0,1)} ;
    
    if (key1 == 'user' && (key2 == 'name' || key2 == 'email')) // special case want to get that from cookie set up by python code
      CY.Cookie.set("user_" + key2, val, cookieOptions);
    else 
      CY.Cookie.setSub(key1, key2, val, cookieOptions);
    this.prefs[key1][key2] = val ;
  },
  get : function(key1, key2) {
    return this.prefs[key1][key2] ;
  },
  readDefault : function(key1, key2) {
    return gConf['defaultPrefs'][key1][key2] ;
  },
  reset : function(entries) {
    for (var i = 0; i < entries.length ; i++) {
      var key1 = entries[i] ;
      for (var key2 in gConf['defaultPrefs'][key1]) {
        this.persist(key1, key2, gConf['defaultPrefs'][key1][key2]) ;
      }
    }
  }
}
