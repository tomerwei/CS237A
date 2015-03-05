var OO = {};


/*
initialize(), which does nothing.
=== x, which returns true if the receiver and x are the same object, false otherwise.
(This method has the same semantics as JavaScript's === operator.)
!== x, which returns true if the receiver and x are not the same object, false otherwise.
(This method has the same semantics as JavaScript's !== operator.)

Number (a subclass of Object)
isNumber() returns true
+ anotherNumber returns the sum of the receiver and anotherNumber
- anotherNumber
* anotherNumber
/ anotherNumber
% anotherNumber
*/

OO.initializeCT = function()
{
  var classTable = {};
  OO.classTable = classTable;

  var objectClass = {};

  objectClass["super"] = undefined; //object class has no super class
  classTable["Object"] = objectClass;
  objectClass["instVarNames"] = [];
  objectClass["name"] = "Object";
  OO.declareMethod("Object","initialize", function(_this) { } );
  OO.declareMethod("Object","isNumber", function(_this) { return false } );
  OO.declareMethod("Object","===", function(_this, x) { return _this === x } );
  OO.declareMethod("Object","!==", function(_this, x) { return _this !== x } );

  OO.declareClass("Number", "Object", []);
  OO.declareMethod("Number","isNumber", function(_this) { return true } );
  OO.declareMethod("Number", "+", function(_this, that) { return _this + that } );
  OO.declareMethod("Number", "-", function(_this, that) { return _this - that } );
  OO.declareMethod("Number", "*", function(_this, that) { return _this * that } );
  OO.declareMethod("Number", "/", function(_this, that) { return _this / that } );
  OO.declareMethod("Number", "%", function(_this, that) { return _this % that } );
  OO.declareMethod("Number", "<=", function(_this, that) { return _this <= that } );
  OO.declareMethod("Number", ">=", function(_this, that) {return _this >= that } );
  OO.declareMethod("Number", "<", function(_this, that) {return _this < that } );
  OO.declareMethod("Number", ">", function(_this, that) {return _this > that } );

  OO.declareClass("Null", "Object", []);
  OO.declareClass("Boolean", "Object", []);
  OO.declareClass("True", "Boolean", [] );
  OO.declareClass("False", "Boolean", [] );

  OO.declareClass("Block","Object",["body"]);
  OO.declareMethod("Block", 
                    "call", 
                    function(_this) { 
                      console.log( arguments );
                      var args = Array.prototype.slice.call(arguments, 1); 
                      var blkCls = OO.getClass("Block");
                      var b = OO.getInstVar(_this,"body");
                      return b.apply( null, args );
                    } );  
};

/*
declareClass(name, superClassName, instVarNames)
Creates a new class with the appropriate name, superclass, and instance variable names,
and adds that class to the class table. Throws an exception if:
1) The class table already contains a class with the same name (duplicate class declaration).
2) There is no entry in the class table for superClassName (undeclared class).
3) There are duplicates in instVarNames, or one or more elements of instVarNames are also
instance variable names of a (possibly transitive) superclass (duplicate instance variable declaration).
E.g., OO.declareClass("Point", "Object", ["x", "y"])
*/
function checkInstVarNamesHelper( superClassName, instVarNamesArr )
{
  //Check if we reached object class
  if( superClassName === "Object" )
  {
    return true;
  }

  var sprClsInstVarsArr = OO.getClassInstVarNames(superClassName);

  for( var i = 0; i < instVarNamesArr.length ; i++ )
  {
    if( sprClsInstVarsArr.indexOf( instVarNamesArr[i] ) !== -1 )
    {
      return false;
    }
  }

  var sprSprClsName = OO.getSuperClassName( superClassName );
  return checkInstVarNamesHelper( sprSprClsName,instVarNamesArr );
};


function checkInstVarNames ( superClassName, instVarNamesArr )
{
  var tmp = [];

  for( var i = 0; i < instVarNamesArr.length ; i++ )
  {
    if( tmp.indexOf( instVarNamesArr[i] ) === -1 )
    {
      tmp.push( instVarNamesArr[i] );
    }
    else
    {
      return false;
    }
  }

  return checkInstVarNamesHelper( superClassName, instVarNamesArr ) ;
};



