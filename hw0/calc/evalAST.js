env = new Object();

C.evalAST = function(ast) {
    return ev(ast);
  //throw new Error("You're supposed to write your own evaluator and hook it up to this method.");
};


function ev(ast) {
  if (typeof ast === "number") {
    return ast;
  } else {
    var tag = ast[0];
    var args = ast.slice(1);
    return impls[tag].apply(undefined, args);
  }
}

var impls = {
  "set": function(x,y) {
      env[x] = ev(y);
  }

  "id": function(x) {
      if ( env[x] == undefined )
        0
      else
        return env[x];
  }
  "seq": function(x,y) {
      ev(x);
      return ev(y);
  }

  "+": function(x, y) {
    return ev(x) + ev(y);
  },
  "-": function(x, y) {
    return ev(x) - ev(y);
  },
  "*": function(x, y) {
    return ev(x) * ev(y);
  },
  "/": function(x, y) {
    return ev(x) / ev(y);
  }
  "^": function(x, y) {
    return Math.pow( ev(x), ev(y));
  }

};








