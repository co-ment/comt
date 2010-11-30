_changeIds = function(elt, suffix) {
  if (elt.id)
    elt.id =  elt.id + suffix ;
  var c = elt.firstChild ;
  while (c != null) {
    _changeIds(c, suffix) ;
    c = c.nextSibling ; 
  }
} ;

suffix = 0 ;
domDuplicate = function(elt) {
  var newElt = elt.cloneNode(true) ;
  suffix++ ;
  _changeIds(newElt, '-'+suffix) ;
  return newElt ;
} ;

getDuplicated = function(elt) {
  return document.getElementById(elt.id + '-' + suffix) ;
} ;

logSel = function(selection) {
  log('text :' + selection['text'] + ', start id : ' + selection['start']['elt'].id + ' , start offset : ' + selection['start']['offset'] + ' , end id : ' + selection['end']['elt'].id + 'end offset : ' + selection['end']['offset']) ;
} ;

log = function (msg) {
  var log = document.getElementById("log") ;
  log.innerHTML = log.innerHTML + "<li>" + msg + "</li>" ; 
} ;

// from ext
urlEncode = function(o){
    if(!o){
        return "";
    }
    var buf = [];
    for(var key in o){
        var ov = o[key], k = encodeURIComponent(key);
        var type = typeof ov;
        if(type == 'undefined'){
            buf.push(k, "=&");
        }else if(type != "function" && type != "object"){
            buf.push(k, "=", encodeURIComponent(ov), "&");
        }else if(CY.Lang.isArray(ov)){
            if (ov.length) {
                for(var i = 0, len = ov.length; i < len; i++) {
                    buf.push(k, "=", encodeURIComponent(ov[i] === undefined ? '' : ov[i]), "&");
                }
            } else {
                buf.push(k, "=&");
            }
        }
    }
    buf.pop();
    return buf.join("");
};

//from ext
/**
 * Takes an encoded URL and and converts it to an object. e.g. Ext.urlDecode("foo=1&bar=2"); would return {foo: 1, bar: 2} or Ext.urlDecode("foo=1&bar=2&bar=3&bar=4", true); would return {foo: 1, bar: [2, 3, 4]}.
 * @param {String} string
 * @param {Boolean} overwrite (optional) Items of the same name will overwrite previous values instead of creating an an array (Defaults to false).
 * @return {Object} A literal with members
 */
urlDecode = function(string, overwrite){
    if(!string || !string.length){
        return {};
    }
    var obj = {};
    var pairs = string.split('&');
    var pair, name, value;
    for(var i = 0, len = pairs.length; i < len; i++){
        pair = pairs[i].split('=');
        name = decodeURIComponent(pair[0]);
        value = decodeURIComponent(pair[1]);
        if(overwrite !== true){
            if(typeof obj[name] == "undefined"){
                obj[name] = value;
            }else if(typeof obj[name] == "string"){
                obj[name] = [obj[name]];
                obj[name].push(value);
            }else{
                obj[name].push(value);
            }
        }else{
            obj[name] = value;
        }
    }
    return obj;
};


areSortedArraysEqual = function (a1, a2) {
  if (a1.length != a2.length) 
    return false ;
  for (var i = 0, ilen = a1.length ; i < ilen ; i++) {
    if (a1[i] != a2[i])
      return false ;
  }
  return true
} ;

// in place ordering!
quicksort = function (vec) {
  _quicksort(vec, 0, vec.length-1) ;
};

// cf. http://www.4guysfromrolla.com/webtech/012799-1.shtml
_quicksort = function (vec, loBound, hiBound)
/**************************************************************
  This function adapted from the algorithm given in:
    Data Abstractions & Structures Using C++, by
    Mark Headington and David Riley, pg. 586.

  quicksort is the fastest array sorting routine for
  unordered arrays.  Its big O is n log n.
 **************************************************************/
{

  var pivot, loSwap, hiSwap, temp;

  // Two items to sort
  if (hiBound - loBound == 1)
  {
    if (vec[loBound] > vec[hiBound])
    {
      temp = vec[loBound];
      vec[loBound] = vec[hiBound];
      vec[hiBound] = temp;
    }
    return;
  }

  // Three or more items to sort
  pivot = vec[parseInt((loBound + hiBound) / 2)];
  vec[parseInt((loBound + hiBound) / 2)] = vec[loBound];
  vec[loBound] = pivot;
  loSwap = loBound + 1;
  hiSwap = hiBound;

  do {
    // Find the right loSwap
    while (loSwap <= hiSwap && vec[loSwap] <= pivot)
      loSwap++;

    // Find the right hiSwap
    while (vec[hiSwap] > pivot)
      hiSwap--;

    // Swap values if loSwap is less than hiSwap
    if (loSwap < hiSwap)
    {
      temp = vec[loSwap];
      vec[loSwap] = vec[hiSwap];
      vec[hiSwap] = temp;
    }
  } while (loSwap < hiSwap);

  vec[loBound] = vec[hiSwap];
  vec[hiSwap] = pivot;


  // Recursively call function...  the beauty of quicksort

  // 2 or more items in first section   
  if (loBound < hiSwap - 1)
    _quicksort(vec, loBound, hiSwap - 1);


  // 2 or more items in second section
  if (hiSwap + 1 < hiBound)
    _quicksort(vec, hiSwap + 1, hiBound);
} ;
