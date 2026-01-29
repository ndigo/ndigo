/**
 * @author Jeff Rose
 * @module function
 */
import { F, T, __, addIndex, addIndexRight, always, andThen, ap, apply, applySpec, applyTo, ascend, ascendNatural, binary, bind, call, comparator, compose, composeWith, construct, constructN, converge, curry, curryN, descend, descendNatural, empty, flip, identity, invoker, juxt, lift, liftN, memoizeWith, nAry, nthArg, o, of, once, otherwise, partial, partialRight, pipe, pipeWith, tap, thunkify, tryCatch, unapply, unary, uncurryN, useWith, } from 'ramda';
/**
 * A function that always returns `false`. Any passed in parameters are ignored.
 *
 * @category Function
 * @returns {boolean} False
 * @example
 * F();
 * //=> false
 */
export { F };
/**
 * A function that always returns `true`. Any passed in parameters are ignored.
 *
 * @category Function
 * @returns {boolean} True
 * @example
 * T();
 * //=> true
 */
export { T };
/**
 * A special placeholder value used to specify "gaps" within curried functions,
 * allowing partial application of any combination of arguments, regardless of
 * their positions.
 *
 * If `g` is a curried ternary function the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(__, 2, 3)(1)`
 *   - `g(__, __, 3)(1)(2)`
 *   - `g(__, __, 3)(1, 2)`
 *   - `g(__, 2, __)(1, 3)`
 *   - `g(__, 2)(1)(3)`
 *   - `g(__, 2)(1, 3)`
 *   - `g(__, 2)(__, 3)(1)`
 *
 * @constant module:util.__
 * @category Function
 * @example
 * import { __, replace } from '@blue/util';
 * const greet = replace( '{name}', __, 'Hello, {name}!' );
 * greet( 'Alice' );
 * //=> 'Hello, Alice!'
 */
export { __ };
/**
 * Creates a new list iteration function from an existing one by adding two new
 * parameters to its callback function: the current index, and the entire list.
 *
 * This would turn, for instance, [`map`](#map) function into one that
 * more closely resembles `Array.prototype.map`. Note that this will only work
 * for functions in which the iteration callback function is the first
 * parameter, and where the list is the last parameter. (This latter might be
 * unimportant if the list parameter is not used.)
 *
 * @category Function
 * @category List
 * @param {function} fn A list iteration function that does not pass index or list to its callback
 * @returns {function} An altered list iteration function that passes (item, index, list) to its callback
 * @example
 * import { addIndex, map } from '@blue/util';
 * const indexedMap = addIndex( map );
 * indexedMap( ( val, idx ) => idx + '-' + val, [ 'f', 'o', 'o', 'b', 'a', 'r' ] );
 * //=> [ '0-f', '1-o', '2-o', '3-b', '4-a', '5-r' ]
 */
export { addIndex };
/**
 * As with `addIndex`, `addIndexRight` creates a new list iteration function from an existing one by adding two new
 * parameters to its callback function: the current index, and the entire list.
 *
 * Unlike `addIndex`, `addIndexRight` iterates from the right to the left.
 *
 * @category Function
 * @category List
 * @param {function} fn A list iteration function that does not pass index or list to its callback
 * @returns {function} An altered list iteration function that passes (item, index, list) to its callback
 * @example
 * import { addIndexRight, map, reverse } from '@blue/util';
 * const revmap = (fn, ary) => map(fn, reverse(ary));
 * const revmapIndexed = addIndexRight(revmap);
 * revmapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
 * //=> [ '5-r', '4-a', '3-b', '2-o', '1-o', '0-f' ]
 */
export { addIndexRight };
/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @category Function
 * @param {*} val The value to wrap in a function
 * @returns {function} A Function :: * -> val.
 * @example
 * const t = always( 'Tee' );
 * t();
 * //=> 'Tee'
 */
export { always };
/**
 * Returns the result of applying the onSuccess function to the value inside
 * a successfully resolved promise. This is useful for working with promises
 * inside function compositions.
 *
 * @category Function
 * @param {function} onSuccess The function to apply. Can return a value or a promise of a value.
 * @param {Promise} p
 * @returns {Promise} The result of calling `p.andThen(onSuccess)`
 * @see {@link otherwise|otherwise}
 * @example
 * import { pick, pipe, andThen } from '@blue/util';
 * const makeQuery = ( email ) => ( { query: { email } } );
 *
 * //getMemberName :: String -> Promise ({firstName, lastName})
 * const getMemberName = pipe(
 *  makeQuery,
 *  fetchMember,
 *  andThen( pick( [ 'firstName', 'lastName' ] ) )
 * );
 */
