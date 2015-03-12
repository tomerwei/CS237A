p(f(Y)) :- q(Y), r(Y).
q(h(Z)) :- t(Z).
r(h(a)).
t(b).
t(a).

/*

query: p(X).

goal: [p(X)]
      p(X) = p(f(Y)) --> {X : f(Y)}
goal: [q(Y), r(Y)]
      q(Y) = q(h(Z)) --> {X : f(h(Z)), Y : h(Z)}
goal: [t(Z), r(Y)]
      t(Z) = t(b) --> {X : f(h(b)), Y : h(b), Z : b}
goal: [r(Y)]
      r(h(b)) = r(h(a)) --> NO
      BACKTRACK
goal: [t(Z), r(Y)]
      t(Z) = t(a) --> {X : f(h(a)), Y : h(a), Z : a}
goal: [r(Y)]
      r(h(a)) = r(h(a)) --> {X : f(h(a)), Y : h(a), Z : a}
goal: []
      SOLUTION
*/