OO.declareClass = function ( name, superClassName, instVarNames ) {
  if( OO.getClass(name) === undefined  )
  {
    if( OO.getClass(superClassName) !== undefined )
    {

      var chk = checkInstVarNames( superClassName, instVarNames );
      if( chk )
      {
        var cls      = {}
        var clsTbl   = OO.classTable;
        cls["name"]  = name;
        cls["super"] = superClassName;
        cls["instVarNames"]   = instVarNames;
        clsTbl[name] = cls;
      }
      else
      {
        throw new Error("Duplicate variable names.");
      }

    }
    else
    {
      throw new Error("SuperClass " + superClassName + " not found.");
    }
  }
  else
  {
    throw new Error("Class " + name + " already declared.");
  }
};

/*
OO.declareMethod("Point", "initialize",
  function(_this, x, y) {
    OO.setInstVar(_this, "x", x);
    OO.setInstVar(_this, "y", y);
  }
);

Adds a method named selector to the class named className, whose associated method
implementation is implFn.
The implementation function implFn should have _this as its first argument,
followed by the formal arguments of the method that is being declared.
(When a method is called, _this will be bound to the receiver.)
*/

OO.declareMethod = function(className, selector, implFn) {
	var cls = OO.getClass( className );

  if( cls === undefined )
  {
    throw new Error("Cannot declareMethod, class not found.");
  }

	cls[selector] = implFn;
};


function isExactInstVarNum( argsLen, accInstVarsArrLen, className )
{
  if( className == "Object" )
  {
    return argsLen === accInstVarsArrLen;
  }

  var instVarsArr = OO.getClassInstVarNames( className );
  var instVarArrLen = instVarsArr.length;
  var sprClsName = OO.getSuperClassName( className );

  return isExactInstVarNum( argsLen, accInstVarsArrLen + instVarArrLen, sprClsName );
};


function getRecAllInstVarNum( className )
{
  if( className == "Object" )
  {
    return OO.getClassInstVarNames(className);
  }

  var instVarsArr    = OO.getClassInstVarNames( className );
  var sprClsName     = OO.getSuperClassName( className );
  var sprClsInstVarsArr = getRecAllInstVarNum( sprClsName );

  return sprClsInstVarsArr.concat( instVarsArr );
};


//OO.instantiate = function( className, arg1, arg2 ... )
//OO.instantiate("Point", 1, 2)
OO.instantiate = function( className )
{
  var clsTemplate = OO.getClass( className );

  if( clsTemplate != undefined )
  {
    var cls = Object.create( clsTemplate );

    var instVarsArr = OO.getClassInstVarNames( className );

    //if( arguments.length - 1 === instVarsArr.length )
    var isExactInstVars = isExactInstVarNum( arguments.length - 1, 0, className);
    if( isExactInstVars )
    {
      var allVarsArr = getRecAllInstVarNum( className );

      for ( var i = 1; i < arguments.length; i++ )
      {
        var curVar  = allVarsArr[i-1];
        cls[curVar] = arguments[i];
      }

      return cls;
    }
  }

  throw new Error("Cannot instantiate class.");
};

block_idx = 0;

/*
OO.instantiateBlock = function( blockArgs, blockBody )
{
//blockBody = [s1,s2,s3]
  var blockMethod = [];
  var blockClsName = "Block_" + block_idx;
  var blockBodyWithReturn = [];


  block_idx=block_idx+1;
  OO.declareClass( blockClsName, "Object", [] );

  for( var i = 0; i < blockBody.length ; i++ )
  {
    if( i === blockBody.length - 1 && blockBody[i][0] !== "return" )
    {
      blockBodyWithReturn.push( ["return", blockBody[i] ]);
    }
    else
    {
      blockBodyWithReturn.push( blockBody[i] );
    }
  }

  blockMethod.push( "methodDecl" );
  blockMethod.push( blockClsName );
  blockMethod.push( "call" );
  blockMethod.push( blockArgs );
  blockMethod.push( blockBodyWithReturn );
  //["methodDecl", "Block", "blockMethod", ["x1", "x2", "x3"], [...]]  
  var methodDeclStr =  ev( blockMethod );
  console.log(methodDeclStr);
  eval(methodDeclStr);
  //OO.declareMethod(blockClsName, "call", function(_this, that) {return _this >= that } );

  return OO.instantiate( blockClsName );
};
*/