export { andThen };
/**
 * ap applies a list of functions to a list of values.
 *
 * Dispatches to the `ap` method of the second argument, if present. Also
 * treats curried functions as applicatives.
 *
 * @category Function
 * @param {*} applyF
 * @param {*} applyX
 * @returns {*}
 * @example
 * import { add, ap, concat, multiply, toUpper } from '@blue/util';
 * ap( [ multiply( 2 ), add( 3 ) ], [ 1, 2 , 3 ] ); //=> [ 2, 4, 6, 4, 5, 6 ]
 * ap( [ concat( 'tasty ' ), toUpper ], [ 'pizza', 'salad' ] ); //=> [ "tasty pizza", "tasty salad", "PIZZA", "SALAD" ]
 * // ap can also be used as S combinator
 * // when only two functions are passed
 * ap( concat, toUpper )( 'Ramda' ) //=> 'RamdaRAMDA'
 */
export { ap };
/**
 * Applies function `fn` to the argument list `args`. This is useful for
 * creating a fixed-arity function from a variadic function. `fn` should be a
 * bound function if context is significant.
 *
 * @category Function
 * @param {function} fn The function which will be called with `args`
 * @param {Array} args The arguments to call `fn` with
 * @returns {*} result The result, equivalent to `fn(...args)`
 * @see {@link call|call}
 * @see {@link unapply|unapply}
 * @example
 * const nums = [ 1, 2, 3, -99, 42, 6, 7 ];
 * apply( Math.max, nums );
 * //=> 42
 */
export { apply };
/**
 * Given a spec object recursively mapping properties to functions, creates a
 * function producing an object of the same structure, by mapping each property
 * to the result of calling its associated function with the supplied arguments.
 *
 * @category Function
 * @param {Object} spec an object recursively mapping properties to functions for producing the values for these properties.
 * @returns {function} A function that returns an object of the same structure as `spec', with each property set to the value returned by calling its associated function with the supplied arguments.
 * @see {@link converge|converge}
 * @see {@link juxt|juxt}
 * @example
 * import { add, applySpec, multiply } from '@blue/util';
 * const getMetrics = applySpec( {
 *  sum: add,
 *  nested: { mul: multiply }
 * } );
 * getMetrics( 2, 4 );
 * //=> { sum: 6, nested: { mul: 8 } }
 */
export { applySpec };
/**
 * Takes a value and applies a function to it.
 *
 * This function is also known as the `thrush` combinator.
 *
 * @category Function
 * @param {*} x The value
 * @param {function} f The function to apply
 * @returns {*} The result of applying `f` to `x`
 * @example
 * import { add, applyTo, identity } from '@blue/util';
 * const t42 = applyTo( 42 );
 * t42( identity );
 * //=> 42
 * t42( add( 1 ) );
 * //=> 43
 */
export { applyTo };
/**
 * Makes an ascending comparator function out of a function that returns a value
 * that can be compared with `<` and `>`.
 *
 * @category Function
 * @param {function} fn A function of arity one that returns a value that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @returns {number} `-1` if fn(a) < fn(b), `1` if fn(b) < fn(a), otherwise `0`
 * @see {@link descend|descend}
 * @example
 * import { ascend, prop, sort } from '@blue/util';
 * const byAge = ascend( prop( 'age' ) );
 * const people = [
 *  { name: 'Emma', age: 70 },
 *  { name: 'Peter', age: 78 },
 *  { name: 'Mikhail', age: 62 },
 * ];
 * const peopleByYoungestFirst = sort( byAge, people );
 * //=> [ { name: 'Mikhail', age: 62 }, { name: 'Emma', age: 70 }, { name: 'Peter', age: 78 } ]
 */
export { ascend };
/**
 * Makes an ascending comparator function out of a function that returns a value
 * that can be compared with natural sorting using localeCompare.
 *
 * @category Function
 * @param {string} locales A string with a BCP 47 language tag, or an array of such strings. Corresponds to the locales parameter of the Intl.Collator() constructor.
 * @param {function} fn A function of arity one that returns a string that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @returns {number} `-1` if a occurs before b, `1` if a occurs after b, otherwise `0`
 * @see {@link ascend|ascend}
 * @example
 * import { ascendNatural, identity, sort } from '@blue/util';
 * const unsorted = ['3', '1', '10', 'Ørjan', 'Bob', 'Älva'];
 * sort(ascendNatural('en', identity), unsorted);
 * // => ['1', '3', '10', 'Älva', 'Bob', 'Ørjan']
 */
export { ascendNatural };
/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly 2 parameters. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @category Function
 * @param {function} fn The function to wrap.
 * @returns {function} A new function wrapping `fn`. The new function is guaranteed to be of arity 2.
 * @see {@link n|n}Ary
 * @see {@link unary|unary}
 * @example
 * const takesThreeArgs = function( a, b, c ){
 *  return [ a, b, c ];
 * };
 * takesThreeArgs.length;
 * //=> 3
 * takesThreeArgs( 1, 2, 3 );
 * //=> [ 1, 2, 3 ]
 *
 * const takesTwoArgs = binary( takesThreeArgs );
 * takesTwoArgs.length;
 * //=> 2
 * // Only 2 arguments are passed to the wrapped function
 * takesTwoArgs( 1, 2, 3 );
 * //=> [ 1, 2, undefined ]
 */
