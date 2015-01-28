F.evalAST = function(ast) {
  //throw new TODO("You're supposed to write your own evaluator and hook it up to this method.");
  var env = new Object();
  return ev(ast, env);

};


function arrToCons( l )
{
  var res = null;
  for( i = l.length - 1 ; i >= 0 ; i-- )
  {
    res = ['cons', l[i], res ];

  }
  return res;
};

function consToArr( acc , l )
{
  if( l !== null )
  {
    acc.push( l[1] );
    return consToArr( acc, l[2] );
  }
  else
  {
    return acc;
  }
};

function matchValues( patValue, exprValue , env )
{
  if( isPrimeValue( patValue ) && isPrimeValue( exprValue ) && patValue === exprValue )
  {
    return [true, env];
  } 
  else if( patValue instanceof Array && patValue[0] === "_" )
  {
    return [true, env ]; 
  }
  else if( patValue instanceof Array && patValue[0] === 'id' )
  {
    var matchEnv = Object.create( env );
    matchEnv[ patValue[1] ] = exprValue;
    return [true, matchEnv ];
  }
  else if( (patValue instanceof Array && patValue[0] === 'cons') &&  
           (exprValue instanceof Array && exprValue[0] === 'cons') )
  {
    /*
  let lst = [1;2::3;4] in
    match lst with
    [1;x::x;y] -> y * 10 + x
    */
    var x  = patValue[1];
    var xs = patValue[2]; 
    var y  = exprValue[1];
    var ys = exprValue[2]; 

    var resHead = matchValues( x, y, env );
    if( resHead[0] )
    {
      var matchEnv = Object.create( resHead[1] );
      var tailHead = matchValues( xs, ys, matchEnv );
      if( tailHead[0] )
      {
        var finalEnv = Object.create( tailHead[1] )
        return [true, finalEnv ];
      }

    }
  }

  return [false,env];
};


//another type -- 
//['state', primVal, env ]

function ev(ast,env) {
  if ( typeof ast === "number" || ast === true ||
      ast === false  || ast ===  null )
  {
    return ast; 
  }
  else
  {
    var tag = ast[0];
    var args = ast.slice(1);

    switch (tag)
    {
      //HW2
      case "delay":

        //return ['delay', args[0] ];
        return [ 'delay', args[0], Object.create( env ) ]; 

      case "force":
      /*
      var expr = args[0];
      if( expr instanceof Array && expr[0] === 'closure' && expr[1].length === 0 )
      {
        return ev( ['call', expr ] , env);
      }
      else
      {
        var res = ev( expr,env);
        if( isPrimeValue( res ) )
        {
          return res;
        }          
        else
        {
          return ev( ['force',res],env );
        }       
      }
      */
      
        var expr = args[0];
        if( expr instanceof Array && expr[0] === 'delay' )
        {
          return ev( expr[1], expr[2] ); //might need to change expr2
        }
        else
        {
          var res = ev( expr,env);
          if( isPrimeValue( res ) )
          {
            return res;
          }
          else
          {
            return ev( ['force',res],env );
          }
        }
      
      case "cons":
        var x = ev(args[0],env);
        var xs = ev(args[1],env);
        return ['cons',x,xs];

      case "set":
        var rhs = ev( args[1], env )

        env[ args[0] ] = rhs;
        return rhs;

      case "seq": //seq changes the enviornment
        var lhs = ev(args[0],env);

        return ev(args[1], env );

      case "listComp":
        var expr  = args[0];
        var xVar  = args[1];
        var eList = args[2];
        var res   = [];
        var ePred = true;
        if( args.length > 3 )
        {
          ePred = args[3];
        }
        var listEnv = Object.create(env);
        
        var consList = ev( eList, listEnv );
        var inputList = consToArr( [] , consList );

        for( i = 0 ; i < inputList.length ; i++ )
        {

          listEnv[xVar] = inputList[i];
          var predCond  = ev( ePred, listEnv );
          if( isBool( predCond ) )
          {
            if( predCond )
            {
              var curRes = ev( expr, listEnv );
              res.push(curRes);
            }
          }
          else
          {
            throw new Error("List Comprehension predicate not boolean");
          }

        }

        return arrToCons( res );

      case "match":
      //['match', e, p1, e1, p2, e2, ... ]
        var matchExpr = ev(args[0],env);
        for( i = 1 ; i < args.length; i=i+2 )
        {
          var curPattern = args[i]
          var curExpr = args[i+1]


          if( curPattern instanceof Array && curPattern[0] === '_' )
          {
            return ev( curExpr,env );
          }
          else
          {
            var matchRes = matchValues( curPattern, matchExpr, env );
            if( matchRes[0] )
            {
              var matchEnv = Object.create( matchRes[1] );
              return ev( curExpr, matchEnv );
            }
          }

        }
        throw new Error("No matching on pattern ");

      //HW1
      case "+":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs + rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case "*":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs * rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case "-":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs - rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case "/":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs / rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case "%":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs % rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case "<":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs < rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case ">":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( typeof lhs === "number" &&  typeof rhs === "number")
          return lhs > rhs;
        else
          throw new Error("Arithmetic operation supports only numbers");

      case "=":
        return ev(args[0],env) === ev(args[1],env);
      case "!=":
        return ev(args[0],env) !== ev(args[1],env);
      case "or":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( isBool(lhs) && isBool( rhs) )
          return lhs || rhs;
        else
          throw new Error("Not boolean");

      case "and":
        var lhs = ev(args[0],env);
        var rhs = ev(args[1],env);
        if( isBool(lhs) && isBool( rhs) )
          return lhs && rhs;
        else
          throw new Error("Not boolean");

      case "if":
        var boolCond = ev(args[0],env);
        if( isBool( boolCond ) )
        {
          if( boolCond)
            return ev(args[1], env );
          else
            return ev(args[2], env );
        }
        else
        {
          throw new Error("if condition not boolean type");
        }

      case "let":
        var rhs = ev( args[1], env )
        env[ args[0] ] = rhs;
        return ev( args[2] ,env);

      case "id":
        return env[ args[0] ];
      case "fun":
        var funcEnv = Object.create( env );
        //var funcEnv = cloneObject( env );
        return ['closure', args[0] , args[1] , funcEnv ];
      case "call":
         return functionCall( args, env );

      default:
        throw new Error("Unsupported command");
    }
  }
};


function isBool( x )
{
  return ( x === true) || ( x === false);
};


function isPrimeValue( x )
{
  return isBool(x) || ( typeof x === "number" ) || ( x === null );
};


function functionCall(args, env )
{
    if( args.length > 0 )
    {
      var funcClosure = ev(args[0], env );
      if( funcClosure[0] === "closure" )
      {
        var funcArgs = funcClosure[1];
        var funcBody = funcClosure[2];
        var funcEnv  = Object.create( funcClosure[3] );

        if( ( args.length - 1 ) === funcArgs.length )
        {
          for( var i = 1 ; i < args.length ; i++ )
          {
            var curParam = funcArgs[i-1];
            funcEnv[curParam] = ev( args[i], env );
          }

          var res = ev( funcBody, funcEnv );

          return res;
        }
        else if( ( args.length - 1 ) < funcArgs.length )
        {
          for( var i = 1 ; i < args.length ; i++ )
          {
            var curParam = funcArgs[i-1];
            funcEnv[curParam] = ev( args[i], env );
          }
          return ['closure', funcArgs.slice( args.length - 1 ), funcBody, funcEnv];
        }

      }
    }

    throw new Error("Unsupported function call");
};




