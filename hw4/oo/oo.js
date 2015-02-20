var OO = {};
/*
initialize(), which does nothing.
=== x, which returns true if the receiver and x are the same object, false otherwise.
(This method has the same semantics as JavaScript's === operator.)
!== x, which returns true if the receiver and x are not the same object, false otherwise.
(This method has the same semantics as JavaScript's !== operator.)
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
  OO.declareMethod("Object","===", function(_this, x) { return OO.getClass("Object") === x } );
  OO.declareMethod("Object","!==", function(_this, x) { return OO.getClass("Object") === x } );
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
        var cls = {}
        cls["name"]= name;
        cls["super"] = superClassName;
        cls["instVarNames"]   = instVarNames;
        classTable[name] = cls;
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
  throw new Error("Class " + name + " already declared.");

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


//OO.instantiate = function( className, arg1, arg2 ... )
//OO.instantiate("Point", 1, 2)
OO.instantiate = function( className ) 
{
  var cls = OO.getClass( className );

  if( cls != undefined )
  {
    var instVarsArr = OO.getClassInstVarNames( className );

    if( arguments.length - 1 === instVarsArr.length )
    {
      for ( var i = 1; i < arguments.length; i++ ) 
      {
        var curVar  = instVarsArr[i-1];
        cls[curVar] = arguments[i];
      }

      return cls;
    }
  }

  throw new Error("Cannot instantiate class.");
};



/*
Looks up the method with the name selector in the class of recv (the receiver of the message), 
calls the method with the appropriate arguments, and returns the result of that call.
Throws an exception if recv's class does not have such a method (message not understood).
E.g., OO.send(OO.instantiate("Point", 1, 2), "+", OO.instantiate("Point", 3, 4)) should evaluate to a 
new Point whose x and y instance variables are equal to 4 and 6, respectively.

send( OO.instantiate("Point", 1, 2), "+", OO.instantiate("Point", 3, 4) )
*/

OO.send = function( recv, selector  ) /*arg1,arg2,...*/
{
  var cls = OO.classOf(recv);

  if( cls !== undefined )
  {
    var f   = cls[selector]; 

    if( f !== undefined )
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
  } 
  throw new Error("OO.send failed.");
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
  if( recv !== undefined )
  {
    var clsVar = cls[instVarName];
    if( clsVar !== undefined )
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
  if( recv !== undefined )
  {
    var clsVar = cls[instVarName];
    if( clsVar !== undefined )
    {
      recv[instVarName] = value;
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
  var clsName = classInst.name;
  var clsTbl  = OO.classTable;
  return clsTbl.clsName;
};

OO.getSuperClassName = function( clsName )
{
  var cls = OO.getClass( className );
  return clsName.super;
}