export { binary };
/**
 * Creates a function that is bound to a context.
 * Note: `bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @category Function
 * @category Object
 * @param {function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @returns {function} A function that will execute in the context of `thisObj`.
 * @see {@link partial|partial}
 * @example
 * import { assoc, bind, pipe, tap } from '@blue/util';
 * const log = bind( console.log, console );
 * pipe( assoc( 'a', 2 ), tap( log ), assoc( 'a', 3 ) )( { a: 1 } ); //=> { a: 3 }
 * // logs {a: 2}
 */
export { bind };
/**
 * Returns the result of calling its first argument with the remaining
 * arguments. This is occasionally useful as a converging function for
 * [`converge`](#converge): the first branch can produce a function while the
 * remaining branches produce values to be passed to that function as its
 * arguments.
 *
 * @category Function
 * @param {function} fn The function to apply to the remaining arguments.
 * @param {...*} args Any number of positional arguments.
 * @returns {*}
 * @see {@link apply|apply}
 * @example
 * import { add, both, call, converge, pipe, join, repeat, replace } from '@blue/util';
 * call( add, 1, 2 ); //=> 3
 * const indentN = pipe( repeat( ' ' ), join( '' ), replace( /^(?!$)/gm ) );
 * const format = converge( call, [ pipe( prop( 'indent' ), indentN ), prop( 'value' ) ] );
 * format( { indent: 2, value: 'foo\nbar\nbaz\n' } );
 * //=> '  foo\n  bar\n  baz\n'
 */
export { call };
/**
 * Makes a comparator function out of a function that reports whether the first
 * element is less than the second.
 *
 * @category Function
 * @param {function} pred A predicate function of arity two which will return `true` if the first argument is less than the second, `false` otherwise
 * @returns {function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`
 * @example
 * import { comparator, sort } from '@blue/util';
 * const byAge = comparator( ( a, b ) => a.age < b.age );
 * const people = [
 *  { name: 'Emma', age: 70 },
 *  { name: 'Peter', age: 78 },
 *  { name: 'Mikhail', age: 62 },
 * ];
 * const peopleByIncreasingAge = sort( byAge, people );
 * //=> [ { name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 } ]
 */
export { comparator };
/**
 * Performs right-to-left function composition. The last argument may have
 * any arity; the remaining arguments must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @category Function
 * @param {...external:function} ...functions The functions to compose
 * @returns {function}
 * @see {@link pipe|pipe}
 * @example
 * import { add, compose, multiply, toUpper } from '@blue/util';
 * const classyGreeting = ( firstName, lastName ) => `The name's ${ lastName }, ${ firstName } ${ lastName }`;
 * const yellGreeting = compose( toUpper, classyGreeting );
 * yellGreeting( 'James', 'Bond' ); //=> "THE NAME'S BOND, JAMES BOND"
 * compose( Math.abs, add( 1 ), multiply( 2 ) )( -4 ) //=> 7
 */
export { compose };
/**
 * Performs right-to-left function composition using transforming function. The last argument may have
 * any arity; the remaining arguments must be unary.
 *
 * **Note:** The result of compose is not automatically curried. Transforming function is not used on the
 * last argument.
 *
 * @category Function
 * @param {...Function} ...functions The functions to compose
 * @returns {function}
 * @see {@link compose|compose}
 * @see {@link pipe|pipe}
 * @example
 * import { composeWith, inc, isNil, prop } from '@blue/util';
 * const composeWhileNotNil = composeWith( ( f, res ) => isNil( res ) ? res : f( res ) );
 * composeWhileNotNil( [ inc, prop( 'age' ) ] )( { age: 1 } ) //=> 2
 * composeWhileNotNil( [ inc, prop( 'age' ) ] )( {} ) //=> undefined
 */
export { composeWith };
/**
 * Wraps a constructor function inside a curried function that can be called
 * with the same arguments and returns the same type.
 *
 * @category Function
 * @param {function} fn The constructor function to wrap.
 * @returns {function} A wrapped, curried constructor function.
 * @see {@link invoker|invoker}
 * @example
 * import { compose, construct, invoker, map } from '@blue/util';
 * // Constructor function
 * function Animal( kind ){
 *   this.kind = kind;
 * };
 * Animal.prototype.sighting = function(){
 *   return "It's a " + this.kind + "!";
 * }
 *
 * const AnimalConstructor = construct( Animal )
 *
 * // Notice we no longer need the 'new' keyword:
 * AnimalConstructor( 'Pig' ); //=> { "kind": "Pig", "sighting": function(){ ... } };
 *
 * const animalTypes = [ "Lion", "Tiger", "Bear" ];
 * const animalSighting = invoker( 0, 'sighting' );
 * const sightNewAnimal = compose( animalSighting, AnimalConstructor );
 * map( sightNewAnimal, animalTypes ); //=> [ "It's a Lion!", "It's a Tiger!", "It's a Bear!" ]
 */
