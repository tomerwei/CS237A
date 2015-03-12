// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------


function replaceVar(name,varNamesMap)
{	
	var resName = varNamesMap[name];
	if( resName === undefined )
	{
		resName = name + "_new";
		varNamesMap[name] = resName;
		//Math.random().toString(16).substr(2,6)
	}
	/*
	else
	{
		curIdx++;
	}
	*/ 

	return resName;
};

/*
new Clause(name, args)
name : a string
args : an array of terms (a term is either a Clause or a Var)
The args argument is optional — new Clause(name) is equivalent to  new Clause(name, [])
*/
function replaceClauseNames(clause,varNamesMap)
{
	var resClauseArgs = [];

	for( var i = 0 ; i < clause.args.length ; i++ )
	{
		var arg = clause.args[i];
		if( arg instanceof Var )
		{
			var oldName = arg.name;
			var resName = replaceVar(oldName,varNamesMap);
			resClauseArgs.push( new Var(resName) );
		}
		else if( arg instanceof Clause )
		{
			var resClause = replaceClauseNames( arg,varNamesMap );
			resClauseArgs.push( resClause );
		}
		else
		{
			throw new TODO("replaceClauseNames encoutered term that is not Var or Clause");		
		}
	}

	return new Clause( clause.name, resClauseArgs );
};

//new Rule(c, [c1, c2, ...])
Rule.prototype.makeCopyWithFreshVarNames = function() 
{
	var head = this.head; //head contains one clause
	var body = this.body; //body contains multiple clauses

	var varNamesMap = {};
	var resHead = replaceClauseNames(head,varNamesMap);
	var resBody = [];

	for( var i = 0; i < body.length ;i++ )
	{
		var term = replaceClauseNames( body[i],varNamesMap );
		resBody.push(term);
	}

	return new Rule(resHead,resBody);
//  throw new TODO("Rule.prototype.makeCopyWithFreshVarNames not implemented");
};


Clause.prototype.rewrite = function(subst) {
	var resClauseName = this.name;
	var clauseArgs = this.args;
	var resClauseArgs = [];

	if( subst.bindings[resClauseName] !== undefined )
	{
		return subst.bindings[resClauseName];
	}	

	for( var i = 0; i < clauseArgs.length ; i++ )
	{
		var term = clauseArgs[i];
		var resTerm = term.rewrite(subst);
		resClauseArgs.push( resTerm );
	}

	return new Clause( resClauseName, resClauseArgs );
	//recursiveley travers the clause, extracting var names and clause names
	//after each extraction, if the term name matches, replace that with the binding
	//don't forget to loop over function arguements
};

Var.prototype.rewrite = function(subst) {
	var varName = this.name;
	var bindings = subst.bindings;

	if( subst.bindings[varName] !== undefined )
	{
		return subst.bindings[varName];
	}	
	return this;
};

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
	if( term1 instanceof Var && term2 instanceof Var )
	{
		if( term1.name === term2.name )
		{
			return new Subst();
		}
		else
		{
			return new Subst().bind(term1.name, term2 );
		}
		//TODO probably must add ans2 here
		//var ans1 = new Subst().bind("X", new Var("Y"));
		//var ans2 = new Subst().bind("Y", new Var("X"));
	}
	else if( term1.name === term2.name && term1 instanceof Clause && term2 instanceof Clause )
	{
		var term1Args = term1.args;
		var term2Args = term2.args;

		if( term1Args.length === term2Args.length )
		{
			var res = new Subst();
			var resArgs = [];
			for( var i = 0; i < term1Args.length ; i++ )
			{
				//TODO
				var term1Element = term1Args[i].rewrite(res);
				var term2Element = term2Args[i].rewrite(res);

				var curSubst = new Subst().unify(term1Element,term2Element);
				for( var j in curSubst.bindings)
				{
				  var cur = curSubst.bindings[j];
				  res = res.bind(j,cur);
				}
				//res contains s. s is the bindings from before, we are going to
				//rewrite all term we iterate on with s
				//and than merge previous results of current unification with res
			}
			return res;
		}
		/*
    name: 'unify(Clause, Clause) (3/5)',
    code: 'new Subst().unify(new Clause("foo", [new Var("X")]),\n' +
          '                  new Clause("foo", [new Clause("bar", [new Clause("baz")])]));',
    expected: new Subst().bind("X", new Clause("bar", [new Clause("baz")]))
			*/
		
		//other will throw error
	}

	else if( term1 instanceof Var && term2 instanceof Clause )
	{
		return new Subst().bind(term1.name,term2);	
	}
	else if( term2 instanceof Var && term1 instanceof Clause )
	{
		return new Subst().bind(term2.name,term1);	
	}
	
	//return new Subst().bind("X", new Clause("foo"));
	throw new Error("unification failed")
  	//throw new TODO("Subst.prototype.unify not implemented");
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

Program.prototype.solve = function() {
  throw new TODO("Program.prototype.solve not implemented");
};

