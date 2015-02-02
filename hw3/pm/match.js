function match(value /* , pat1, fun1, pat2, fun2, ... */) 
{
  // ...
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


function isBool( x )
{
  return ( x === true) || ( x === false);
};


function isPrimeValue( x )
{
  return isBool(x) || ( typeof x === "number" ) || ( x === null );
};

/*
function tryManyPattern( patValue, exprValue )
{
	if( patValue instanceof Array && exprValue instanceof Array )
	{
	}
	return true;
};
*/

function _() 
{
	return arguments;
};

function many(pat) 
{
	bindings = []

	for( i = 1 ; i < arguments.length ; i++ )
	{
		var matchBindings = matchValues( pat, arguments[i] )
		if( matchBindings.length > 0 )
		{
			bindings.push( matchBindings );
		}
		else
		{
			break;
		}

	}
	return bindings;
};

//f.apply(null,argument array)
function when(f) 
{
	return f;
};


function matchp(p,v,bindings)
{
	if( patValue instanceof Array && exprValue instanceof Array )
	{
		for(i = 0; i < patValue.length; i++)
		{	
			var curPat = patValue[i];
			var curExpr = exprValue.slice(i);

			//matchp( curPat, )
		}
		return bindings;
	}
	else if(typeof pat !== "function") //pattern is constant type
	{
		if( patValue === exprValue )
		{
			return bindings;
		}
		else
		{
			return undefined;
		}
	}
	else
	{
		var res = p(v);
		return res;
	}
};


function matchValues( patValue, exprValue,bindings )
{
  if( patValue === exprValue )
  {
    return true;
  } 
  else if ( typeof patValue === "function")
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
  else if( patValue instanceof Array && exprValue instanceof Array )
  {

	for( i = 0 ; i < patValue.length ; i++ )
	{
		var res = matchValues( patValue[i], exprValue[i],bindings );
		if( !res )
			return false;
	}
	return true;
    
  }

  return false;
};