export { construct };
/**
 * Wraps a constructor function inside a curried function that can be called
 * with the same arguments and returns the same type. The arity of the function
 * returned is specified to allow using variadic constructor functions.
 *
 * @category Function
 * @param {number} n The arity of the constructor function.
 * @param {function} Fn The constructor function to wrap.
 * @returns {function} A wrapped, curried constructor function.
 * @example
 * import { constructN, join, map } from '@blue/util';
 * // Variadic Constructor function
 * function Salad(){
 *   this.ingredients = arguments;
 * }
 *
 * Salad.prototype.recipe = function(){
 *   const instructions = map( ingredient => 'Add a dollop of ' + ingredient, this.ingredients );
 *   return join( '\n', instructions );
 * };
 *
 * const ThreeLayerSalad = constructN( 3, Salad );
 *
 * // Notice we no longer need the 'new' keyword, and the constructor is curried for 3 arguments.
 * const salad = ThreeLayerSalad( 'Mayonnaise' )( 'Potato Chips' )( 'Ketchup' );
 *
 * console.log( salad.recipe() );
 * // Add a dollop of Mayonnaise
 * // Add a dollop of Potato Chips
 * // Add a dollop of Ketchup
 */
export { constructN };
/**
 * Accepts a converging function and a list of branching functions and returns
 * a new function. The arity of the new function is the same as the arity of
 * the longest branching function. When invoked, this new function is applied
 * to some arguments, and each branching function is applied to those same
 * arguments. The results of each branching function are passed as arguments
 * to the converging function to produce the return value.
 *
 * @category Function
 * @param {function} after A function. `after` will be invoked with the return values of `fn1` and `fn2` as its arguments.
 * @param {Array} functions A list of functions.
 * @returns {function} A new function.
 * @see {@link use|use}With
 * @example
 * import { concat, converge, divide, length, sum, toLower, toUpper } from '@blue/util';
 * const average = converge( divide, [ sum, length ] )
 * average( [ 1, 2, 3, 4, 5, 6, 7 ] ) //=> 4
 *
 * const strangeConcat = converge( concat, [ toUpper, toLower ] )
 * strangeConcat( "Yodel" ) //=> "YODELyodel"
 *
 * @symb converge( f, [ g, h ] )( a, b ) = f( g( a, b ), h( a, b ) )
 */
export { converge };
/**
 * Returns a curried equivalent of the provided function. The curried function
 * has two unusual capabilities. First, its arguments needn't be provided one
 * at a time. If `f` is a ternary function and `g` is `curry(f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @category Function
 * @param {function} fn The function to curry.
 * @returns {function} A new, curried function.
 * @see {@link curry|curry}N
 * @see {@link partial|partial}
 * @example
 * const addFourNumbers = ( a, b, c, d ) => a + b + c + d;
 * const curriedAddFourNumbers = curry( addFourNumbers );
 * const f = curriedAddFourNumbers( 1, 2 );
 * const g = f( 3 );
 * g( 4 ); //=> 10
 */
export { curry };
/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @category Function
 * @param {number} length The arity for the returned function.
 * @param {function} fn The function to curry.
 * @returns {function} A new, curried function.
 * @see {@link curry|curry}
 * @example
 * import { curryN, sum } from '@blue/util';
 * const sumArgs = ( ...args ) => sum( args );
 * const curriedAddFourNumbers = curryN( 4, sumArgs );
 * const f = curriedAddFourNumbers( 1, 2 );
 * const g = f( 3 );
 * g( 4 ); //=> 10
 */
export { curryN };
/**
 * Makes a descending comparator function out of a function that returns a value
 * that can be compared with `<` and `>`.
 *
 * @category Function
 * @param {function} fn A function of arity one that returns a value that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @returns {number} `-1` if fn(a) > fn(b), `1` if fn(b) > fn(a), otherwise `0`
 * @see {@link ascend|ascend}
 * @example
 * import { descend, prop, sort } from '@blue/util';
 * const byAge = descend( prop( 'age' ) );
 * const people = [
 *  { name: 'Emma', age: 70 },
 *  { name: 'Peter', age: 78 },
 *  { name: 'Mikhail', age: 62 },
 * ];
 * const peopleByOldestFirst = sort( byAge, people );
 * //=> [ { name: 'Peter', age: 78 }, { name: 'Emma', age: 70 }, { name: 'Mikhail', age: 62 } ]
 */
export { descend };
/**
 * Makes a descending comparator function out of a function that returns a value
 * that can be compared with natural sorting using localeCompare.
 *
 * @category Function
 * @param {string} locales A string with a BCP 47 language tag, or an array of such strings. Corresponds to the locales parameter of the Intl.Collator() constructor.
 * @param {function} fn A function of arity one that returns a string that can be compared
 * @param {*} a The first item to be compared.
 * @param {*} b The second item to be compared.
 * @returns {number} `-1` if a occurs after b, `1` if a occurs before b, otherwise `0`
 * @see {@link descend|descend}
 * @example
 * import { descendNatural, identity, sort } from '@blue/util';
 * const unsorted = ['3', '1', '10', 'Ørjan', 'Bob', 'Älva'];
 * sort(descendNatural('en', identity), unsorted);
 * // => ['Ørjan', 'Bob', 'Älva', '10', '3', '1']
 */
