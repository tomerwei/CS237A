function match(value /* , pat1, fun1, pat2, fun2, ... */) 
{
  // ...
  for ( i = 1; i < arguments.length; i=i+2 ) 
  {
  	var curPat = arguments[i];
  	var curFun = arguments[i+1];

    var bindings = matchValues( curPat, value );
    if( bindings !== undefined )
    {	
    	if( bindings instanceof Array )
    	{
	    	return curFun.apply( null, bindings );
	    }
	    else
	    {
	    	return curFun.apply( null, [bindings] );
	    }
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

function _ () 
{
	return arguments;
}ß

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
}

//f.apply(null,argument array)
//
function when(f) 
{
	return f;
}


function matchValues( patValue, exprValue )
{
  var bindings = []

  if( patValue === exprValue )
  {
    return [];
  } 
  else if ( typeof patValue === "function")
  {
  	if( patValue === _ )
  	{	
  		return exprValue;
  	}
  	else if( patValue.apply(null, [exprValue] ) )
	{
		return exprValue;
	}
  }
  else if( patValue instanceof Array && exprValue instanceof Array )
  {

	for( i = 0 ; i < patValue.length ; i ++ )
	{

		var curPat = patValue[i];
		var curExpr = exprValue.slice(i);
		var isManyPattern = curPat.apply( null, curExpr );
		if( isManyPattern )
		{
			var tryManyPattern = curPat( exprValue.slice(i) )
			if( tryManyPattern.length > 0 )
			{
				bindings.push( tryManyPattern );
			}
			else
			{
				return undefined;
			}

		}
		else
		{
    		var matchBindings = matchValues( curPat, exprValue[i] )
    		if( matchBindings === undefined )
    		{
    			return undefined;
    		}
    		else if( matchBindings instanceof Array && matchBindings.length === 0  )
    		{
    			continue;
    		}
    		else
    		{
      			bindings.push( matchBindings );
    		}    			
		}


	}
	return bindings;
    
  }

  return undefined;
};