/*
Looks up the method with the name selector in the class of recv (the receiver of the message),
calls the method with the appropriate arguments, and returns the result of that call.
Throws an exception if recv's class does not have such a method (message not understood).
E.g., OO.send(OO.instantiate("Point", 1, 2), "+", OO.instantiate("Point", 3, 4)) should evaluate to a
new Point whose x and y instance variables are equal to 4 and 6, respectively.

send( OO.instantiate("Point", 1, 2), "+", OO.instantiate("Point", 3, 4) )
*/


function sendHelper( clsName, recv,selector )
{
  var cls = OO.getClass( clsName );

  if( cls.hasOwnProperty(selector) )
  {
    var f   = cls[selector];

    if( f !== undefined )
    {
      var fArgs = [recv];
      if( arguments.length > 3 )
      {
        for( var i = 3 ; i < arguments.length; i++ )
        {
          var cur = arguments[i];
          fArgs.push( cur );
        }
      }
      return f.apply(null, fArgs );
    }
  }
  else
  {
    var superSendArgs = ["Object"];
    for( var i = 1 ; i < arguments.length; i++ )
    {
      var cur = arguments[i];
      superSendArgs.push( cur );
    }
    return OO.superSend.apply(null, superSendArgs );
  }

  throw new Error("OO.send of " + clsName + " failed.");
};


OO.send = function( recv, selector  ) /*arg1,arg2,...*/
{
  var helperArgs = [];

  for( var i = 0 ; i < arguments.length; i++ )
  {
    var cur = arguments[i];
    helperArgs.push( cur );
  }

  if( typeof recv === "number" )
  {
    helperArgs.unshift( "Number" );
    return sendHelper.apply(null, helperArgs ); 
  }
  else if( recv === null )
  {
    helperArgs.unshift( "Null" );
    return sendHelper.apply(null, helperArgs ); 
  }
  else if( recv === true )
  {
    helperArgs.unshift( "True" );
    return sendHelper.apply(null, helperArgs ); 
  }
  else if( recv === false )
  {
    helperArgs.unshift( "False" );
    return sendHelper.apply(null, helperArgs ); 
  }  
  else
  {
    var cls = OO.classOf(recv);

    if( cls !== undefined  )
    {
      var f   = cls[selector];

      if( f !== undefined && cls.hasOwnProperty(selector) )
      {
        var fArgs = [recv];
        if( arguments.length > 2 )
        {
          for( var i = 2 ; i < arguments.length; i++ )
          {
            var cur = arguments[i];
            fArgs.push( cur );
          }
        }
        return f.apply(null, fArgs );
      }
      else
      {
        if( cls.name !== "Object" )
        {
          var superSendArgs = [cls.name];
          for( var i = 0 ; i < arguments.length; i++ )
          {
            var cur = arguments[i];
            superSendArgs.push( cur );
          }
          return OO.superSend.apply(null, superSendArgs );
        }
      }
    }

    throw new Error("OO.send failed.");
  }
};


/*
Looks up the method that corresponds to selector in the class called  superClassName,
calls it with the appropriate arguments, and returns the result of that call.
Throws an exception if:
There is no entry in the class table for superClassName (undeclared class).
The superclass does not have such a method (message not understood).
OO.superSend("Object", myPoint, "initialize")
*/
OO.superSend = function( superClassName, recv, selector ) /*arg1,arg2... */
{
  var cls = OO.getClass( superClassName );
  if( cls !== undefined )
  {
    var f   = cls[selector];
    if( f !== undefined && cls.hasOwnProperty(selector) )
    {
      var fArgs = [recv];
      if( arguments.length > 3 )
      {
        for( var i = 3 ; i < arguments.length; i++ )
        {
          var cur = arguments[i];
          fArgs.push( cur );
        }
      }
      return f.apply(null, fArgs );
    }
    else
    {
      if( superClassName !== "Object" )
      {
        var sprSprClsName = OO.getSuperClassName( superClassName );
        var superSendArgs = [sprSprClsName];
        for( var i = 1 ; i < arguments.length; i++ )
        {
          var cur = arguments[i];
          superSendArgs.push( cur );
        }
        return OO.superSend.apply(null, superSendArgs );
      }
    }
  }
  throw new Error("OO.superSend failed.");

};