export { descendNatural };
/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`), Map (`new Map()`), Set (`new Set()`),
 * TypedArray (`Uint8Array []`, `Float32Array []`, etc), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @category Function
 * @param {*} x The value
 * @returns {*} The empty value
 * @example
 * empty( [ 1, 2, 3 ] ); //=> []
 * empty( 'unicorns' ); //=> ''
 * empty( { x: 1, y: 2 } ); //=> {}
 */
export { empty };
/**
 * Returns a new function much like the supplied one, except that the first two
 * arguments' order is reversed.
 *
 * @category Function
 * @param {function} fn The function to invoke with its first two parameters reversed.
 * @returns {*} The result of invoking `fn` with its first two parameters' order reversed.
 * @example
 * const mergeThree = ( a, b, c ) => [].concat( a, b, c );
 * mergeThree( 1, 2, 3 ); //=> [ 1, 2, 3 ]
 * flip( mergeThree )( 1, 2, 3 ); //=> [ 2, 1, 3 ]
 */
export { flip };
/**
 * A function that does nothing but return the parameter supplied to it. Good
 * as a default or placeholder function.
 *
 * @category Function
 * @param {*} x The value to return.
 * @returns {*} The input value, `x`.
 * @example
 * identity( 1 ); //=> 1
 * const obj = {};
 * identity( obj ) === obj; //=> true
 */
export { identity };
/**
 * Turns a named method with a specified arity into a function that can be
 * called directly supplied with arguments and a target object.
 *
 * The returned function is curried and accepts `arity + 1` parameters where
 * the final parameter is the target object.
 *
 * @category Function
 * @param {number} arity Number of arguments the returned function should take before the target object.
 * @param {string} method Name of the method to call.
 * @returns {function} A new curried function.
 * @see {@link construct|construct}
 * @example
 * const sliceFrom = invoker( 1, 'slice' );
 * sliceFrom (6, 'abcdefghijklm' ); //=> 'ghijklm'
 * const sliceFrom6 = invoker( 2, 'slice' )( 6 );
 * sliceFrom6( 8, 'abcdefghijklm' ); //=> 'gh'
 */
export { invoker };
/**
 * juxt applies a list of functions to a list of values.
 *
 * @category Function
 * @param {Array} fns An array of functions
 * @returns {function} A function that returns a list of values after applying each of the original `fns` to its parameters.
 * @see {@link applySpec|applySpec}
 * @example
 * const getRange = juxt( [ Math.min, Math.max ] );
 * getRange( 3, 4, 9, -3 ); //=> [ -3, 9 ]
 */
export { juxt };
/**
 * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
 * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @category Function
 * @param {function} fn The function to lift into higher context
 * @returns {function} The lifted function.
 * @see {@link liftN|liftN}
 * @example
 * const madd3 = lift( ( a, b, c ) => a + b + c );
 * madd3( [ 1, 2, 3 ], [ 1, 2, 3 ], [ 1 ] ); //=> [ 3, 4, 5, 4, 5, 6, 5, 6, 7 ]
 * const madd5 = lift( ( a, b, c, d, e ) => a + b + c + d + e );
 * madd5( [ 1, 2 ], [ 3 ], [ 4, 5 ], [ 6 ], [ 7, 8 ] ); //=> [ 21, 22, 22, 23, 22, 23, 23, 24 ]
 */
export { lift };
/**
 * "lifts" a function to be the specified arity, so that it may "map over" that
 * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @category Function
 * @param {function} fn The function to lift into higher context
 * @returns {function} The lifted function.
 * @see {@link lift|lift}
 * @see {@link ap|ap}
 * @example
 * import { liftN, sum } from '@blue/util';
 * const madd3 = liftN( 3, ( ...args ) => sum( args ) );
 * madd3( [ 1, 2, 3 ], [ 1, 2, 3 ], [ 1 ] ); //=> [ 3, 4, 5, 4, 5, 6, 5, 6, 7 ]
 */
export { liftN };
/**
 * Creates a new function that, when invoked, caches the result of calling `fn`
 * for a given argument set and returns the result. Subsequent calls to the
 * memoized `fn` with the same argument set will not result in an additional
 * call to `fn`; instead, the cached result for that set of arguments will be
 * returned.
 *
 *
 * @category Function
 * @param {function} fn The function to generate the cache key.
 * @param {function} fn The function to memoize.
 * @returns {function} Memoized version of `fn`.
 * @example
 * import { identity, memoizeWith, product, range } from '@blue/util';
 * let count = 0;
 * const factorial = memoizeWith( identity, ( n ) => {
 *  count += 1;
 *  return product( range( 1, n + 1 ) );
 * } );
 * factorial( 5 ); //=> 120
 * factorial( 5 ); //=> 120
 * factorial( 5 ); //=> 120
 * count; //=> 1
 */
export { memoizeWith };
/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly `n` parameters. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @category Function
 * @param {number} n The desired arity of the new function.
 * @param {function} fn The function to wrap.
 * @returns {function} A new function wrapping `fn`. The new function is guaranteed to be of arity `n`.
 * @see {@link binary|binary}
 * @see {@link unary|unary}
 * @example
 * const takesTwoArgs = ( a, b ) => [ a, b ];
 *
 * takesTwoArgs.length;
 * //=> 2
 * takesTwoArgs( 1, 2 );
 * //=> [1, 2]
 *
 * const takesOneArg = nAry( 1, takesTwoArgs );
 * takesOneArg.length;
 * //=> 1
 * // Only `n` arguments are passed to the wrapped function
 * takesOneArg( 1, 2 );
 * //=> [ 1, undefined ]
 */
export { nAry };
/**
 * Returns a function which returns its nth argument.
 *
 * @category Function
 * @param {number} n
 * @returns {function}
 * @example
 * nthArg( 1 )( 'a', 'b', 'c' );
 * //=> 'b'
 * nthArg( -1 )( 'a', 'b', 'c' );
 * //=> 'c'
 */
export { nthArg };
/**
 * `o` is a curried composition function that returns a unary function.
 * Like [`compose`](#compose), `o` performs right-to-left function composition.
 * Unlike [`compose`](#compose), the rightmost function passed to `o` will be
 * invoked with only one argument. Also, unlike [`compose`](#compose), `o` is
 * limited to accepting only 2 unary functions. The name o was chosen because
 * of its similarity to the mathematical composition operator ∘.
 *
 * @category Function
 * @param {function} f
 * @param {function} g
 * @returns {function}
 * @see {@link compose|compose}
 * @see {@link pipe|pipe}
 * @example
 * import { add, multiply, o, toUpper } from '@blue/util';
 * const classyGreeting = ( name ) => `The name's ${ name.last }, ${ name.first } ${ name.last }`;
 * const yellGreeting = o( toUpper, classyGreeting );
 * yellGreeting( { first: 'James', last: 'Bond' } ); //=> "THE NAME'S BOND, JAMES BOND"
 * o( multiply( 10 ), add( 10 ) )( -4 ) //=> 60
 */
