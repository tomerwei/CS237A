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
	}

	else if( term1 instanceof Var && term2 instanceof Clause )
	{
		return new Subst().bind(term1.name,term2);	
	}
	else if( term2 instanceof Var && term1 instanceof Clause )
	{
		return new Subst().bind(term2.name,term1);	
	}
	
	throw new Error("unification failed");
};

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------



function shiftWithoutMutation(arr)
{
	var res = [];
	for( var i = 1; i < arr.length ; i++ )
	{
		res.push( arr[i]);
	}	
	return res;
};

/*
This will require you to maintain some state to represent the current point in your search, 
so that a call to next() can pick up where the previous call left off, including accounting 
for the need to backtrack. Hint: Aren't lexically scoped closures awesome?
*/
//idea: use external variable res to keep track of position, next solution


/*
Let's write CPS manually
It is forbidden to use return explicitely
The last parameter of a function is always its continuation
Every function must end calling its continuation with the result of its computation

function callcc (f,cc) { 
  f(function(x,k) { cc(x) },cc)
}


*/


Program.prototype.solve = function() 
{

	var result = [];
	var stateRule = 0;
	var stateQuery = 0;

	function solveContinuation( program ,ret) {
		var rules = program.rules;
		var query = program.query;

		if( query.length <= stateQuery )
		{
			ret( new Subst() );
		}
		else
		{
			if( rules.length <= stateRule  )
			{
				ret(  );
			}
			else
			{

				//let us assume query[stateQuery].body is true.
				//twe shall evaluate q.head
				
				var q = query[stateQuery];
				var r = rules[stateRule].makeCopyWithFreshVarNames();
				//var res = [];

				try
				{
					var cur = new Subst().unify( r.head , q ); 
					//res.push(curSubst.bindings);
					stateRule++;
					ret( cur.bindings );

					//var nextRules = shiftWithoutMutation( rules );
					//solveContinuation( new Program( nextRules, query) , ret);
					//var tailResIterator = new Program( nextRules, query ).solve();
					//return makeIterator.apply( null, res );
									

				}
				catch(e)
				{
					throw e;
					//unification failed, continue
				}

				/*
				return makeIterator( curSubst, new Program.solve( nextRules, nextQuery ));
				var nextQuery = query.shift();
				return makeIterator( new Program.solve( nextRules, nextQuery ));
				*/
			}

		}



	};


	solveContinuation( this, function (cc) { 
  		//return makeIterator(n) ; 
  		result.push(cc);
  		//result = result.concat( cc )
	});

	return makeIterator.apply(null,result);
};