/*
getInstVar(recv, instVarName)
Returns the value of the instance variable called instVarName in  recv.
Throws an exception if recv does not have an instance variable with that name (undeclared instance variable).
E.g., OO.getInstVar(myPoint, "x")
*/
OO.getInstVar = function( recv, instVarName )
{
  var cls = OO.classOf( recv );
  if( cls !== undefined )
  {

    var clsVarNamesArr = getRecAllInstVarNum( cls.name );
    if( clsVarNamesArr.indexOf(instVarName) !== -1 )
    {
      return recv[instVarName];
    }
  }
  throw new Error("OO.getInstVar failed.");
};

/*
setInstVar(recv, instVarName, value)
Sets the value of the instance variable called instVarName in recv to  value and returns that value.
Throws an exception if recv does not have an instance variable with that name (undeclared instance variable).
E.g., OO.setInstVar(myPoint, "x", 5)
*/
OO.setInstVar = function( recv, instVarName, value )
{
  var cls = OO.classOf( recv );
  if( cls !== undefined )
  {
    var clsVarNamesArr = cls.instVarNames;
    if( clsVarNamesArr.indexOf(instVarName) !== -1 )
    {
      recv[instVarName] = value;
      return value;
    }
  }
  throw new Error("OO.getInstVar failed.");
};


OO.getSuperClass = function( className )
{
  var cls = OO.getClass( className );
  if( cls !== undefined )
  {
    return cls.super;
  }
  throw new Error("OO.getSuperClass failed.");
};

OO.getClass = function (className) {
  var clsTbl = OO.classTable;
  return clsTbl[className];
};


OO.getClassInstVarNames = function (className) {
  var clsTbl  = OO.classTable;
  var clsObj  = clsTbl[className];
  return clsObj.instVarNames;
//returns array of class variable names
};

//Returns the object that represents the class of the object x.
OO.classOf = function ( classInst ) {
    var clsTbl  = OO.classTable;
  if( typeof classInst === "number" )
  {
    return clsTbl["Number"];
  }
  else if( classInst === null )
  {
    return clsTbl["Null"];  
  }
  else if( classInst === true )
  {
    return clsTbl["True"];
  }
  else if( classInst === false )
  {
    return clsTbl["False"];
  }  
  else
  {
    var clsName = classInst.name;
    return clsTbl[clsName];
  }
  
};

OO.getSuperClassName = function( clsName )
{
  var cls = OO.getClass( clsName );
  return cls.super;
}



function match(value ) /* , pat1, fun1, pat2, fun2, ... */
{
  for ( i = 1; i < arguments.length; i=i+2 ) 
  {
    var p = arguments[i];
    var f = arguments[i+1];
    var bindings = []
    try 
    { 
      var isMatched = matchValues( p, value, bindings );

    if( isMatched )
    {
        return f.apply( null, bindings );
      }
  }
  finally
  {

  }

  }

  throw new Error("match failed");
};


function isOne(x) {
  return typeof x === 'number' && x === 1 ;
};

function isBool( x )
{
  return ( x === true) || ( x === false);
};


function isPrimeValue( x )
{
  return isBool(x) || ( typeof x === "number" ) || ( x === null );
};


function _() 
{
  return arguments;
};


function many(p)
{
  return function manyImpl(exprArray,bindings) 
  {
    var matchBindings = [];
    for( var i = 0 ; i < exprArray.length ; i++ )
    {
      var res = matchValues( p, exprArray[i], matchBindings )
      if( res )
      {
        //bindings.push( matchBindings );
        continue;
      }
      else
      {
        bindings.push( matchBindings );
        return exprArray.slice(i);
      }
    }
    bindings.push( matchBindings );
    return [];
  };
};

function when(f) 
{
  return f;
};