export { o };
/**
 * Returns a singleton array containing the value provided.
 *
 * Note this `of` is different from the ES6 `of`; See
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
 *
 * @category Function
 * @param {*} x any value
 * @returns {Array} An array wrapping `x`.
 * @example
 * of( null );
 * //=> [ null ]
 * of( [ 42 ] );
 * //=> [ [ 42 ] ]
 */
export { of };
/**
 * Accepts a function `fn` and returns a function that guards invocation of
 * `fn` such that `fn` can only ever be called once, no matter how many times
 * the returned function is invoked. The first value calculated is returned in
 * subsequent invocations.
 *
 * @category Function
 * @param {function} fn The function to wrap in a call-only-once wrapper.
 * @returns {function} The wrapped function.
 * @example
 * const addOneOnce = once( x => x + 1 );
 * addOneOnce( 10 );
 * //=> 11
 * addOneOnce( addOneOnce( 50 ) );
 * //=> 11
 */
export { once };
/**
 * Returns the result of applying the onFailure function to the value inside
 * a failed promise. This is useful for handling rejected promises
 * inside function compositions.
 *
 * @category Function
 * @param {function} onFailure The function to apply. Can return a value or a promise of a value.
 * @param {Promise} p
 * @returns {Promise} The result of calling `p.then(null, onFailure)`
 * @see {@link then|then}
 * @example
 * import { otherwise, pick, pipe, then } from '@blue/util';
 * const failedFetch = ( id ) => Promise.reject( 'bad ID' );
 * const useDefault = () => ( { firstName: 'Bob', lastName: 'Loblaw' } );
 * //recoverFromFailure :: String -> Promise ({firstName, lastName})
 * const recoverFromFailure = pipe(
 *  failedFetch,
 *  otherwise( useDefault ),
 *  then( pick( [ 'firstName', 'lastName' ] ) ),
 * );
 * recoverFromFailure( 12345 ).then( console.log )
 */
export { otherwise };
/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided initially followed by the arguments provided to `g`.
 *
 * @category Function
 * @param {function} f
 * @param {Array} args
 * @returns {function}
 * @see {@link partialRight|partialRight}
 * @see {@link curry|curry}
 * @example
 * const multiply2 = ( a, b ) => a * b;
 * const double = partial( multiply2, [ 2 ] );
 * double( 2 );
 * //=> 4
 *
 * const greet = ( salutation, title, firstName, lastName ) => `${ salutation }, ${ title } ${ firstName } ${ lastName }!`;
 * const sayHello = partial( greet, [ 'Hello' ] );
 * const sayHelloToMs = partial( sayHello, [ 'Ms.' ] );
 * sayHelloToMs( 'Jane', 'Jones' );
 * //=> 'Hello, Ms. Jane Jones!'
 */
