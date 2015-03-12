
/* A set of facts about the CS department courses */

prereq(cs31, cs32).   /* 1 */
prereq(cs32, cs33).   /* 2 */
prereq(cs31, cs35L).   /* 3 */
prereq(cs32, cs111).   /* 4 */
prereq(cs33, cs111).   /* 5 */
prereq(cs35L, cs111).   /* 6 */
prereq(cs32, cs118).   /* 7 */
prereq(cs33, cs118).   /* 8 */
prereq(cs35L, cs118).   /* 9 */
prereq(cs111, cs118).   /* 10 */
prereq(cs32, cs131).   /* 11 */
prereq(cs33, cs131).   /* 12 */
prereq(cs35L, cs131).   /* 13 */
prereq(cs32, cs132).   /* 14 */
prereq(cs35L, cs132).   /* 15 */
prereq(cs131, cs132).   /* 16 */
prereq(cs181, cs132).   /* 17 */

prereq2(X,Y) :- prereq(X,Z), prereq(Z,Y).

prereqTrans(X,Y) :- prereq(X,Y).
prereqTrans(X,Y) :- prereq(X,Z), prereqTrans(Z, Y).

/* Datalog is the subset of Prolog where the arguments to
    predicates are always atoms. */

/* Prolog is Datalog + data structures */

/* OCaml:
     type nat = Zero | Succ of nat
     Succ(Succ(Zero))

     Prolog:
     same thing but don't declare the type in advance
     (and lowercase names)
     2 is succ(succ(zero))
*/

plus(zero, N2, N2).
plus(succ(N1), N2, succ(N3)) :- plus(N1, N2, N3).

mult(zero, _, zero).
mult(succ(N1), N2, N3) :- mult(N1, N2, Nm), plus(N2, Nm, N3).

/* another example: lists

    cons(one, cons(two, cons(three, nil)))
*/

len(nil, zero).
len(cons(_, L), succ(N)) :- len(L, N).