function matchValues( patValue, exprValue,bindings )
{
  if( patValue === exprValue )
  {
    return true;
  } 
  else if ( typeof patValue === "function" && patValue.name !== "manyImpl" )
  {
    if( patValue === _ )
    { 
    bindings.push(exprValue);
    return true;
    }
    else if( patValue.apply(null, [exprValue] ) )
  {
    bindings.push(exprValue);
    return true;
  }
  }
  else if ( typeof patValue === "function" && patValue.name === "manyImpl" )
  {
    throw new Error("Match failed, many can appear only inside arrays");
  }
  else if( patValue instanceof Array && exprValue instanceof Array )
  {

  for( var i = 0 ; i < patValue.length ; i++ )
  {
    var curPat = patValue[i];
    if( typeof curPat === "function" && curPat.name === "manyImpl" )
    {
      var exprToMatch = curPat( exprValue.slice(i), bindings );
      if( (i+1) === patValue.length && exprToMatch.length === 0 )
      {
        return true;
      }
      else if( ((i+1) === patValue.length && exprToMatch.length > 0 ) 
        /* || ((i+1) < patValue.length && exprToMatch.length === 0 ) */ )
      {
        return false 
      }
      else
      {
        return matchValues( patValue.slice(i+1), exprToMatch, bindings );
      }
    }
    else
    {
      var res = matchValues( patValue[i], exprValue[i],bindings );
      if( !res )
        return false;
    } 
  }
  return patValue.length === exprValue.length;
    
  }

  return false;
};


//NLR(nlrId, OO.send(v_x, "+", v_y));
function NLR(id,value) {
   this.id = id;
   this.value = value;
}


// ...
O.transAST = function(ast) {
  //throw new Error("You're supposed to write your own translator and hook it up to this method.");
  return ev(ast,"");
};



/*
Program elements
*/

function programNode() {
  var res = "OO.initializeCT(); ";
  res+= "var nextNlrId = 0;";
  for( var i = 0; i < arguments.length ; i++ )
  {
    var cur = arguments[i];

    if( cur instanceof Array  )
    {
      res+= ev( cur );
    }
    else
    {
      throw new Error("Program failure, member not an AST");
    }
  }
  return res;
};



function methodDecl() {
  var res = "";
  //OO.declareMethod("Object", "add", function(_this, x, y) { return x + y; });
  var methodDeclArgs = [];
  var methodClass    = arguments[0];
  var methodName     = arguments[1];
  var methodArgs     = arguments[2];
  var methodReturn   = arguments[3];

  methodDeclArgs.push( "\"" + methodClass  + "\"" );  //class
  methodDeclArgs.push( "\"" + methodName  + "\"" );  //method

  if( methodArgs.length === 0 )
  {
    methodArgs = "_this";
  }
  else
  {
    methodArgs = "_this, " + methodArgs;
  }

  //user specified methods always return null if nothing else
  var methodReturnWithNull = [];
  if( methodReturn.length === 0 )
  {
    methodReturnWithNull.push( ["return", ["null"] ]);
  }
  else
  {
    for( var i = 0; i < methodReturn.length ; i++ )
    {
      methodReturnWithNull.push( methodReturn[i] );
      if( i === methodReturn.length - 1 && methodReturn[i][0] !== "return" )
      {
        methodReturnWithNull.push( ["return", ["null"] ]);
      }
    }    
  }


  var methodReturnStr = "";

  for( var i = 0 ; i < methodReturnWithNull.length ; i ++ )
  {
    methodReturnStr+= ev( methodReturnWithNull[i] );
  }

  var tryCatch = "try { " + methodReturnStr + "} catch(e) { if (e instanceof NLR && e.id === nlrId) { return e.value; } else throw e; } return _this; ";
   
  var methodReturnStrWithThrow = "var nlrId = nextNlrId++;" + tryCatch ;
  methodDeclArgs.push( "function( " + methodArgs +  " )" + "{ " + methodReturnStrWithThrow + " } "  );
  res += "OO.declareMethod( " + ( methodDeclArgs ) + "); " ;
  return res;
};