export { partial };
/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided to `g` followed by the arguments provided initially.
 *
 * @category Function
 * @param {function} f
 * @param {Array} args
 * @returns {function}
 * @see {@link partial|partial}
 * @example
 * const greet = ( salutation, title, firstName, lastName ) => `${ salutation }, ${ title } ${ firstName } ${ lastName }!`;
 *
 * const greetMsJaneJones = partialRight( greet, [ 'Ms.', 'Jane', 'Jones' ] );
 * greetMsJaneJones( 'Hello' );
 * //=> 'Hello, Ms. Jane Jones!'
 */
export { partialRight };
/**
 * Performs left-to-right function composition. The first argument may have
 * any arity; the remaining arguments must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @category Function
 * @param {...Function} functions
 * @returns {function}
 * @see {@link compose|compose}
 * @example
 * import { inc, negate, pipe } from '@blue/util';
 * const f = pipe( Math.pow, negate, inc );
 * f( 3, 4 );
 * //=> -(3^4) + 1
 */
export { pipe };
/**
 * Performs left-to-right function composition using transforming function. The first argument may have
 * any arity; the remaining arguments must be unary.
 *
 * **Note:** The result of pipeWith is not automatically curried. Transforming function is not used on the
 * first argument.
 *
 * @sig ((a, b, ..., n) → o) → ((o → p), (p → q), ..., (y → z)) → ((a, b, ..., n) → z)
 * @category Function
 * @param {...Function} functions
 * @returns {function}
 * @see {@link composeWith|composeWith}
 * @see {@link pipe|pipe}
 * @example
 * import { inc, isNil, negate, pipeWith } from '@blue/util';
 * const pipeWhileNotNil = pipeWith( ( f, res ) => isNil( res ) ? res : f( res ) );
 * const f = pipeWhileNotNil( [ Math.pow, negate, inc ] )
 * f( 3, 4 ); // -(3^4) + 1
 */
export { pipeWith };
/**
 * Runs the given function with the supplied object, then returns the object.
 *
 * Acts as a transducer if a transformer is given as second parameter.
 *
 * @category Function
 * @param {function} fn The function to call with `x`. The return value of `fn` will be thrown away.
 * @param {*} x
 * @returns {*} `x`.
 * @example
 * const sayX = ( x ) => console.log( 'x is ' + x );
 * tap( sayX, 100 ); //=> 100
 * // logs 'x is 100'
 */
export { tap };
/**
 * Creates a thunk out of a function. A thunk delays a calculation until
 * its result is needed, providing lazy evaluation of arguments.
 *
 * @category Function
 * @param {function} fn A function to wrap in a thunk
 * @returns {function} Expects arguments for `fn` and returns a new function that, when called, applies those arguments to `fn`.
 * @see {@link partial|partial}
 * @see {@link partialRight|partialRight}
 * @example
 * import { identity, thunkify } from '@blue/util';
 * thunkify( identity )( 42 )(); //=> 42
 * thunkify( ( a, b ) => a + b )( 25, 17 )(); //=> 42
 */
export { thunkify };
/**
 * `tryCatch` takes two functions, a `tryer` and a `catcher`. The returned
 * function evaluates the `tryer`; if it does not throw, it simply returns the
 * result. If the `tryer` *does* throw, the returned function evaluates the
 * `catcher` function and returns its result. Note that for effective
 * composition with this function, both the `tryer` and `catcher` functions
 * must return the same type of results.
 *
 * @category Function
 * @param {function} tryer The function that may throw.
 * @param {function} catcher The function that will be evaluated if `tryer` throws.
 * @returns {function} A new function that will catch exceptions and send then to the catcher.
 * @example
 * import { always, F, identity, prop, times, tryCatch } from '@blue/util';
 * tryCatch( prop( 'x' ), F )( { x: true } ); //=> true
 * tryCatch( () => { throw 'foo' }, always( 'catched' ) )( 'bar' ) // => 'catched'
 * tryCatch( times( identity ), always( [] ) )( 's' ) // => []
 */
export { tryCatch };
/**
 * Takes a function `fn`, which takes a single array argument, and returns a
 * function which:
 *
 *   - takes any number of positional arguments;
 *   - passes these arguments to `fn` as an array; and
 *   - returns the result.
 *
 * In other words, `unapply` derives a variadic function from a function which
 * takes an array. `unapply` is the inverse of [`apply`](#apply).
 *
 * @category Function
 * @param {function} fn
 * @returns {function}
 * @see {@link apply|apply}
 * @example
 * unapply( JSON.stringify )( 1, 2, 3 ); //=> '[ 1, 2, 3 ]'
 */
