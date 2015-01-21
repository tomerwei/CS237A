F.evalAST = function(ast) {
  //throw new TODO("You're supposed to write your own evaluator and hook it up to this method.");
  var env = new Object();
  return ev(ast, env);

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

    switch (tag) {
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
        if( rhs instanceof Array && rhs[0] === 'closure' )
        {
          env = rhs[3];
        }        
        env[ args[0] ] = rhs;
        return ev( args[2] ,env);

      case "id":
        return env[ args[0] ];
      case "fun":
        return ['closure', args[0] , args[1] , env];
      case "call":
         return functionCall( args, env );

      default:
        throw new Error("Unsupported");
    }    
  }
};

function isBool( x )
{
  return ( x === true) || ( x === false);
}

function functionCall(args, env ) {
{
    if( args.length > 0 )
    {
      var funcClosure = ev(args[0],env); 
      if( funcClosure[0] === "closure" )
      {
        var funcEnv = Object.create(env);
        var funcArgs = funcClosure[1]
        var funcBody = funcClosure[2]; 

        if( ( args.length - 1 ) === funcArgs.length )
        {
          for( var i = 0 ; i < funcArgs.length ; i++ )
          {
            var curParam = funcArgs[i];
            //funcEnv[curParam] = args[i+1];
            funcEnv[curParam] = ev( args[i+1], env );

          }

          return ev( funcBody, funcEnv );
        }

      }
    }

    throw new Error("Unsupported");
  }


};