function classDecl() {
  //return OO.declareClass.apply(null,args); //["classDecl", "ThreeDeePoint", "Point", ["z"]]
  //declareClass("Point", "Object", ["x", "y"])
  var res = "";
  var className  = arguments[0];
  var classSuper = arguments[1];

  var classArgs  = arguments[2];
  var classArgsStrArr = [];
  for( var i = 0 ; i < classArgs.length ; i++ )
  {
    classArgsStrArr.push( "\"" + classArgs[i] + "\"" );
  }
  var classArgsStr = "[" + classArgsStrArr.join(",") + "]";

  var classDeclArgs = [];
  classDeclArgs.push( "\"" + className +  "\"" );
  classDeclArgs.push( "\"" + classSuper + "\"" );
  classDeclArgs.push( classArgsStr );

  res += "OO.declareClass( " + classDeclArgs + " ); ";
  return res;
};

function newExpr() {
  //["new", C, e1, e2, ...]     //new C(e1, e2, ... )
  //OO.instantiate("Point", 1, 2)
  var res = "";
  var newExprArgs = [];
  var className = arguments[0];
  var classArgsArr = [];

  newExprArgs.push("\"" + className +  "\"" );
  for( var i = 1 ; i < arguments.length ; i++ )
  {
    var curArg = ev( arguments[i] ) ;
    classArgsArr.push( curArg );
  }

  if( classArgsArr.length > 0 )
  {
    newExprArgs.push( classArgsArr.join(", ") );
  }
  else
  {
    //Do nothing
  }

  res += "OO.instantiate(" + newExprArgs + ")"; 
  return res;
};


function sendExpr() { 
//["send",// erecv, m, e1, e2, ...]
//["send", ["getVar", "tb"], "call"]
//add.call( null, 1, 2 )
/*
 ["send",
                 ["block",
                   ["x", "y"],
                   [["exprStmt", ["send",
                                   ["getVar", "x"],
                                   "*",
                                   ["getVar", "y"]]]]],
                 "call",
                 ["number", 6],
                 ["number", 7]]
*/
//if there is call in send, "eat" till the end 
  var res = "";
  var sendArgs = [];
  var recv = ev( arguments[0] ) ;
  var selector = arguments[1];
  sendArgs.push(recv);
  sendArgs.push( "\"" + selector + "\"");
  for( var i = 2; i < arguments.length ; i++ )
  {
    var curArg = ev( arguments[i] );
    sendArgs.push( curArg );
  }
  res += "OO.send( " + ( sendArgs ) + " )"
  //  res += "OO.send.apply( null, " + JSON.stringify( sendArgs ) + " ) "
  return res;
};

function superSendExpr() { 
//OO.send(OO.superSend(OO.classOf(_this).superClassName, _this, "foo"), "+", 41);
//OO.send(OO.send(, "foo"), "+", 41);
//[ m, e1, e2, ...]  super.m(e1, e2, ...)
//superSend(superClassName, recv, selector, arg1, arg2, ...)
//implement superSend as send
  var res = "";
  var superSendArgs = [];
  var selector = arguments[0];  
  var superClassName = "OO.classOf(_this).super";
  var recv = "_this";

  superSendArgs.push(superClassName); //superSendArgs.push(recv);
  superSendArgs.push(recv); 
  superSendArgs.push( "\"" + selector + "\"");
  for( var i = 1; i < arguments.length ; i++ )
  {
    var curArg = ev( arguments[i] );
    superSendArgs.push( curArg );
  }
  res += "OO.superSend( " + ( superSendArgs ) + " )"

  return res;
};


/*
End Program elmentd
*/


