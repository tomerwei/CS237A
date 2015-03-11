/**
Name: Tomer Weiss
UID:  104272138
*/


/*
As Alex mentioned in class recently, the graduate students enrolled in CS237A have one extra 
course requirement.  Specifically, each of you must complete at least one of the extra-credit 
suggestions for at least one of the homework assignments.  When you complete it, post it on 
Piazza as a private note to the instructors.  Include a brief description of your design, 
give instructions to run the code, and provide a set of unit tests that illustrate the behavior.

Brief description: Lazy evalutaion of homework no.1 
Cons -- will continue to evaluate a list till there is a variable, in that case we add a thunk
via delay.

Id

match

if else then

Short-cirtcuit && ||


*/

F.evalAST = function(ast) {
  var env = new Object();
  return ev(ast, env);
};




/*
function arrToCons( l )
{
  var res = null;
  for( i = l.length - 1 ; i >= 0 ; i-- )
  {
    res = ['cons', l[i], thunk(res) ];

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
*/

//['match', exprValue, p1, e1, curPattern, e2, ... ]
//function matchValues( patValue, exprValue , env )
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


function thunk(ast,env)
{
  //doens't evaluate function, just returns closure
  //return ev(["fun", [] , ast], env ); 
  if( isPrimeValue(ast) )
  {
    return ast;
  }
  else if( ast instanceof Array && ast[0] === 'cons' && isPrimeValue( ast[1] ) )
  {
    var tl = ev( ast[2], env );
    return ['cons',ast[1],tl];
  }

  return [ 'delay', ast, Object.create( env ) ]; 
};



function NLR(id) {
   this.id = id;
};


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
        return [ 'delay', args[0], Object.create( env ) ]; 

      case "force":      
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
        //var xs = ev(args[1],env);
        var xs = thunk( args[1], env ); //added lazy cons
        return ['cons',x, xs];

      case "set":
        if ( args[0] in env ) 
        {
          var rhs = ev( args[1], env );
          env[ args[0] ] = rhs;
          return rhs;
        }
        else
          throw new Error("Referenced variable in set op not found in enviornment ");       

      case "seq": //seq changes the enviornment
        var lhs = ev(args[0],env);
        return ev(args[1], env );

      case "listComp":
        throw new Error("listComp Unsupported.");      
      /*
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
      */

      case "match":
      //match is lazy by def.
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
            //['match', exprValue, p1, e1, curPattern, e2, ... ]
            //function matchValues( patValue, exprValue , env )
            var matchRes = matchValues( curPattern, matchExpr, env );
            if( matchRes[0] )
            {
              var matchEnv = Object.create( matchRes[1] );
              var res = ev( curExpr, matchEnv );


              if( res instanceof Array && res[0] === 'cons' )
              {
                var hd = res[1];
                var tl = res[2];
                if( tl instanceof Array && tl[0] === 'delay' )
                {
                  var consTail = ev( tl[1], tl[2] ); //tl[2] is an env
                  return ['cons',hd,consTail];
                }
                else
                {
                  //ev( expr[1], expr[2] ); do nothing?
                }7
                //return ev( ['force',res],env );
              }
              

              return res;
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
        //adding lazy evaluation to or
        var lhs = ev(args[0],env);
        if( isBool(lhs) && lhs )
        {
          return true;
        }
        else
        {
          if( !isBool(lhs ) )
            throw( "Lhs not boolean.");
          var rhs = ev(args[1],env);
          if( !isBool(rhs) )
            throw( "Rhs not boolean.");
          return rhs;
        }

      case "and":
        //adding lazy evaluation to and
        var lhs = ev(args[0],env);
        if( isBool(lhs) && lhs )
        {
          var rhs = ev(args[1],env);
          if( !isBool(rhs) )
            throw( "Rhs not boolean.");
          return rhs;
        }
        else
        {
          if( !isBool(lhs ) )
            throw( "Lhs not boolean.");
          return false;
        }

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
      //lazy evaluation of let x = e1 in e2 
        var originalEnv = Object.create( env );
        try
        {
          var e2 = ev( args[2] ,env);
          console.log( "No need to evaluate " + args[1] )
          return e2;
        }
        catch(e)
        {
          if (e instanceof NLR ) 
          { 
            env = originalEnv;
            var e1 = ev( args[1], env )
            env[ args[0] ] = e1;
            var e2 = ev( args[2] ,env);
            return e2;
          } 
          else throw e; 
        }

      case "id":
        if ( args[0] in env ) 
        {
          var variable = env[ args[0] ];
          if( variable instanceof Array && variable[0] === 'delay' )
          {
            var res = ev( variable[1], variable[2] ); //tl[2] is an env
            env[ args[0] ] = res;
            return res;
          }
          else
          {
            return variable;
          }
        }
        else
          throw new NLR(args[0]); //Variable not in enviornment, see lazy evaluation
      case "fun":
        var funcEnv = Object.create( env );
        return ['closure', args[0] , args[1] , funcEnv ];
      case "call":
         return functionCall( args, env );

      default:
        throw new Error("Unsupported command ");
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

          /*code below is for fixing env in case of set and seq*/
          for (var property in env ) {
            if( funcEnv.hasOwnProperty(property) &&  ( funcArgs.indexOf(property) === -1 )  ) 
            {
                env[property] = funcEnv[property];
            }
          }
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




