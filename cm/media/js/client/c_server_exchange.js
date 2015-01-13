//frames['text_view_comment_frames'].gtest.myFunc()
var gtest = {
  renaud : 'RENAUD',
  random : Math.random(),
  bernard : 'BERNARD',
  myFunc : function() {
    doExchange("theServerFun", {}, null, this.myRetFunc, this, ['foo', 'bar'])
  },
  myRetFunc : function(args) {
    CY.log('this.renaud : ' + this.renaud) ;
    CY.log('this.random : ' + this.random) ;
    CY.log('arg.returned : ' + args.returned) ;
    CY.log(args.returned) ;
    CY.log('arg.success : ' + args.success) ;
    CY.log(args.success) ;
    //CY.log('arg.success : ' + arg.success) ;
  }
} ;


// clientArgs should be an array
doExchange = function(serverFun, obj, formId, retFunc, clientContext, clientArgs, inCaseErrorMsg) {
  obj['fun'] = serverFun ;
  obj['key'] = sv_key ;
  obj['version_key'] = sv_version_key ;
//  obj['adminKey'] = sv_adminKey ;
  
  var cfg = {
    method: "POST", 
    data: urlEncode(obj), 
//    headers: { 'X-Transaction': 'POST Example'},
    on: {
//      start: gtH.start,
//      complete: gtH.complete,
      success: function(id, oResponse, args){ // args will be {success:clientArgs etc ...
        var ret = {};
        if (oResponse.responseText) 
          ret = CY.JSON.parse(oResponse.responseText);
        
        if (gLayout.isInFrame() && ('msg' in ret))
          parent.f_enqueueMsg(ret['msg']) ; 
          
        args['returned'] = ret ;
        args['successfull'] = true ;
        
        retFunc.call(clientContext, args);
      },
      failure: function(id, oResponse, args){ // args will be {success:clientArgs etc ...
        if (gLayout.isInFrame())
          parent.f_enqueueErrorMsg(gettext('error:') + inCaseErrorMsg) ;
        
        args['successfull'] = false ;
        retFunc.call(clientContext, args);
      }
    },
//    context: gtH,
    arguments: {
//           start: 'foo',
//           complete: 'bar',
           success: clientArgs,
           failure: clientArgs
           }
  } ; 
  if (formId != null)
    cfg['form'] = {'id':formId};
  CY.io(sv_client_url, cfg);
  
} ;

// TODO try to get a stack trace instead of passing an obj 
warn_server = function(obj) {
  obj['fun'] = "warn" ;
  obj['key'] = sv_key ;
  obj['version_key'] = sv_version_key ;

  var obj2 = CY.UA ;

  var cfg = {
    method: "POST", 
    data: urlEncode(CY.merge(obj, obj2))
  } ; 
  CY.io('/client/', cfg);
} ;