function ev(ast) {

  if( ast instanceof Array && ast.length === 0 )
  {
    return ""; //TODO check
  }

  var tag = ast[0];
  if( tag instanceof Array )
  {

    return ev( ast[0] );
  }
  var args = ast.slice(1);

  switch (tag)
  {
    //Declerations
    case "program":
      return programNode.apply( null, args );
    case "classDecl":
      //return OO.declareClass.apply(null,args); //["classDecl", "ThreeDeePoint", "Point", ["z"]]
      //declareClass("Point", "Object", ["x", "y"])
      return classDecl.apply(null,args);


    case "methodDecl":                    //["methodDecl", "C", "m", ["a", "b", "c"], [...]]
      return methodDecl.apply(null,args);

    //Statements
    case "varDecls":       //["varDecls", [x1, e1], [x2, e2] ... ] //var x1 = e1, x2 = e2, ...;
      var res = "";
      for( var i = 0; i < args.length ; i++ )
      {
        var cur = args[i];
        res+= "var " + cur[0] + " = " + ev( cur[1] ) +  " ;";
      }
      return res;

    case "return":     //["return", e]
      var expr = ev( args[0] );
      if( expr[expr.length - 1] === ";" )
      {
        expr = expr.substring(0, expr.length -1 );
      }
      return "throw new NLR(nlrId," + expr +  ");";


    case "setVar":     //["setVar", x, e]
      return "" + args[0] + "= " + ev( args[1] ) + ";";

    case "setInstVar": //["setInstVar", x, e]
      return "_this." + args[0] + " = " + ev( args[1] ) + ";";

    case "exprStmt":   //["exprStmt", e]
      var expr = ev( args[0] );
      return expr + ";";

    //Expressions
    case "null":      //["null"]
      return "null";   
    case "true":      //["true"]
      return "true";     
    case "false":     //["false"]
      return "false";
    case "number":    //["number",42]
    case "getVar":    //["getVar", x]
      return "" + args[0]  ;

    case "getInstVar": //["getInstVar", x] //this.x
      return "_this." + args[0];  
      //OO.getInstVar = function( recv, instVarName )

    case "new":       //["new", C, e1, e2, ...]    
      return newExpr.apply(null,args);

    case "send": //["send", erecv, m, e1, e2, ...]
      return sendExpr.apply(null,args);

    case "super": //["superSend", m, e1, e2, ...]  super.m(e1, e2, ...)
      return superSendExpr.apply(null,args);

    case "this":
      return "_this";


    //Blocks
    case "block":
    //{ x1, x2, ... | s1 s2 ... }
    //["block", [x1, x2, ...], [s1, s2, ...]]
      var res = "";
      var blockArgs = args[0];
      var blockBody = args[1];
      var blockArgsStr = blockArgs;
      var blockBodyWithReturn = [];

      var lastExprPos = -1;
      var firstReturnPos = -1;
      for( var i = 0; i < blockBody.length ; i++ )
      {
        if( blockBody[i][0] === "exprStmt" )
        {
          lastExprPos = i;
        }

        if( firstReturnPos === -1 && blockBody[i][0] === "return" )
        {
          firstReturnPos = i;
        }
      }

      for( var i = 0; i < blockBody.length ; i++ )
      {
        if( i !== lastExprPos )
        {
          blockBodyWithReturn.push( blockBody[i] );
        }
      }

      /*
      if( firstReturnPos === -1 && lastExprPos !== -1 )
      {
        blockBodyWithReturn.push( ["return", blockBody[lastExprPos] ]);
      }
      else if( firstReturnPos === -1 )
      {
        blockBodyWithReturn.push( ["return", ["null"] ] );
      }
      */

      var methodReturnStr = "";
      for( var i = 0 ; i < blockBodyWithReturn.length ; i ++ )
      {
        methodReturnStr+= ev( blockBodyWithReturn[i] );
      }
  

      if( firstReturnPos === -1 && lastExprPos !== -1 )
      {
        methodReturnStr+= "return " + ev( blockBody[lastExprPos] ) + ";" ;
      }
      else if( firstReturnPos === -1 )
      {
        methodReturnStr+= "return null;"
      }


      //var tryCatch = "try { " + methodReturnStr + "} catch(e) { if (e instanceof NLR && e.id === nlrId) { return e.value; } else throw e; } ";
       
      //var methodReturnStrWithThrow = "var nlrId = nextNlrId++;" + tryCatch ;
      var methodReturnStrWithThrow = methodReturnStr;
      var blockFunction = "function(" + blockArgsStr +  ") {" + methodReturnStrWithThrow +  "}" ;
      return  "OO.instantiate(\"Block\"," + blockFunction + ")" ; 

    default:
      throw new Error("Unsupported AST node " + tag );
  } 
  
};



