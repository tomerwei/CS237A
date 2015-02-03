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


function _() 
{
	return arguments;
};

/*
function many(pat,expr,bindings) 
{
	if( expr.length > 0 )
	{
		for( i = 0 ; i < expr.length ; i++ )
		{
			var res = matchValues( pat, expr, bindings )
			if( res )
			{
				bindings.push( matchBindings );
			}
			else
			{
				return false;
			}
		}
		return true;
	}	
	return false;
};
*/

//match([1,2,3,4])
//  [_,_,_,_] equiv to
// [many([_,_])], function(ps) { ps = [1,2,3,4]}

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
			else if( ((i+1) === patValue.length && exprToMatch.length > 0 ) ||
						((i+1) < patValue.length && exprToMatch.length === 0 ) )
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
	return true;
    
  }

  return false;
};
