var C = {};

C.grammar = ohm.namespace('ppls').getGrammar('C');

toAST = C.grammar.semanticAction({
  SeqExpr_seq:         function(x, y)    { return ['seq', toAST(x), toAST(y)]; },
  SetExpr_set:         function(x, _, e) { return ['set', toAST(x)[1], toAST(e)]; },
  AddExpr_plus:        function(x, _, y) { return ['+', toAST(x), toAST(y)]; },
  AddExpr_minus:       function(x, _, y) { return ['-', toAST(x), toAST(y)]; },
  MulExpr_times:       function(x, _, y) { return ['*', toAST(x), toAST(y)]; },
  MulExpr_divide:      function(x, _, y) { return ['/', toAST(x), toAST(y)]; },
  ExpExpr_exp:         function(x, _, y) { return ['^', toAST(x), toAST(y)]; },
  PriExpr_paren:       function(_, e, _) { return toAST(e); },
  number:              function(_)       { return parseFloat(this.interval.contents); },
  ident:               function(_, _)    { return ['id', this.interval.contents]; },
  _terminal: ohm.actions.getValue,
  _list: ohm.actions.map,
  _default: ohm.actions.passThrough
});

C.fromString = function(str) {
  var cst = this.grammar.matchContents(str, 'Exprs', true);
  return toAST(cst);
};

/*
C.evalAST = function(ast) {
  throw new Error("You're supposed to write your own evaluator and hook it up to this method.");
};
*/

env = new Object();

C.evalAST = function(ast) {
    return ev(ast);
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

//only problem is when using variable names x and y -- it is wierd and
//remembers the previous value of the function

var impls = {
  "set": function(x,y) {
      env[x] = ev(y);
  },

  "id": function(x) {
      if ( env[x] == undefined )
        return 0;
      else
        return env[x];
  },
  "seq": function(x,y) {
      ev(x);
      return ev(y);
  },

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
  },
  "^": function(x, y) {
    return Math.pow( ev(x), ev(y));
  }

};











C.eval = function(str) {
  var ast = this.fromString(str);
  return this.evalAST(ast);
};

