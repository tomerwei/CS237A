/*
Name: Tomer Weiss
UID:  104272138
*/

function match(value /* , pat1, fun1, pat2, fun2, ... */) 
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