export { unapply };
/**
 * Wraps a function of any arity (including nullary) in a function that accepts
 * exactly 1 parameter. Any extraneous parameters will not be passed to the
 * supplied function.
 *
 * @category Function
 * @param {function} fn The function to wrap.
 * @returns {function} A new function wrapping `fn`. The new function is guaranteed to be of arity 1.
 * @see {@link binary|binary}
 * @see {@link nAry|nAry}
 * @example
 * const takesTwoArgs = ( a, b ) => [ a, b ];
 * takesTwoArgs.length; //=> 2
 * takesTwoArgs( 1, 2 ); //=> [ 1, 2 ]
 *
 * const takesOneArg = unary( takesTwoArgs );
 * takesOneArg.length; //=> 1
 * // Only 1 argument is passed to the wrapped function
 * takesOneArg( 1, 2 ); //=> [ 1, undefined ]
 */
export { unary };
/**
 * Returns a function of arity `n` from a (manually) curried function.
 *
 * @category Function
 * @param {number} length The arity for the returned function.
 * @param {function} fn The function to uncurry.
 * @returns {function} A new function.
 * @see {@link curry|curry}
 * @example
 * const addFour = ( a ) => ( b ) => ( c ) => ( d ) => a + b + c + d;
 * const uncurriedAddFour = uncurryN( 4, addFour );
 * uncurriedAddFour( 1, 2, 3, 4 ) ; //=> 10
 */
export { uncurryN };
/**
 * Accepts a function `fn` and a list of transformer functions and returns a
 * new curried function. When the new function is invoked, it calls the
 * function `fn` with parameters consisting of the result of calling each
 * supplied handler on successive arguments to the new function.
 *
 * If more arguments are passed to the returned function than transformer
 * functions, those arguments are passed directly to `fn` as additional
 * parameters. If you expect additional arguments that don't need to be
 * transformed, although you can ignore them, it's best to pass an identity
 * function so that the new function reports the correct arity.
 *
 * @category Function
 * @param {function} fn The function to wrap.
 * @param {Array} transformers A list of transformer functions
 * @returns {function} The wrapped function.
 * @see {@link converge|converge}
 * @example
 * import { dec, identity, inc, useWith } from '@blue/util';
 * useWith( Math.pow, [ identity, identity ] )( 3, 4 );   //=> 81
 * useWith( Math.pow, [ identity, identity ] )( 3 )( 4 ); //=> 81
 * useWith( Math.pow, [ dec, inc ] )( 3, 4 );   //=> 32
 * useWith( Math.pow, [ dec, inc ] )( 3 )( 4 ); //=> 32
 */
export { useWith };
export default {
    F,
    T,
    __,
    addIndex,
    addIndexRight,
    always,
    andThen,
    ap,
    apply,
    applySpec,
    applyTo,
    ascend,
    ascendNatural,
    binary,
    bind,
    call,
    comparator,
    compose,
    composeWith,
    construct,
    constructN,
    converge,
    curry,
    curryN,
    descend,
    descendNatural,
    empty,
    flip,
    identity,
    invoker,
    juxt,
    lift,
    liftN,
    memoizeWith,
    nAry,
    nthArg,
    o,
    of,
    once,
    otherwise,
    partial,
    partialRight,
    pipe,
    pipeWith,
    tap,
    thunkify,
    tryCatch,
    unapply,
    unary,
    uncurryN,
    useWith,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUNILENBQUMsRUFDRCxDQUFDLEVBQ0QsRUFBRSxFQUNGLFFBQVEsRUFDUixhQUFhLEVBQ2IsTUFBTSxFQUNOLE9BQU8sRUFDUCxFQUFFLEVBQ0YsS0FBSyxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1AsTUFBTSxFQUNOLGFBQWEsRUFDYixNQUFNLEVBQ04sSUFBSSxFQUNKLElBQUksRUFDSixVQUFVLEVBQ1YsT0FBTyxFQUNQLFdBQVcsRUFDWCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFFBQVEsRUFDUixLQUFLLEVBQ0wsTUFBTSxFQUNOLE9BQU8sRUFDUCxjQUFjLEVBQ2QsS0FBSyxFQUNMLElBQUksRUFDSixRQUFRLEVBQ1IsT0FBTyxFQUNQLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLFdBQVcsRUFDWCxJQUFJLEVBQ0osTUFBTSxFQUNOLENBQUMsRUFDRCxFQUFFLEVBQ0YsSUFBSSxFQUNKLFNBQVMsRUFDVCxPQUFPLEVBQ1AsWUFBWSxFQUNaLElBQUksRUFDSixRQUFRLEVBQ1IsR0FBRyxFQUNILFFBQVEsRUFDUixRQUFRLEVBQ1IsT0FBTyxFQUNQLEtBQUssRUFDTCxRQUFRLEVBQ1IsT0FBTyxHQUNWLE1BQU0sT0FBTyxDQUFDO0FBRWY7Ozs7Ozs7O0dBUUc7QUFDSCxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFFYjs7Ozs7Ozs7R0FRRztBQUNILE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUViOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNILE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUVkOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0gsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBRXBCOzs7Ozs7Ozs7Ozs7Ozs7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