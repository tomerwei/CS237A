F.evalAST = function(ast) {
  //throw new TODO("You're supposed to write your own evaluator and hook it up to this method.");
  var env = new Object();
  return ev(ast, env);

};

function ev(ast,env) {
  if (typeof ast === "number" || typeof ast === "PriExpr_null" ||
      typeof ast === "PriExpr_true" || typeof ast === "PriExpr_false") {
    return ast;
  }
  else
  {
    var tag = ast[0];
    var args = ast.slice(1).push(env);
    return impls[tag].apply(undefined, args );
  }
};

var impls = {
  "fun": function(x,e,env) {
    return ['closure', x ,  e, env];
  },

  "call": function() {
    if( arguments.length > 0 )
    {
      funcClosure = ev(arguments[0]);
      if( funcClosure[0] === "closure" )
      {
        funcArgsLen = funcClosure[1]
        var env = arguements[ arguements.length - 1 ];
        if( ( arguments.length - 2 ) === funcClosure[1].length )
        {
          for( var i = 0 ; i < funcClosure[1].length ; i++ )
          {
            funcParams = funcClosure[3];
            funcEnv = Object.create(env);
            curParam = funcParams[i];
            funcEnv[curParam] = arguments[i+1];
            funcBody = funcClosure[3];
            return ev( funcBody,funcEnv );
          }
        }
      }
    }

    throw new Error("unsupported");
  },

  "if": function(x,y,z,env) {
    boolCond = ev(x,env);
    if(boolCond)
      return ev(y, env );
    else
      return ev(z, env );
  },

  "let": function(x,e1,e2,env) {
      env[x] = ev(e1);
      return ev(e2,env);

  },

  "id": function(x,env) {
      if ( env[x] == undefined )
        return 0;
      else
        return env[x];
  },
  "seq": function(x,y,env) {
      ev(x,env);
      return ev(y,env);
  },

  "+": function(x, y,env ) {
    return ev(x,env) + evalAST(y,env);
  },
  "-": function(x, y,env) {
    return ev(x,env) - ev(y,env);
  },
  "*": function(x, y,env) {
    return ev(x,env) * ev(y,env);
  },
  "/": function(x, y, env) {
    return ev(x,env) / ev(y,env);
  },
  "^": function(x, y, env) {
    return Math.pow( ev(x,env), ev(y,env));
  },

  "%": function(x,y, env) {
    return ev(x,env) % ev(y,env);
  },

  "=": function(x,y, env) {
      return ev(x,env) === ev(y,env);
  },

  "!=": function(x,y, env)  {
    return ev(x,env) !== ev(y,env);
  },

  "<": function(x,y, env) {
      return ev(x,env) < ev(y,env);
  },

  ">": function(x,y, env) {
      return ev(x,env) > ev(y,env);
  },

  "&&": function(x,y, env) {
      return ev(x,env) && ev(y,env);
  },

  "||": function(x,y, env) {
      return ev(x,env) || ev(y,env);
  }

};



