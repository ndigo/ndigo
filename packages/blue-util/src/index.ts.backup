/**
 * @author Jeff Rose
 * @see external:date-fns
 * @see external:date-fns-tz
 * @see external:ramda
 * @see external:seedrandom
 * @see external:slug
 */

/**
 * @global
 * @external date-fns
 * @see {@link https://date-fns.org/}
 */

/**
 * @global
 * @external date-fns-tz
 * @see {@link https://github.com/marnusw/date-fns-tz}
 */

/**
 * @global
 * @external ramda
 * @see {@link https://ramdajs.com/docs/}
 */

/**
 * @global
 * @external seedrandom
 * @see {@link https://www.npmjs.com/package/seedrandom}
 */

/**
 * @global
 * @external slug
 * @see {@link https://www.npmjs.com/package/slug}
 */

export {
    /**
     * A function that always returns `false`. Any passed in parameters are ignored.
     *
     * @category Function
     * @returns {boolean} False
     * @example
     * F();
     * //=> false
     */
    F,
} from 'ramda';

export {
    /**
     * A function that always returns `true`. Any passed in parameters are ignored.
     *
     * @category Function
     * @returns {boolean} True
     * @example
     * T();
     * //=> true
     */
    T,
} from 'ramda';

export {
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
    __,
} from 'ramda';

export {
    /**
     * Adds two values.
     *
     * @category Math
     * @param {number} a
     * @param {number} b
     * @returns {number}
     * @see {@link subtract|subtract}
     * @example
     * add( 2, 3 );
     * //=>  5
     * add( 7 )( 10 );
     * //=> 17
     */
    add,
} from 'ramda';

export {
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
    addIndex,
} from 'ramda';

export {
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
    addIndexRight,
} from 'ramda';

export {
    /**
     * Applies a function to the value at the given index of an array, returning a
     * new copy of the array with the element at the given index replaced with the
     * result of the function application.
     *
     * @category List
     * @param {number} idx The index.
     * @param {function} fn The function to apply.
     * @param {ArrayLike} list An array-like object whose value at the supplied index will be replaced.
     * @returns {Array} A copy of the supplied array-like object with the element at index `idx` replaced with the value returned by applying `fn` to the existing element.
     * @see {@link update|update}
     * @example
     * import { adjust, toUpper } from '@blue/util';
     * adjust( 1, toUpper, [ 'a', 'b', 'c', 'd' ] );
     * //=> [ 'a', 'B', 'c', 'd' ]
     * adjust( -1, toUpper, [ 'a', 'b', 'c', 'd' ] );
     * //=> [ 'a', 'b', 'c', 'D' ]
     */
    adjust,
} from 'ramda';

export {
    /**
     * Returns `true` if all elements of the list match the predicate, `false` if
     * there are any that don't.
     *
     * Dispatches to the `all` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The predicate function.
     * @param {Array} list The array to consider.
     * @returns {boolean} `true` if the predicate is satisfied by every element, `false` otherwise.
     * @see {@link any|any}
     * @see {@link none|none}
     * @see {@link transduce|transduce}
     * @example
     * import { all, equals } from '@blue/util';
     * const equals3 = equals( 3 );
     * all( equals3 )( [ 3, 3, 3, 3 ] );
     * //=> true
     * all( equals3 )( [ 3, 3, 1, 3 ] );
     * //=> false
     */
    all,
} from 'ramda';

export {
    /**
     * Takes a list of predicates and returns a predicate that returns true for a
     * given list of arguments if every one of the provided predicates is satisfied
     * by those arguments.
     *
     * The function returned is a curried function whose arity matches that of the
     * highest-arity predicate.
     *
     * @category Logic
     * @param {Array} predicates An array of predicates to check
     * @returns {function} The combined predicate
     * @see {@link anyPass|anyPass}
     * @example
     * import { allPass, propEq } from '@blue/util';
     * const isQueen = propEq( 'rank', 'Q' );
     * const isSpade = propEq( 'suit', '♠︎' );
     * const isQueenOfSpades = allPass( [ isQueen, isSpade ] );
     *
     * isQueenOfSpades( { rank: 'Q', suit: '♣︎' } );
     * //=> false
     * isQueenOfSpades( { rank: 'Q', suit: '♠︎' } );
     * //=> true
     */
    allPass,
} from 'ramda';

export {
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
    always,
} from 'ramda';

export {
    /**
     * Returns `true` if both arguments are `true`; `false` otherwise.
     *
     * @category Logic
     * @param {*} a
     * @param {*} b
     * @returns {*} the first argument if it is falsy, otherwise the second argument.
     * @see {@link both|both}
     * @example
     * and( true, true );
     * //=> true
     * and( true, false );
     * //=> false
     * and( false, true );
     * //=> false
     * and( false, false );
     * //=> false
     */
    and,
} from 'ramda';

export {
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
    andThen,
} from 'ramda';

export {
    /**
     * Returns `true` if at least one of the elements of the list match the predicate,
     * `false` otherwise.
     *
     * Dispatches to the `any` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The predicate function.
     * @param {Array} list The array to consider.
     * @returns {boolean} `true` if the predicate is satisfied by at least one element, `false` otherwise.
     * @see {@link all|all}
     * @see {@link none|none}
     * @see {@link transduce|transduce}
     * @example
     * import { any, flip, lt } from '@blue/util';
     * const lessThan0 = flip( lt )( 0 );
     * const lessThan2 = flip( lt )( 2 );
     * any( lessThan0 )( [ 1, 2 ] );
     * //=> false
     * any( lessThan2 )( [ 1, 2 ] );
     * //=> true
     */
    any,
} from 'ramda';

export {
    /**
     * Takes a list of predicates and returns a predicate that returns true for a
     * given list of arguments if at least one of the provided predicates is
     * satisfied by those arguments.
     *
     * The function returned is a curried function whose arity matches that of the
     * highest-arity predicate.
     *
     * @category Logic
     * @param {Array} predicates An array of predicates to check
     * @returns {function} The combined predicate
     * @see {@link all|all}Pass
     * @example
     * import { anyPass, propEq } from '@blue/util';
     * const isClub = propEq( 'suit', '♣' );
     * const isSpade = propEq( 'suit', '♠' );
     * const isBlackCard = anyPass( [ isClub, isSpade ] );
     *
     * isBlackCard( { rank: '10', suit: '♣' } );
     * //=> true
     * isBlackCard( { rank: 'Q', suit: '♠' } );
     * //=> true
     * isBlackCard( { rank: 'Q', suit: '♦' } );
     * //=> false
     */
    anyPass,
} from 'ramda';

export {
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
    ap,
} from 'ramda';

export {
    /**
     * Returns a new list, composed of n-tuples of consecutive elements. If `n` is
     * greater than the length of the list, an empty list is returned.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {number} n The size of the tuples to create
     * @param {Array} list The list to split into `n`-length tuples
     * @returns {Array} The resulting list of `n`-length tuples
     * @see {@link transduce|transduce}
     * @example
     * aperture( 2, [ 1, 2, 3, 4, 5 ] );
     * //=> [ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ] ]
     * aperture( 3, [ 1, 2, 3, 4, 5 ] );
     * //=> [ [ 1, 2, 3 ], [ 2, 3, 4 ], [ 3, 4, 5 ] ]
     * aperture( 7, [ 1, 2, 3, 4, 5 ] );
     * //=> []
     */
    aperture,
} from 'ramda';

export {
    /**
     * Returns a new list containing the contents of the given list, followed by
     * the given element.
     *
     * @category List
     * @param {*} el The element to add to the end of the new list.
     * @param {Array} list The list of elements to add a new item to list.
     * @returns {Array} A new list containing the elements of the old list followed by `el`.
     * @see {@link prepend|prepend}
     * @example
     * append( 'tests', [ 'write', 'more' ] );
     * //=> [ 'write', 'more', 'tests' ]
     * append( 'tests', [] );
     * //=> [ 'tests' ]
     * append( [ 'tests' ], [ 'write', 'more' ] );
     * //=> [ 'write', 'more', [ 'tests' ] ]
     */
    append,
} from 'ramda';

export {
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
    apply,
} from 'ramda';

export {
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
    applySpec,
} from 'ramda';

export {
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
    applyTo,
} from 'ramda';

export {
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
    ascend,
} from 'ramda';

export {
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
    ascendNatural,
} from 'ramda';

export {
    /**
     * Makes a shallow clone of an object, setting or overriding the specified
     * property with the given value. Note that this copies and flattens prototype
     * properties onto the new object as well. All non-primitive properties are
     * copied by reference.
     *
     * @category Object
     * @param {string} prop The property name to set
     * @param {*} val The new value
     * @param {Object} obj The object to clone
     * @returns {Object} A new object equivalent to the original except for the changed property.
     * @see {@link dissoc|dissoc}
     * @see {@link pick|pick}
     * @example
     * assoc( 'c', 3, { a: 1, b: 2 } );
     * //=> {a: 1, b: 2, c: 3}
     */
    assoc,
} from 'ramda';

export {
    /**
     * Makes a shallow clone of an object, setting or overriding the nodes required
     * to create the given path, and placing the specific value at the tail end of
     * that path. Note that this copies and flattens prototype properties onto the
     * new object as well. All non-primitive properties are copied by reference.
     *
     * @category Object
     * @typedefn Idx = String | Int
     * @param {Array} path the path to set
     * @param {*} val The new value
     * @param {Object} obj The object to clone
     * @returns {Object} A new object equivalent to the original except along the specified path.
     * @see {@link dissoc|dissoc}Path
     * @example
     * assocPath( [ 'a', 'b', 'c' ], 42, { a: { b: { c: 0 } } } );
     * //=> { a: { b: { c: 42 } } }
     * // Any missing or non-object keys in path will be overridden
     * assocPath( [ 'a', 'b', 'c' ], 42, { a: 5 } );
     * //=> { a: { b: { c: 42 } } }
     */
    assocPath,
} from 'ramda';

export {
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
    binary,
} from 'ramda';

export {
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
    bind,
} from 'ramda';

export {
    /**
     * A function which calls the two provided functions and returns the `&&`
     * of the results.
     * It returns the result of the first function if it is false-y and the result
     * of the second function otherwise. Note that this is short-circuited,
     * meaning that the second function will not be invoked if the first returns a
     * false-y value.
     *
     * In addition to functions, `both` also accepts any fantasy-land compatible
     * applicative functor.
     *
     * @category Logic
     * @param {function} f A predicate
     * @param {function} g Another predicate
     * @returns {function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
     * @see {@link and|and}
     * @example
     * import { __, both, gt, lt } from '@blue/util';
     * const gt10 = gt( __, 10 )
     * const lt20 = lt( __, 20 )
     * const f = both( gt10, lt20 );
     * f( 15 ); //=> true
     * f( 30 ); //=> false
     * both( Maybe.Just( false ), Maybe.Just( 55 ) ); // => Maybe.Just( false )
     * both( [ false, false, 'a' ], [ 11 ] ); //=> [ false, false, 11 ]
     */
    both,
} from 'ramda';

export {
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
    call,
} from 'ramda';

export {
    /**
     * `chain` maps a function over a list and concatenates the results. `chain`
     * is also known as `flatMap` in some libraries.
     *
     * Dispatches to the `chain` method of the second argument, if present,
     * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
     *
     * If second argument is a function, `chain(f, g)(x)` is equivalent to `f(g(x), x)`.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The function to map with
     * @param {Array} list The list to map over
     * @returns {Array} The result of flat-mapping `list` with `fn`
     * @example
     * import { append, chain, head } from '@blue/util';
     * const duplicate = n => [ n, n ];
     * chain( duplicate, [ 1, 2, 3 ] ); //=> [ 1, 1, 2, 2, 3, 3 ]
     * chain( append, head )( [ 1, 2, 3 ] ); //=> [ 1, 2, 3, 1 ]
     */
    chain,
} from 'ramda';

export {
    /**
     * Restricts a number to be within a range.
     *
     * Also works for other ordered types such as Strings and Dates.
     *
     * @category Relation
     * @param {number} minimum The lower limit of the clamp (inclusive)
     * @param {number} maximum The upper limit of the clamp (inclusive)
     * @param {number} value Value to be clamped
     * @returns {number} Returns `minimum` when `val < minimum`, `maximum` when `val > maximum`, returns `val` otherwise
     * @example
     * clamp( 1, 10, -5 ) // => 1
     * clamp( 1, 10, 15 ) // => 10
     * clamp( 1, 10, 4 )  // => 4
     */
    clamp,
} from 'ramda';

export {
    /**
     * Creates a deep copy of the value which may contain (nested) `Array`s and
     * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
     * assigned by reference rather than copied
     *
     * Dispatches to a `clone` method if present.
     *
     * @category Object
     * @param {*} value The object or array to clone
     * @returns {*} A deeply cloned copy of `val`
     * @example
     * const objects = [ {}, {}, {} ];
     * const objectsClone = clone( objects );
     * objects === objectsClone; //=> false
     * objects[ 0 ] === objectsClone[ 0 ]; //=> false
     */
    clone,
} from 'ramda';

export {
    /**
     * Splits a list into sub-lists, based on the result of calling a key-returning function on each element,
     * and grouping the results according to values returned.
     *
     * @category List
     * @param {function} fn Function :: a -> Idx
     * @param {Array} list The array to group
     * @returns {Array} An array of arrays where each sub-array contains items for which the String-returning function has returned the same value.
     * @see {@link groupBy|groupBy}
     * @see {@link partition|partition}
     * @example
     * import { collectBy, prop } from '@blue/util';
     * collectBy(prop('type'), [
     *   {type: 'breakfast', item: '☕️'},
     *   {type: 'lunch', item: '🌯'},
     *   {type: 'dinner', item: '🍝'},
     *   {type: 'breakfast', item: '🥐'},
     *   {type: 'lunch', item: '🍕'}
     * ]);
     * // [ [ {type: 'breakfast', item: '☕️'},
     * //     {type: 'breakfast', item: '🥐'} ],
     * //   [ {type: 'lunch', item: '🌯'},
     * //     {type: 'lunch', item: '🍕'} ],
     * //   [ {type: 'dinner', item: '🍝'} ] ]
     */
    collectBy,
} from 'ramda';

export {
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
    comparator,
} from 'ramda';

export {
    /**
     * Takes a function `f` and returns a function `g` such that if called with the same arguments
     * when `f` returns a "truthy" value, `g` returns `false` and when `f` returns a "falsy" value `g` returns `true`.
     *
     * `complement` may be applied to any functor
     *
     * @category Logic
     * @param {function} f
     * @returns {function}
     * @see {@link not|not}
     * @example
     * import { complement, isNil } from '@blue/util';
     * const isNotNil = complement( isNil );
     * isNil( null ); //=> true
     * isNotNil( null ); //=> false
     * isNil( 7 ); //=> false
     * isNotNil( 7 ); //=> true
     */
    complement,
} from 'ramda';

export {
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
    compose,
} from 'ramda';

export {
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
    composeWith,
} from 'ramda';

export {
    /**
     * Returns the result of concatenating the given lists or strings.
     *
     * Note: `concat` expects both arguments to be of the same type,
     * unlike the native `Array.prototype.concat` method. It will throw
     * an error if you `concat` an Array with a non-Array value.
     *
     * Dispatches to the `concat` method of the first argument, if present.
     * Can also concatenate two members of a [fantasy-land compatible semigroup](https://github.com/fantasyland/fantasy-land#semigroup).
     *
     * @category List
     * @param {Array | external:string} firstList The first list
     * @param {Array | external:string} secondList The second list
     * @returns {Array | external:string} A list consisting of the elements of `firstList` followed by the elements of `secondList`.
     * @example
     * concat( 'ABC', 'DEF' ); // 'ABCDEF'
     * concat( [ 4, 5, 6 ], [ 1, 2, 3 ] ); //=> [ 4, 5, 6, 1, 2, 3 ]
     * concat( [], [] ); //=> []
     */
    concat,
} from 'ramda';

export {
    /**
     * Returns a function, `fn`, which encapsulates `if/else, if/else, ...` logic.
     * `cond` takes a list of [predicate, transformer] pairs. All of the arguments
     * to `fn` are applied to each of the predicates in turn until one returns a
     * "truthy" value, at which point `fn` returns the result of applying its
     * arguments to the corresponding transformer. If none of the predicates
     * matches, `fn` returns undefined.
     *
     * @category Logic
     * @param {Array} pairs A list of [predicate, transformer]
     * @returns {function}
     * @see {@link if|if}Else
     * @see {@link unless|unless}
     * @see {@link when|when}
     * @example
     * import { always, cond, equals, T } from '@blue/util';
     * const fn = cond( [
     *  [ equals( 0 ),   always( 'water freezes at 0°C' ) ],
     *  [ equals( 100 ), always( 'water boils at 100°C' ) ],
     *  [ T,           temp => 'nothing special happens at ' + temp + '°C' ]
     * ] );
     * fn( 0 ); //=> 'water freezes at 0°C'
     * fn( 50 ); //=> 'nothing special happens at 50°C'
     * fn( 100 ); //=> 'water boils at 100°C'
     */
    cond,
} from 'ramda';

export {
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
    construct,
} from 'ramda';

export {
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
    constructN,
} from 'ramda';

export {
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
    converge,
} from 'ramda';

export {
    /**
     * Returns the number of items in a given `list` matching the predicate `f`
     *
     * @category List
     * @param {function} predicate The function to match items against.
     * @param {Array} list The list to count elements from.
     * @returns {number} The count of items matching the predicate.
     * @example
     * import { count } from '@blue/util';
     * const even = x => x % 2 == 0;
     * count(even, [1, 2, 3, 4, 5]); // => 2
     */
    count,
} from 'ramda';

export {
    /**
     * Counts the elements of a list according to how many match each value of a
     * key generated by the supplied function. Returns an object mapping the keys
     * produced by `fn` to the number of occurrences in the list. Note that all
     * keys are coerced to strings because of how JavaScript objects work.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category Relation
     * @param {function} fn The function used to map values to keys.
     * @param {Array} list The list to count elements from.
     * @returns {Object} An object mapping keys to number of occurrences in the list.
     * @example
     * import { countBy, toLower } from '@blue/util';
     * const numbers = [ 1.0, 1.1, 1.2, 2.0, 3.0, 2.2 ];
     * countBy( Math.floor )( numbers );    //=> { '1': 3, '2': 2, '3': 1 }
     * const letters = [ 'a', 'b', 'A', 'a', 'B', 'c' ];
     * countBy( toLower )( letters );   //=> { 'a': 3, 'b': 2, 'c': 1 }
     */
    countBy,
} from 'ramda';

export {
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
    curry,
} from 'ramda';

export {
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
    curryN,
} from 'ramda';

export {
    /**
     * Decrements its argument.
     *
     * @category Math
     * @param {number} n
     * @returns {number} n - 1
     * @see {@link inc|inc}
     * @example
     * dec( 42 ); //=> 41
     */
    dec,
} from 'ramda';

export {
    /**
     * Returns the second argument if it is not `null`, `undefined` or `NaN`;
     * otherwise the first argument is returned.
     *
     * @category Logic
     * @param {a} default The default value.
     * @param {b} val `val` will be returned instead of `default` unless `val` is `null`, `undefined` or `NaN`.
     * @returns {*} The second value if it is not `null`, `undefined` or `NaN`, otherwise the default value
     * @example
     * const defaultTo42 = defaultTo( 42 );
     * defaultTo42( null );  //=> 42
     * defaultTo42( undefined );  //=> 42
     * defaultTo42( false );  //=> false
     * defaultTo42( 'Ramda' );  //=> 'Ramda'
     * // parseInt( 'string' ) results in NaN
     * defaultTo42( parseInt( 'string' ) ); //=> 42
     */
    defaultTo,
} from 'ramda';

export {
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
    descend,
} from 'ramda';

export {
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
    descendNatural,
} from 'ramda';

export {
    /**
     * Finds the set (i.e. no duplicates) of all elements in the first list not
     * contained in the second list. Objects and Arrays are compared in terms of
     * value equality, not reference equality.
     *
     * @category Relation
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @returns {Array} The elements in `list1` that are not in `list2`.
     * @see {@link difference|difference}With
     * @see {@link symmetric|symmetric}Difference
     * @see {@link symmetric|symmetric}DifferenceWith
     * @see {@link without|without}
     * @example
     * difference( [ 1, 2, 3, 4 ], [ 7, 6, 5, 4, 3 ] ); //=> [ 1, 2 ]
     * difference( [ 7, 6, 5, 4, 3 ], [ 1, 2, 3, 4 ] ); //=> [ 7, 6, 5 ]
     * difference( [ { a: 1 }, { b: 2 } ], [ { a: 1 }, { c: 3 } ] ) //=> [ { b: 2 } ]
     */
    difference,
} from 'ramda';

export {
    /**
     * Finds the set (i.e. no duplicates) of all elements in the first list not
     * contained in the second list. Duplication is determined according to the
     * value returned by applying the supplied predicate to two list elements.
     *
     * @category Relation
     * @param {function} pred A predicate used to test whether two items are equal.
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @returns {Array} The elements in `list1` that are not in `list2`.
     * @see {@link difference|difference}
     * @see {@link symmetric|symmetric}Difference
     * @see {@link symmetric|symmetric}DifferenceWith
     * @example
     * const cmp = ( x, y ) => x.a === y.a;
     * const l1 = [ { a: 1 }, { a: 2 }, { a: 3 } ];
     * const l2 = [ { a: 3 }, { a: 4 } ];
     * differenceWith( cmp, l1, l2 ); //=> [ { a: 1 }, { a: 2 } ]
     */
    differenceWith,
} from 'ramda';

export {
    /**
     * Returns a new object that does not contain a `prop` property.
     *
     * @category Object
     * @param {string} prop The name of the property to dissociate
     * @param {Object} obj The object to clone
     * @returns {Object} A new object equivalent to the original but without the specified property
     * @see {@link assoc|assoc}
     * @see {@link omit|omit}
     * @example
     * dissoc( 'b', { a: 1, b: 2, c: 3 } ); //=> { a: 1, c: 3 }
     */
    dissoc,
} from 'ramda';

export {
    /**
     * Makes a shallow clone of an object, omitting the property at the given path.
     * Note that this copies and flattens prototype properties onto the new object
     * as well. All non-primitive properties are copied by reference.
     *
     * @category Object
     * @param {Array} path The path to the value to omit
     * @param {Object} obj The object to clone
     * @returns {Object} A new object without the property at path
     * @see {@link assocPath|assocPath}
     * @example
     * dissocPath( [ 'a', 'b', 'c' ], { a: { b: { c: 42 } } } ); //=> { a: { b: {} } }
     */
    dissocPath,
} from 'ramda';

export {
    /**
     * Divides two numbers. Equivalent to `a / b`.
     *
     * @category Math
     * @param {number} a The first value.
     * @param {number} b The second value.
     * @returns {number} The result of `a / b`.
     * @see {@link multiply|multiply}
     * @example
     * import { __, divide } from '@blue/util';
     * divide( 71, 100 ); //=> 0.71
     *
     * const half = divide( __, 2 );
     * half( 42 ); //=> 21
     *
     * const reciprocal = divide( 1 );
     * reciprocal( 4 );   //=> 0.25
     */
    divide,
} from 'ramda';

export {
    /**
     * Returns all but the first `n` elements of the given list, string, or
     * transducer/transformer (or object with a `drop` method).
     *
     * Dispatches to the `drop` method of the second argument, if present.
     *
     * @category List
     * @param {number} n
     * @param {*} list
     * @returns {*} A copy of list without the first `n` elements
     * @see {@link take|take}
     * @see {@link transduce|transduce}
     * @see {@link dropLast|dropLast}
     * @see {@link dropWhile|dropWhile}
     * @example
     * drop( 1, [ 'foo', 'bar', 'baz' ] ); //=> [ 'bar', 'baz' ]
     * drop( 2, [ 'foo', 'bar', 'baz' ] ); //=> [ 'baz' ]
     * drop( 3, [ 'foo', 'bar', 'baz' ] ); //=> []
     * drop( 4, [ 'foo', 'bar', 'baz' ] ); //=> []
     * drop( 3, 'ramda' );               //=> 'da'
     */
    drop,
} from 'ramda';

export {
    /**
     * Returns a list containing all but the last `n` elements of the given `list`.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {number} n The number of elements of `list` to skip.
     * @param {Array} list The list of elements to consider.
     * @returns {Array} A copy of the list with only the first `list.length - n` elements
     * @see {@link takeLast|takeLast}
     * @see {@link drop|drop}
     * @see {@link dropWhile|dropWhile}
     * @see {@link dropLastWhile|dropLastWhile}
     * @example
     * dropLast( 1, [ 'foo', 'bar', 'baz' ] ); //=> [ 'foo', 'bar' ]
     * dropLast( 2, [ 'foo', 'bar', 'baz' ] ); //=> [ 'foo' ]
     * dropLast( 3, [ 'foo', 'bar', 'baz' ] ); //=> []
     * dropLast( 4, [ 'foo', 'bar', 'baz' ] ); //=> []
     * dropLast( 3, 'ramda' );               //=> 'ra'
     */
    dropLast,
} from 'ramda';

export {
    /**
     * Returns a new list excluding all the tailing elements of a given list which
     * satisfy the supplied predicate function. It passes each value from the right
     * to the supplied predicate function, skipping elements until the predicate
     * function returns a `falsy` value. The predicate function is applied to one argument:
     * *(value)*.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} predicate The function to be called on each element
     * @param {Array} xs The collection to iterate over.
     * @returns {Array} A new array without any trailing elements that return `falsy` values from the `predicate`.
     * @see {@link takeLastWhile|takeLastWhile}
     * @see {@link addIndex|addIndex}
     * @see {@link drop|drop}
     * @see {@link dropWhile|dropWhile}
     * @example
     * const lteThree = x => x <= 3;
     * dropLastWhile( lteThree, [ 1, 2, 3, 4, 3, 2, 1 ] ); //=> [ 1, 2, 3, 4 ]
     * dropLastWhile( x => x !== 'd' , 'Ramda' ); //=> 'Ramd'
     */
    dropLastWhile,
} from 'ramda';

export {
    /**
     * Returns a new list without any consecutively repeating elements.
     * [`equals`](#equals) is used to determine equality.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {Array} list The array to consider.
     * @returns {Array} `list` without repeating elements.
     * @see {@link transduce|transduce}
     * @example
     * dropRepeats( [ 1, 1, 1, 2, 3, 4, 4, 2, 2 ] ); //=> [ 1, 2, 3, 4, 2 ]
     */
    dropRepeats,
} from 'ramda';

export {
    /**
     * Returns a new list without any consecutively repeating elements. Equality is determined by applying the supplied function to each pair of consecutive elements.
     *
     * @category List
     * @param {function} f A function that is passed a list element and returns a value to be compared.
     * @param {Array} list The array to consider.
     * @returns {Array} `list` without repeating elements.
     * @see {@link dropRepeatsWith|dropRepeatsWith}
     * @example
     * import { dropRepeatsBy } from '@blue/util';
     * const l = [ 1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3 ];
     * dropRepeatsBy( Math.abs, l ); //=> [ 1, 3, 4, -5, 3 ]
     */
    dropRepeatsBy,
} from 'ramda';

export {
    /**
     * Returns a new list without any consecutively repeating elements. Equality is
     * determined by applying the supplied predicate to each pair of consecutive elements. The
     * first element in a series of equal elements will be preserved.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} pred A predicate used to test whether two items are equal.
     * @param {Array} list The array to consider.
     * @returns {Array} `list` without repeating elements.
     * @see {@link transduce|transduce}
     * @example
     * import { dropRepeatsWith, eqBy } from '@blue/util';
     * const l = [ 1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3 ];
     * dropRepeatsWith( eqBy( Math.abs ), l ); //=> [ 1, 3, 4, -5, 3 ]
     */
    dropRepeatsWith,
} from 'ramda';

export {
    /**
     * Returns a new list excluding the leading elements of a given list which
     * satisfy the supplied predicate function. It passes each value to the supplied
     * predicate function, skipping elements while the predicate function returns
     * `true`. The predicate function is applied to one argument: *(value)*.
     *
     * Dispatches to the `dropWhile` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The function called per iteration.
     * @param {Array} xs The collection to iterate over.
     * @returns {Array} A new array.
     * @see {@link takeWhile|takeWhile}
     * @see {@link transduce|transduce}
     * @see {@link addIndex|addIndex}
     * @example
     * const lteTwo = x => x <= 2;
     * dropWhile( lteTwo, [ 1, 2, 3, 4, 3, 2, 1 ] ); //=> [ 3, 4, 3, 2, 1 ]
     * dropWhile( x => x !== 'd' , 'Ramda' ); //=> 'da'
     */
    dropWhile,
} from 'ramda';

export {
    /**
     * A function wrapping calls to the two functions in an `||` operation,
     * returning the result of the first function if it is truth-y and the result
     * of the second function otherwise. Note that this is short-circuited,
     * meaning that the second function will not be invoked if the first returns a
     * truth-y value.
     *
     * In addition to functions, `R.either` also accepts any fantasy-land compatible
     * applicative functor.
     *
     * @category Logic
     * @param {function} f a predicate
     * @param {function} g another predicate
     * @returns {function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
     * @see {@link or|or}
     * @example
     * const gt10 = x => x > 10;
     * const even = x => x % 2 === 0;
     * const f = either( gt10, even );
     * f( 101 ); //=> true
     * f( 8 ); //=> true
     *
     * either( Maybe.Just( false ), Maybe.Just( 55 ) ); // => Maybe.Just( 55 )
     * either( [ false, false, 'a' ], [ 11 ] ) // => [ 11, 11, "a" ]
     */
    either,
} from 'ramda';

export {
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
    empty,
} from 'ramda';

export {
    /**
     * Checks if a list ends with the provided sublist.
     *
     * Similarly, checks if a string ends with the provided substring.
     *
     * @category List
     * @param {*} suffix
     * @param {*} list
     * @returns {boolean}
     * @see {@link startsWith|startsWith}
     * @example
     * endsWith( 'c', 'abc' )                //=> true
     * endsWith( 'b', 'abc' )                //=> false
     * endsWith( [ 'c'], [ 'a', 'b', 'c' ] ) //=> true
     * endsWith( [ 'b'], [ 'a', 'b', 'c' ] ) //=> false
     */
    endsWith,
} from 'ramda';

export {
    /**
     * Takes a function and two values in its domain and returns `true` if the
     * values map to the same value in the codomain; `false` otherwise.
     *
     * @category Relation
     * @param {function} f
     * @param {*} x
     * @param {*} y
     * @returns {boolean}
     * @example
     * eqBy( Math.abs, 5, -5 ); //=> true
     */
    eqBy,
} from 'ramda';

export {
    /**
     * Reports whether two objects have the same value, in [`equals`](#equals)
     * terms, for the specified property. Useful as a curried predicate.
     *
     * @category Object
     * @param {string} prop The name of the property to compare
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {boolean}
     * @example
     * const o1 = { a: 1, b: 2, c: 3, d: 4 };
     * const o2 = { a: 10, b: 20, c: 3, d: 40 };
     * eqProps( 'a', o1, o2 ); //=> false
     * eqProps( 'c', o1, o2 ); //=> true
     */
    eqProps,
} from 'ramda';

export {
    /**
     * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
     * cyclical data structures.
     *
     * Dispatches symmetrically to the `equals` methods of both arguments, if
     * present.
     *
     * @category Relation
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @example
     * equals( 1, 1 ); //=> true
     * equals( 1, '1' ); //=> false
     * equals( [ 1, 2, 3 ], [ 1, 2, 3 ] ); //=> true
     *
     * const a = {}; a.v = a;
     * const b = {}; b.v = b;
     * equals( a, b ); //=> true
     */
    equals,
} from 'ramda';

export {
    /**
     * Creates a new object by recursively evolving a shallow copy of `object`,
     * according to the `transformation` functions. All non-primitive properties
     * are copied by reference.
     *
     * A `transformation` function will not be invoked if its corresponding key
     * does not exist in the evolved object.
     *
     * @category Object
     * @param {Object} transformations The object specifying transformation functions to apply to the object.
     * @param {Object} object The object to be transformed.
     * @returns {Object} The transformed object.
     * @example
     * import { add, evolve, trim } from '@blue/util';
     * const tomato = { firstName: '  Tomato ', data: { elapsed: 100, remaining: 1400 }, id: 123 };
     * const transformations = {
     *  firstName: trim,
     *  lastName: trim, // Will not get invoked.
     *  data: { elapsed: add( 1 ), remaining: add( -1 ) }
     * };
     * evolve( transformations, tomato ); //=> { firstName: 'Tomato', data: { elapsed: 101, remaining: 1399 }, id: 123 }
     */
    evolve,
} from 'ramda';

export {
    /**
     * Takes a predicate and a `Filterable`, and returns a new filterable of the
     * same type containing the members of the given filterable which satisfy the
     * given predicate. Filterable objects include plain objects or any object
     * that has a filter method such as `Array`.
     *
     * Dispatches to the `filter` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} pred
     * @param {Array} filterable
     * @returns {Array} Filterable
     * @see {@link reject|reject}
     * @see {@link transduce|transduce}
     * @see {@link addIndex|addIndex}
     * @example
     * const isEven = n => n % 2 === 0;
     * filter( isEven, [ 1, 2, 3, 4 ] ); //=> [2, 4]
     * filter( isEven, { a: 1, b: 2, c: 3, d: 4 } ); //=> { b: 2, d: 4 }
     */
    filter,
} from 'ramda';

export {
    /**
     * Returns the first element of the list which matches the predicate, or
     * `undefined` if no element matches.
     *
     * Dispatches to the `find` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The predicate function used to determine if the element is the desired one.
     * @param {Array} list The array to consider.
     * @returns {Object} The element found, or `undefined`.
     * @see {@link transduce|transduce}
     * @example
     * import { find, propEq } from '@blue/util';
     * const xs = [ { a: 1 }, { a: 2 }, { a: 3 } ];
     * find( propEq( 'a', 2 ) )( xs ); //=> { a: 2 }
     * find( propEq( 'a', 4 ) )( xs ); //=> undefined
     */
    find,
} from 'ramda';

export {
    /**
     * Returns the index of the first element of the list which matches the
     * predicate, or `-1` if no element matches.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The predicate function used to determine if the element is the desired one.
     * @param {Array} list The array to consider.
     * @returns {number} The index of the element found, or `-1`.
     * @see {@link transduce|transduce}
     * @example
     * import { findIndex, propEq } from '@blue/util';
     * const xs = [ { a: 1 }, { a: 2 }, { a: 3 } ];
     * findIndex( propEq( 'a', 2 ) )( xs ); //=> 1
     * findIndex( propEq( 'a', 4 ) )( xs ); //=> -1
     */
    findIndex,
} from 'ramda';

export {
    /**
     * Returns the last element of the list which matches the predicate, or
     * `undefined` if no element matches.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @sig (a -> Boolean) -> [a] -> a | undefined
     * @param {function} fn The predicate function used to determine if the element is the
     * desired one.
     * @param {Array} list The array to consider.
     * @returns {Object} The element found, or `undefined`.
     * @see {@link transduce|transduce}
     * @example
     * import { findLast, propEq } from '@blue/util';
     * const xs = [ { a: 1, b: 0 }, { a:1, b: 1 } ];
     * findLast( propEq( 'a', 1 ) )( xs ); //=> { a: 1, b: 1 }
     * findLast( propEq( 'a', 4 ) )( xs ); //=> undefined
     */
    findLast,
} from 'ramda';

export {
    /**
     * Returns the index of the last element of the list which matches the
     * predicate, or `-1` if no element matches.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The predicate function used to determine if the element is the desired one.
     * @param {Array} list The array to consider.
     * @returns {number} The index of the element found, or `-1`.
     * @see {@link transduce|transduce}
     * @example
     * import { findLastIndex, propEq } from '@blue/util';
     * const xs = [ { a: 1, b: 0 }, { a:1, b: 1 } ];
     * findLastIndex( propEq( 'a', 1 ) )( xs ); //=> 1
     * findLastIndex( propEq( 'a', 4 ) )( xs ); //=> -1
     */
    findLastIndex,
} from 'ramda';

export {
    /**
     * Returns a new list by pulling every item out of it (and all its sub-arrays)
     * and putting them in a new array, depth-first.
     *
     * @category List
     * @param {Array} list The array to consider.
     * @returns {Array} The flattened list.
     * @see {@link unnest|unnest}
     * @example
     * flatten( [ 1, 2, [ 3, 4 ], 5, [ 6, [ 7, 8, [ 9, [ 10, 11] , 12 ] ] ] ] );
     * //=> [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
     */
    flatten,
} from 'ramda';

export {
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
    flip,
} from 'ramda';

export {
    /**
     * Iterate over an input `list`, calling a provided function `fn` for each
     * element in the list.
     *
     * `fn` receives one argument: *(value)*.
     *
     * Note: `forEach` does not skip deleted or unassigned indices (sparse
     * arrays), unlike the native `Array.prototype.forEach` method. For more
     * details on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
     *
     * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
     * the original array. In some libraries this function is named `each`.
     *
     * Dispatches to the `forEach` method of the second argument, if present.
     *
     * @category List
     * @param {function} fn The function to invoke. Receives one argument, `value`.
     * @param {Array} list The list to iterate over.
     * @returns {Array} The original list.
     * @see {@link addIndex|addIndex}
     * @example
     * const printXPlusFive = x => console.log( x + 5 );
     * forEach( printXPlusFive, [ 1, 2, 3 ] ); //=> [1, 2, 3]
     * // logs 6
     * // logs 7
     * // logs 8
     */
    forEach,
} from 'ramda';

export {
    /**
     * Iterate over an input `object`, calling a provided function `fn` for each key and value in the object.
     *
     * `fn` receives three argument: *(value, key, obj)*.
     *
     * @category Object
     * @param {function} fn The function to invoke. Receives three argument, `value`, `key`, `obj`.
     * @param {Object} obj The object to iterate over.
     * @returns {Object} The original object.
     * @example
     * const printKeyConcatValue = ( value, key ) => console.log( key + ':' + value );
     * forEachObjIndexed( printKeyConcatValue, { x: 1, y: 2 } ); //=> { x: 1, y: 2 }
     * // logs x:1
     * // logs y:2
     */
    forEachObjIndexed,
} from 'ramda';

export {
    /**
     * Creates a new object from a list key-value pairs. If a key appears in multiple pairs, the rightmost pair is included in the object.
     *
     * @category List
     * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
     * @returns {Object} The object made by pairing up `keys` and `values`.
     * @see {@link toPairs|toPairs}
     * @see {@link pair|pair}
     * @example
     * fromPairs( [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ] ); //=> { a: 1, b: 2, c: 3 }
     */
    fromPairs,
} from 'ramda';

export {
    /**
     * Splits a list into sub-lists stored in an object, based on the result of
     * calling a String-returning function on each element, and grouping the
     * results according to values returned.
     *
     * Dispatches to the `groupBy` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn Function :: a -> String
     * @param {Array} list The array to group
     * @returns {Object} An object with the output of `fn` for keys, mapped to arrays of elements that produced that key when passed to `fn`.
     * @see {@link reduceBy|reduceBy}
     * @see {@link transduce|transduce}
     * @example
     * const byGrade = groupBy( function( student ){
     *  const score = student.score;
     *  return score < 65 ? 'F' :
     *      score < 70 ? 'D' :
     *      score < 80 ? 'C' :
     *      score < 90 ? 'B' : 'A';
     * } );
     * const students = [
     *  { name: 'Abby', score: 84 },
     *  { name: 'Eddy', score: 58 },
     *  // ...
     *  { name: 'Jack', score: 69 }
     * ];
     * byGrade( students );
     * // {
     * //   'A': [ { name: 'Dianne', score: 99 } ],
     * //   'B': [ { name: 'Abby', score: 84 } ],
     * //   // ...,
     * //   'F': [ { name: 'Eddy', score: 58 } ]
     * // }
     */
    groupBy,
} from 'ramda';

export {
    /**
     * Takes a list and returns a list of lists where each sublist's elements are
     * all satisfied pairwise comparison according to the provided function.
     * Only adjacent elements are passed to the comparison function.
     *
     * @category List
     * @param {function} fn Function for determining whether two given (adjacent) elements should be in the same group
     * @param {Array} list The array to group. Also accepts a string, which will be treated as a list of characters.
     * @returns {List} A list that contains sublists of elements, whose concatenations are equal to the original list.
     * @example
     * import { eqBy, equals, groupWith } from '@blue/util';
     * groupWith( equals, [ 0, 1, 1, 2, 3, 5, 8, 13, 21 ] );
     * //=> [ [ 0 ], [ 1, 1 ], [ 2 ], [ 3 ], [ 5 ], [ 8 ], [ 13 ], [ 21 ] ]
     * groupWith( ( a, b ) => a + 1 === b, [ 0, 1, 1, 2, 3, 5, 8, 13, 21 ] );
     * //=> [ [ 0, 1 ], [ 1, 2, 3 ], [ 5 ], [ 8 ], [ 13 ], [ 21 ] ]
     * groupWith( ( a, b ) => a % 2 === b % 2, [ 0, 1, 1, 2, 3, 5, 8, 13, 21 ] );
     * //=> [ [ 0 ], [ 1, 1 ], [ 2 ], [ 3, 5 ], [ 8 ], [ 13, 21 ] ]
     * groupWith( eqBy( isVowel ), 'aestiou' );
     * //=> [ 'ae', 'st', 'iou' ]
     */
    groupWith,
} from 'ramda';

export {
    /**
     * Returns `true` if the first argument is greater than the second; `false` otherwise.
     *
     * @category Relation
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @see {@link lt|lt}
     * @example
     * gt( 2, 1 ); //=> true
     * gt( 2, 2 ); //=> false
     * gt( 2, 3 ); //=> false
     * gt( 'a', 'z' ); //=> false
     * gt( 'z', 'a' ); //=> true
     */
    gt,
} from 'ramda';

export {
    /**
     * Returns `true` if the first argument is greater than or equal to the second;
     * `false` otherwise.
     *
     * @category Relation
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @see {@link lte|lte}
     * @example
     * gte( 2, 1 ); //=> true
     * gte( 2, 2 ); //=> true
     * gte( 2, 3 ); //=> false
     * gte( 'a', 'z' ); //=> false
     * gte( 'z', 'a' ); //=> true
     */
    gte,
} from 'ramda';

export {
    /**
     * Returns whether or not an object has an own property with the specified name
     *
     * @category Object
     * @param {string} prop The name of the property to check for.
     * @param {Object} obj The object to query.
     * @returns {boolean} Whether the property exists.
     * @example
     * import { __, has } from '@blue/util';
     * const hasName = has( 'name' );
     * hasName( { name: 'alice' } ); //=> true
     * hasName( { name: 'bob' } );   //=> true
     * hasName( {} );                //=> false
     * const point = { x: 0, y: 0 };
     * const pointHas = has( __, point );
     * pointHas( 'x' );  //=> true
     * pointHas( 'y' );  //=> true
     * pointHas( 'z' );  //=> false
     */
    has,
} from 'ramda';

export {
    /**
     * Returns whether or not an object or its prototype chain has a property with
     * the specified name
     *
     * @category Object
     * @param {string} prop The name of the property to check for.
     * @param {Object} obj The object to query.
     * @returns {boolean} Whether the property exists.
     * @example
     * import { __, has } from '@blue/util';
     * function Rectangle( width, height ){
     *  this.width = width;
     *  this.height = height;
     * }
     * Rectangle.prototype.area = function(){
     *  return this.width * this.height;
     * };
     *
     * const square = new Rectangle( 2, 2 );
     * hasIn( 'width', square ); //=> true
     * hasIn( 'area', square );  //=> true
     */
    hasIn,
} from 'ramda';

export {
    /**
     * Returns whether or not a path exists in an object. Only the object's
     * own properties are checked.
     *
     * @category Object
     * @param {Array} path The path to use.
     * @param {Object} obj The object to check the path in.
     * @returns {boolean} Whether the path exists.
     * @see {@link has|has}
     * @example
     * hasPath( [ 'a', 'b' ], { a: { b: 2 } } );         // => true
     * hasPath( [ 'a', 'b' ], { a: { b: undefined } } ); // => true
     * hasPath( [ 'a', 'b' ], { a: { c: 2 } } );         // => false
     * hasPath( [ 'a', 'b' ], {});                       // => false
     */
    hasPath,
} from 'ramda';

export {
    /**
     * Returns the first element of the given list or string. In some libraries
     * this function is named `first`.
     *
     * @category List
     * @param {Array | external:string} list
     * @returns {*}
     * @see {@link tail|tail}
     * @see {@link init|init}
     * @see {@link last|last}
     * @example
     * head( [ 'fi', 'fo', 'fum' ] ); //=> 'fi'
     * head( [] ); //=> undefined
     * head( 'abc' ); //=> 'a'
     * head( '' ); //=> ''
     */
    head,
} from 'ramda';

export {
    /**
     * Returns true if its arguments are identical, false otherwise. Values are
     * identical if they reference the same memory. `NaN` is identical to `NaN`;
     * `0` and `-0` are not identical.
     *
     * Note this is merely a curried version of ES6 `Object.is`.
     *
     * @category Relation
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @example
     * const o = {};
     * identical( o, o ); //=> true
     * identical( 1, 1 ); //=> true
     * identical( 1, '1' ); //=> false
     * identical( [], [] ); //=> false
     * identical( 0, -0 ); //=> false
     * identical( NaN, NaN ); //=> true
     */
    identical,
} from 'ramda';

export {
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
    identity,
} from 'ramda';

export {
    /**
     * Creates a function that will process either the `onTrue` or the `onFalse`
     * function depending upon the result of the `condition` predicate.
     *
     * @category Logic
     * @param {function} condition A predicate function
     * @param {function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
     * @param {function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
     * @returns {function} A new function that will process either the `onTrue` or the `onFalse` function depending upon the result of the `condition` predicate.
     * @see {@link unless|unless}
     * @see {@link when|when}
     * @see {@link cond|cond}
     * @example
     * import { assoc, has, ifElse, inc, lensProp, over } from '@blue/util';
     * const incCount = ifElse(
     *  has( 'count' ),
     *  over( lensProp( 'count' ), inc ),
     *  assoc( 'count', 1 )
     * );
     * incCount( {} );           //=> { count: 1 }
     * incCount( { count: 1 } ); //=> { count: 2 }
     */
    ifElse,
} from 'ramda';

export {
    /**
     * Increments its argument.
     *
     * @category Math
     * @param {number} n
     * @returns {number} n + 1
     * @see {@link dec|dec}
     * @example
     * inc( 42 ); //=> 43
     */
    inc,
} from 'ramda';

export {
    /**
     * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
     * terms, to at least one element of the given list; `false` otherwise.
     * Works also with strings.
     *
     * @category List
     * @param {Object} a The item to compare against.
     * @param {Array} list The array to consider.
     * @returns {boolean} `true` if an equivalent item is in the list, `false` otherwise.
     * @see {@link any|any}
     * @example
     * includes( 3, [ 1, 2, 3 ] ); //=> true
     * includes( 4, [ 1, 2, 3 ] ); //=> false
     * includes( { name: 'Fred' }, [ { name: 'Fred' } ] ); //=> true
     * includes( [ 42 ], [ [ 42 ] ] ); //=> true
     * includes( 'ba', 'banana' ); //=>true
     */
    includes,
} from 'ramda';

export {
    /**
     * Given a function that generates a key, turns a list of objects into an
     * object indexing the objects by the given key. Note that if multiple
     * objects generate the same value for the indexing key only the last value
     * will be included in the generated object.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn Function :: a -> String
     * @param {Array} array The array of objects to index
     * @returns {Object} An object indexing each array element by the given property.
     * @example
     * import { indexBy, prop } from '@blue/util';
     * const list = [ { id: 'xyz', title: 'A' }, { id: 'abc', title: 'B' } ];
     * indexBy( prop( 'id' ), list );
     * //=> { abc: { id: 'abc', title: 'B' }, xyz: { id: 'xyz', title: 'A' } }
     */
    indexBy,
} from 'ramda';

export {
    /**
     * Returns the position of the first occurrence of an item in an array, or -1
     * if the item is not included in the array. [`R.equals`](#equals) is used to
     * determine equality.
     *
     * @category List
     * @param {*} target The item to find.
     * @param {Array} xs The array to search in.
     * @returns {number} the index of the target, or -1 if the target is not found.
     * @see {@link lastIndexOf|lastIndexOf}
     * @example
     * indexOf( 3, [ 1, 2, 3, 4 ] ); //=> 2
     * indexOf( 10, [ 1, 2, 3, 4 ] ); //=> -1
     */
    indexOf,
} from 'ramda';

export {
    /**
     * Returns all but the last element of the given list or string.
     *
     * @category List
     * @param {*} list
     * @returns {*}
     * @see {@link last|last}
     * @see {@link head|head}
     * @see {@link tail|tail}
     * @example
     * init( [ 1, 2, 3 ] );  //=> [ 1, 2 ]
     * init( [ 1, 2 ] );     //=> [ 1 ]
     * init( [ 1 ] );        //=> []
     * init( [] );           //=> []
     * intest( 'abc' );  //=> 'ab'
     * intest( 'ab' );   //=> 'a'
     * intest( 'a' );    //=> ''
     * intest( '' );     //=> ''
     */
    init,
} from 'ramda';

export {
    /**
     * Takes a predicate `pred`, a list `xs`, and a list `ys`, and returns a list
     * `xs'` comprising each of the elements of `xs` which is equal to one or more
     * elements of `ys` according to `pred`.
     *
     * `pred` must be a binary function expecting an element from each list.
     *
     * `xs`, `ys`, and `xs'` are treated as sets, semantically, so ordering should
     * not be significant, but since `xs'` is ordered the implementation guarantees
     * that its values are in the same order as they appear in `xs`. Duplicates are
     * not removed, so `xs'` may contain duplicates if `xs` contains duplicates.
     *
     * @category Relation
     * @param {function} pred
     * @param {Array} xs
     * @param {Array} ys
     * @returns {Array}
     * @see {@link intersection|intersection}
     * @example
     * innerJoin( ( record, id ) => record.id === id,
     *  [
     *      { id: 824, name: 'Richie Furay' },
     *      { id: 956, name: 'Dewey Martin' },
     *      { id: 313, name: 'Bruce Palmer' },
     *      { id: 456, name: 'Stephen Stills' },
     *      { id: 177, name: 'Neil Young' }
     *  ],
     *  [ 177, 456, 999 ]
     * );
     * //=> [ { id: 456, name: 'Stephen Stills' }, { id: 177, name: 'Neil Young' } ]
     */
    innerJoin,
} from 'ramda';

export {
    /**
     * Inserts the supplied element into the list, at the specified `index`. _Note that
     * this is not destructive_: it returns a copy of the list with the changes.
     * <small>No lists have been harmed in the application of this function.</small>
     *
     * @category List
     * @param {number} index The position to insert the element
     * @param {*} elt The element to insert into the Array
     * @param {Array} list The list to insert into
     * @returns {Array} A new Array with `elt` inserted at `index`.
     * @example
     * insert( 2 , 'x', [ 1, 2, 3, 4 ] ); //=> [ 1, 2, 'x', 3, 4 ]
     */
    insert,
} from 'ramda';

export {
    /**
     * Inserts the sub-list into the list, at the specified `index`. _Note that this is not
     * destructive_: it returns a copy of the list with the changes.
     * <small>No lists have been harmed in the application of this function.</small>
     *
     * @category List
     * @param {number} index The position to insert the sub-list
     * @param {Array} elts The sub-list to insert into the Array
     * @param {Array} list The list to insert the sub-list into
     * @returns {Array} A new Array with `elts` inserted starting at `index`.
     * @example
     * insertAll( 2, [ 'x', 'y', 'z' ], [ 1, 2, 3, 4 ] ); //=> [ 1, 2, 'x', 'y', 'z', 3, 4 ]
     */
    insertAll,
} from 'ramda';

export {
    /**
     * Combines two lists into a set (i.e. no duplicates) composed of those elements common to both lists.
     *
     * @category Relation
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @returns {Array} The list of elements found in both `list1` and `list2`.
     * @see {@link innerJoin|innerJoin}
     * @example
     * intersection( [ 1, 2, 3, 4 ], [ 7, 6, 5, 4, 3 ] ); //=> [4, 3]
     */
    intersection,
} from 'ramda';

export {
    /**
     * Creates a new list with the separator interposed between elements.
     *
     * Dispatches to the `intersperse` method of the second argument, if present.
     *
     * @category List
     * @param {*} separator The element to add to the list.
     * @param {Array} list The list to be interposed.
     * @returns {Array} The new list.
     * @example
     * intersperse( 'a', [ 'b', 'n', 'n', 's' ] ); //=> [ 'b', 'a', 'n', 'a', 'n', 'a', 's' ]
     */
    intersperse,
} from 'ramda';

export {
    /**
     * Transforms the items of the list with the transducer and appends the
     * transformed items to the accumulator using an appropriate iterator function
     * based on the accumulator type.
     *
     * The accumulator can be an array, string, object or a transformer. Iterated
     * items will be appended to arrays and concatenated to strings. Objects will
     * be merged directly or 2-item arrays will be merged as key, value pairs.
     *
     * The accumulator can also be a transformer object that provides a 2-arity
     * reducing iterator function, step, 0-arity initial value function, init, and
     * 1-arity result extraction function result. The step function is used as the
     * iterator function in reduce. The result function is used to convert the
     * final accumulator into the return type and in most cases is R.identity. The
     * init function is used to provide the initial accumulator.
     *
     * The iteration is performed with [`reduce`](#reduce) after initializing the
     * transducer.
     *
     * @category List
     * @param {*} acc The initial accumulator value.
     * @param {function} xf The transducer function. Receives a transformer and returns a transformer.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link transduce|transduce}
     * @example
     * import { add, compose, map, into, take } from '@blue/util';
     * const numbers = [ 1, 2, 3, 4 ];
     * const transducer = compose( map( add( 1 ) ), take( 2 ) );
     *
     * into( [], transducer, numbers ); //=> [ 2, 3 ]
     *
     * const intoArray = into( [] );
     * intoArray( transducer, numbers ); //=> [ 2, 3 ]
     */
    into,
} from 'ramda';

export {
    /**
     * Same as [`invertObj`](#invertObj), however this accounts for objects with
     * duplicate values by putting the values into an array.
     *
     * @category Object
     * @param {Object} obj The object or array to invert
     * @returns {Object} out A new object with keys in an array.
     * @see {@link invertObj|invertObj}
     * @example
     * const raceResultsByFirstName = {
     *  first: 'alice',
     *  second: 'jake',
     *  third: 'alice',
     * };
     * invert( raceResultsByFirstName );
     * //=> { 'alice': [ 'first', 'third' ], 'jake':[ 'second' ] }
     */
    invert,
} from 'ramda';

export {
    /**
     * Returns a new object with the keys of the given object as values, and the
     * values of the given object, which are coerced to strings, as keys. Note
     * that the last key found is preferred when handling the same value.
     *
     * @category Object
     * @param {Object} obj The object or array to invert
     * @returns {Object} out A new object
     * @see {@link invert|invert}
     * @example
     * const raceResults = {
     *  first: 'alice',
     *  second: 'jake'
     * };
     * invertObj( raceResults );
     * //=> { 'alice': 'first', 'jake':'second' }
     *
     * // Alternatively:
     * const raceResults = [ 'alice', 'jake' ];
     * invertObj( raceResults );
     * //=> { 'alice': '0', 'jake':'1' }
     */
    invertObj,
} from 'ramda';

export {
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
    invoker,
} from 'ramda';

export {
    /**
     * See if an object (`val`) is an instance of the supplied constructor. This
     * function will check up the inheritance chain, if any.
     *
     * @category Type
     * @param {Object} ctor A constructor
     * @param {*} val The value to test
     * @returns {boolean}
     * @example
     * is( Object, {} ); //=> true
     * is( Number, 1 ); //=> true
     * is( Object, 1 ); //=> false
     * is( String, 's' ); //=> true
     * is( String, new String('') ); //=> true
     * is( Object, new String('') ); //=> true
     * is( Object, 's' ); //=> false
     * is( Number, {} ); //=> false
     */
    is,
} from 'ramda';

export {
    /**
     * Returns `true` if the given value is its type's empty value; `false`
     * otherwise.
     *
     * @category Logic
     * @param {*} x The value to test
     * @returns {boolean} `true` if `x` is empty, `false` otherwise
     * @see {@link empty|empty}
     * @see {@link isNotEmpty|isNotEmpty}
     * @example
     * isEmpty( [ 1, 2, 3 ] );           //=> false
     * isEmpty( [] );                    //=> true
     * isEmpty( '' );                    //=> true
     * isEmpty( null );                  //=> false
     * isEmpty( {} );                    //=> true
     * isEmpty( { length: 0 } );         //=> false
     * isEmpty( Uint8Array.from( '' ) ); //=> true
     */
    isEmpty,
} from 'ramda';

export {
    /**
     * Checks if the input value is `null` or `undefined`.
     *
     * @category Type
     * @param {*} x The value to test.
     * @returns {boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
     * @example
     * isNil( null ); //=> true
     * isNil( undefined ); //=> true
     * isNil( 0 ); //=> false
     * isNil( [] ); //=> false
     */
    isNil,
} from 'ramda';

export {
    /**
     * Returns `false` if the given value is its type's empty value; `true`
     * otherwise.
     *
     * @category Logic
     * @param {*} x The value to test
     * @returns {boolean} `false` if `x` is empty, `true` otherwise
     * @see {@link empty|empty}
     * @see {@link isEmpty|isEmpty}
     * @example
     * isNotEmpty( [ 1, 2, 3 ] );           //=> true
     * isNotEmpty( [] );                    //=> false
     * isNotEmpty( '' );                    //=> false
     * isNotEmpty( null );                  //=> true
     * isNotEmpty( {} );                    //=> false
     * isNotEmpty( { length: 0 } );         //=> true
     * isNotEmpty( Uint8Array.from( '' ) ); //=> false
     */
    isNotEmpty,
} from 'ramda';

export {
    /**
     * Checks if the input value is not `null` and not `undefined`.
     *
     * @category Type
     * @param {*} x The value to test.
     * @returns {boolean} `true` if `x` is not `undefined` or not `null`, otherwise `false`.
     * @see {@link isNil|isNil}
     * @example
     * isNotNil( null ); //=> false
     * isNotNil( undefined ); //=> false
     * isNotNil( 0 ); //=> true
     * isNotNil( [] ); //=> true
     */
    isNotNil,
} from 'ramda';

export {
    /**
     * Returns a string made by inserting the `separator` between each element and
     * concatenating all the elements into a single string.
     *
     * @category List
     * @param {Number|String} separator The string used to separate the elements.
     * @param {Array} xs The elements to join into a string.
     * @returns {string} str The string made by concatenating `xs` with `separator`.
     * @see {@link split|split}
     * @example
     * const spacer = join( ' ' );
     * spacer( [ 'a', 2, 3.4 ] );   //=> 'a 2 3.4'
     * join( '|', [ 1, 2, 3 ] );    //=> '1|2|3'
     */
    join,
} from 'ramda';

export {
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
    juxt,
} from 'ramda';

export {
    /**
     * Returns a list containing the names of all the enumerable own properties of
     * the supplied object.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @category Object
     * @param {Object} obj The object to extract properties from
     * @returns {Array} An array of the object's own properties.
     * @see {@link keysIn|keysIn}
     * @see {@link values|values}
     * @example
     * keys( { a: 1, b: 2, c: 3 } ); //=> [ 'a', 'b', 'c' ]
     */
    keys,
} from 'ramda';

export {
    /**
     * Returns a list containing the names of all the properties of the supplied
     * object, including prototype properties.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @category Object
     * @param {Object} obj The object to extract properties from
     * @returns {Array} An array of the object's own and prototype properties.
     * @see {@link keys|keys}
     * @see {@link valuesIn|valuesIn}
     * @example
     * const F = function(){ this.x = 'X'; };
     * F.prototype.y = 'Y';
     * const f = new F();
     * keysIn( f ); //=> [ 'x', 'y' ]
     */
    keysIn,
} from 'ramda';

export {
    /**
     * Returns the last element of the given list or string.
     *
     * @category List
     * @sig String -> String
     * @param {*} list
     * @returns {*}
     * @see {@link init|init}
     * @see {@link head|head}
     * @see {@link tail|tail}
     * @example
     * last( [ 'fi', 'fo', 'fum' ] ); //=> 'fum'
     * last( [] ); //=> undefined
     * last( 'abc' ); //=> 'c'
     * last( '' ); //=> ''
     */
    last,
} from 'ramda';

export {
    /**
     * Returns the position of the last occurrence of an item in an array, or -1 if
     * the item is not included in the array. [`R.equals`](#equals) is used to
     * determine equality.
     *
     * @category List
     * @param {*} target The item to find.
     * @param {Array} xs The array to search in.
     * @returns {number} the index of the target, or -1 if the target is not found.
     * @see {@link indexOf|indexOf}
     * @example
     * lastIndexOf( 3, [ -1, 3, 3, 0, 1, 2, 3, 4 ] ); //=> 6
     * lastIndexOf( 10, [ 1, 2, 3, 4 ] ); //=> -1
     */
    lastIndexOf,
} from 'ramda';

export {
    /**
     * Returns the number of elements in the array by returning `list.length`.
     *
     * @category List
     * @param {Array} list The array to inspect.
     * @returns {number} The length of the array.
     * @example
     * length( [] ); //=> 0
     * length( [ 1, 2, 3 ] ); //=> 3
     */
    length,
} from 'ramda';

export {
    /**
     * Returns a lens for the given getter and setter functions. The getter "gets"
     * the value of the focus; the setter "sets" the value of the focus. The setter
     * should not mutate the data structure.
     *
     * @category Object
     * @param {function} getter
     * @param {function} setter
     * @returns {Lens}
     * @see {@link view|view}
     * @see {@link set|set}
     * @see {@link over|over}
     * @see {@link lensIndex|lensIndex}
     * @see {@link lensProp|lensProp}
     * @example
     * import { assoc, lens, negate, over, prop, set, view } from '@blue/util';
     * const xLens = lens( prop( 'x' ), assoc( 'x' ) );
     * view( xLens, { x: 1, y: 2 } );          //=> 1
     * set( xLens, 4, { x: 1, y: 2 } );        //=> { x: 4, y: 2 }
     * over( xLens, negate, { x: 1, y: 2 } );  //=> { x: -1, y: 2 }
     */
    lens,
} from 'ramda';

export {
    /**
     * Returns a lens whose focus is the specified index.
     *
     * @category Object
     * @param {number} n
     * @returns {Lens}
     * @see {@link view|view}
     * @see {@link set|set}
     * @see {@link over|over}
     * @see {@link nth|nth}
     * @example
     * import { lensIndex, over, set, toUpper, view } from '@blue/util';
     * const headLens = lensIndex( 0 );
     * view( headLens, [ 'a', 'b', 'c' ] );          //=> 'a'
     * set( headLens, 'x', [ 'a', 'b', 'c' ] );      //=> [ 'x', 'b', 'c' ]
     * over( headLens, toUpper, [ 'a', 'b', 'c' ] ); //=> [ 'A', 'b', 'c' ]
     */
    lensIndex,
} from 'ramda';

export {
    /**
     * Returns a lens whose focus is the specified path.
     *
     * @category Object
     * @param {Array} path The path to use.
     * @returns {Lens}
     * @see {@link view|view}
     * @see {@link set|set}
     * @see {@link over|over}
     * @example
     * import { lensPath, negate, over, set, view } from '@blue/util';
     * const xHeadYLens = lensPath( [ 'x', 0, 'y' ] );
     *
     * view( xHeadYLens, { x: [ { y: 2, z: 3 }, { y: 4, z: 5 } ] } );
     * //=> 2
     * set( xHeadYLens, 1, { x: [ { y: 2, z: 3 }, { y: 4, z: 5 } ] } );
     * //=> { x: [ { y: 1, z: 3 }, { y: 4, z: 5 } ] }
     * over( xHeadYLens, negate, { x: [ { y: 2, z: 3 }, { y: 4, z: 5 } ] } );
     * //=> { x: [ { y: -2, z: 3 }, { y: 4, z: 5 } ] }
     */
    lensPath,
} from 'ramda';

export {
    /**
     * Returns a lens whose focus is the specified property.
     *
     * @category Object
     * @param {string} k
     * @returns {Lens}
     * @see {@link view|view}
     * @see {@link set|set}
     * @see {@link over|over}
     * @example
     * import { lensProp, negate, over, set, view } from '@blue/util';
     * const xLens = lensProp( 'x' );
     * view( xLens, { x: 1, y: 2 } );          //=> 1
     * set( xLens, 4, { x: 1, y: 2 } );        //=> { x: 4, y: 2 }
     * over( xLens, negate, { x: 1, y: 2 } );  //=> { x: -1, y: 2 }
     */
    lensProp,
} from 'ramda';

export {
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
    lift,
} from 'ramda';

export {
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
    liftN,
} from 'ramda';

export {
    /**
     * Returns `true` if the first argument is less than the second; `false` otherwise.
     *
     * @category Relation
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @see {@link gt|gt}
     * @example
     * lt( 2, 1 ); //=> false
     * lt( 2, 2 ); //=> false
     * lt( 2, 3 ); //=> true
     * lt( 'a', 'z' ); //=> true
     * lt( 'z', 'a' ); //=> false
     */
    lt,
} from 'ramda';

export {
    /**
     * Returns `true` if the first argument is less than or equal to the second;
     * `false` otherwise.
     *
     * @category Relation
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     * @see {@link gte|gte}
     * @example
     * lte( 2, 1 ); //=> false
     * lte( 2, 2 ); //=> true
     * lte( 2, 3 ); //=> true
     * lte( 'a', 'z' ); //=> true
     * lte( 'z', 'a' ); //=> false
     */
    lte,
} from 'ramda';

export {
    /**
     * Takes a function and
     * a [functor](https://github.com/fantasyland/fantasy-land#functor),
     * applies the function to each of the functor's values, and returns
     * a functor of the same shape.
     *
     * Ramda provides suitable `map` implementations for `Array` and `Object`,
     * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
     *
     * Dispatches to the `map` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * Also treats functions as functors and will compose them together.
     *
     * @category List
     * @param {function} fn The function to be called on every element of the input `list`.
     * @param {Array} list The list to be iterated over.
     * @returns {Array} The new list.
     * @see {@link transduce|transduce}
     * @see {@link addIndex|addIndex}
     * @example
     * const double = x => x * 2;
     * map( double, [ 1, 2, 3 ] ); //=> [ 2, 4, 6 ]
     * map( double, { x: 1, y: 2, z: 3 } ); //=> { x: 2, y: 4, z: 6 }
     */
    map,
} from 'ramda';

export {
    /**
     * The `mapAccum` function behaves like a combination of map and reduce; it
     * applies a function to each element of a list, passing an accumulating
     * parameter from left to right, and returning a final value of this
     * accumulator together with the new list.
     *
     * The iterator function receives two arguments, *acc* and *value*, and should
     * return a tuple *[acc, value]*.
     *
     * @category List
     * @param {function} fn The function to be called on every element of the input `list`.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link scan|scan}
     * @see {@link addIndex|addIndex}
     * @see {@link mapAccumRight|mapAccumRight}
     * @example
     * const digits = [ '1', '2', '3', '4' ];
     * const appender = ( a, b ) => [ a + b, a + b ];
     * mapAccum( appender, 0, digits ); //=> [ '01234', [ '01', '012', '0123', '01234' ] ]
     */
    mapAccum,
} from 'ramda';

export {
    /**
     * The `mapAccumRight` function behaves like a combination of map and reduce; it
     * applies a function to each element of a list, passing an accumulating
     * parameter from right to left, and returning a final value of this
     * accumulator together with the new list.
     *
     * Similar to [`mapAccum`](#mapAccum), except moves through the input list from
     * the right to the left.
     *
     * The iterator function receives two arguments, *acc* and *value*, and should
     * return a tuple *[acc, value]*.
     *
     * @category List
     * @param {function} fn The function to be called on every element of the input `list`.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link addIndex|addIndex}
     * @see {@link mapAccum|mapAccum}
     * @example
     * const digits = [ '1', '2', '3', '4' ];
     * const appender = ( a, b ) => [ b + a, b + a ];
     * mapAccumRight( appender, 5, digits ); //=> [ '12345', [ '12345', '2345', '345', '45' ] ]
     */
    mapAccumRight,
} from 'ramda';

export {
    /**
     * An Object-specific version of [`map`](#map). The function is applied to three
     * arguments: *(value, key, obj)*. If only the value is significant, use
     * [`map`](#map) instead.
     *
     * @category Object
     * @param {function} fn
     * @param {Object} obj
     * @returns {Object}
     * @see {@link map|map}
     * @example
     * const xyz = { x: 1, y: 2, z: 3 };
     * const prependKeyAndDouble = ( num, key, obj ) => key + ( num * 2 );
     * mapObjIndexed( prependKeyAndDouble, xyz ); //=> { x: 'x2', y: 'y4', z: 'z6' }
     */
    mapObjIndexed,
} from 'ramda';

export {
    /**
     * Tests a regular expression against a String. Note that this function will
     * return an empty array when there are no matches. This differs from
     * [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
     * which returns `null` when there are no matches.
     *
     * @category String
     * @param {RegExp} rx A regular expression.
     * @param {string} str The string to match against
     * @returns {Array} The list of matches or empty array.
     * @see {@link test|test}
     * @example
     * match( /([a-z]a)/g, 'bananas' ); //=> [ 'ba', 'na', 'na' ]
     * match( /a/, 'b' ); //=> []
     * match( /a/, null ); //=> TypeError: null does not have a method named "match"
     */
    match,
} from 'ramda';

export {
    /**
     * `mathMod` behaves like the modulo operator should mathematically, unlike the
     * `%` operator (and by extension, [`R.modulo`](#modulo)). So while
     * `-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
     * arguments, and returns NaN when the modulus is zero or negative.
     *
     * @category Math
     * @param {number} m The dividend.
     * @param {number} p the modulus.
     * @returns {number} The result of `b mod a`.
     * @see {@link modulo|modulo}
     * @example
     * import { __, mathMod } from '@blue/util';
     * mathMod( -17, 5 );  //=> 3
     * mathMod( 17, 5 );   //=> 2
     * mathMod( 17, -5 );  //=> NaN
     * mathMod( 17, 0 );   //=> NaN
     * mathMod( 17.2, 5 ); //=> NaN
     * mathMod( 17, 5.3 ); //=> NaN
     *
     * const clock = mathMod( __, 12 );
     * clock( 15 ); //=> 3
     * clock( 24 ); //=> 0
     *
     * const seventeenMod = mathMod( 17 );
     * seventeenMod( 3 );  //=> 2
     * seventeenMod( 4 );  //=> 1
     * seventeenMod( 10 ); //=> 7
     */
    mathMod,
} from 'ramda';

export {
    /**
     * Returns the larger of its two arguments.
     *
     * @category Relation
     * @param {*} a
     * @param {*} b
     * @returns {*}
     * @see {@link maxBy|maxBy}
     * @see {@link min|min}
     * @example
     * max( 789, 123 ); //=> 789
     * max( 'a', 'b' ); //=> 'b'
     */
    max,
} from 'ramda';

export {
    /**
     * Takes a function and two values, and returns whichever value produces the
     * larger result when passed to the provided function.
     *
     * @category Relation
     * @param {function} f
     * @param {*} a
     * @param {*} b
     * @returns {*}
     * @see {@link max|max}
     * @see {@link minBy|minBy}
     * @example
     * import { maxBy, reduce } from '@blue/util';
     * //  square :: Number -> Number
     * const square = n => n * n;
     * maxBy( square, -3, 2 ); //=> -3
     * reduce( maxBy( square ), 0, [ 3, -5, 4, 1, -2 ] ); //=> -5
     * reduce( maxBy( square ), 0, [] ); //=> 0
     */
    maxBy,
} from 'ramda';

export {
    /**
     * Returns the mean of the given list of numbers.
     *
     * @category Math
     * @param {Array} list
     * @returns {number}
     * @see {@link median|median}
     * @example
     * mean( [ 2, 7, 9 ] ); //=> 6
     * mean( [] ); //=> NaN
     */
    mean,
} from 'ramda';

export {
    /**
     * Returns the median of the given list of numbers.
     *
     * @category Math
     * @param {Array} list
     * @returns {number}
     * @see {@link mean|mean}
     * @example
     * median( [ 2, 9, 7 ] ); //=> 7
     * median( [ 7, 2, 10, 9 ] ); //=> 8
     * median( [] ); //=> NaN
     */
    median,
} from 'ramda';

export {
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
    memoizeWith,
} from 'ramda';

export {
    /**
     * Merges a list of objects together into one object.
     *
     * @category List
     * @param {Array} list An array of objects
     * @returns {Object} A merged object.
     * @see {@link reduce|reduce}
     * @example
     * mergeAll( [ { foo: 1 }, { bar: 2 }, { baz: 3 } ] ); //=> { foo: 1, bar: 2, baz: 3 }
     * mergeAll( [ { foo: 1 }, { foo: 2 }, { bar: 2 } ] ); //=> { foo: 2, bar: 2 }
     */
    mergeAll,
} from 'ramda';

export {
    /**
     * Creates a new object with the own properties of the first object merged with
     * the own properties of the second object. If a key exists in both objects:
     * - and both values are objects, the two values will be recursively merged
     * - otherwise the value from the first object will be used.
     *
     * @category Object
     * @param {Object} lObj
     * @param {Object} rObj
     * @returns {Object}
     * @see {@link merge|merge}
     * @see {@link mergeDeepRight|mergeDeepRight}
     * @see {@link mergeDeepWith|mergeDeepWith}
     * @see {@link mergeDeepWithKey|mergeDeepWithKey}
     * @example
     * mergeDeepLeft(
     *  { name: 'fred', age: 10, contact: { email: 'moo@example.com' } },
     *  { age: 40, contact: { email: 'baa@example.com' } }
     * );
     * //=> { name: 'fred', age: 10, contact: { email: 'moo@example.com' }}
     */
    mergeDeepLeft,
} from 'ramda';

export {
    /**
     * Creates a new object with the own properties of the first object merged with
     * the own properties of the second object. If a key exists in both objects:
     * - and both values are objects, the two values will be recursively merged
     * - otherwise the value from the second object will be used.
     *
     * @category Object
     * @param {Object} lObj
     * @param {Object} rObj
     * @returns {Object}
     * @see {@link merge|merge}
     * @see {@link mergeDeepLeft|mergeDeepLeft}
     * @see {@link mergeDeepWith|mergeDeepWith}
     * @see {@link mergeDeepWithKey|mergeDeepWithKey}
     * @example
     * mergeDeepRight(
     *  { name: 'fred', age: 10, contact: { email: 'moo@example.com' } },
     *  { age: 40, contact: { email: 'baa@example.com' } }
     * );
     * //=> { name: 'fred', age: 40, contact: { email: 'baa@example.com' } }
     */
    mergeDeepRight,
} from 'ramda';

export {
    /**
     * Creates a new object with the own properties of the two provided objects.
     * If a key exists in both objects:
     * - and both associated values are also objects then the values will be
     *   recursively merged.
     * - otherwise the provided function is applied to associated values using the
     *   resulting value as the new value associated with the key.
     * If a key only exists in one object, the value will be associated with the key
     * of the resulting object.
     *
     * @category Object
     * @param {function} fn
     * @param {Object} lObj
     * @param {Object} rObj
     * @returns {Object}
     * @see {@link mergeWith|mergeWith}
     * @see {@link mergeDeepWithKey|mergeDeepWithKey}
     * @example
     * import { concat, mergeDeepWith } from '@blue/util';
     * mergeDeepWith( concat,
     *  { a: true, c: { values: [ 10, 20 ] } },
     *  { b: true, c: { values: [ 15, 35 ] } }
     * );
     * //=> { a: true, b: true, c: { values: [10, 20, 15, 35] }}
     */
    mergeDeepWith,
} from 'ramda';

export {
    /**
     * Creates a new object with the own properties of the two provided objects.
     * If a key exists in both objects:
     * - and both associated values are also objects then the values will be
     *   recursively merged.
     * - otherwise the provided function is applied to the key and associated values
     *   using the resulting value as the new value associated with the key.
     * If a key only exists in one object, the value will be associated with the key
     * of the resulting object.
     *
     * @category Object
     * @param {function} fn
     * @param {Object} lObj
     * @param {Object} rObj
     * @returns {Object}
     * @see {@link mergeWithKey|mergeWithKey}
     * @see {@link mergeDeepWith|mergeDeepWith}
     * @example
     * import { concat, mergeDeepWith } from '@blue/util';
     * let concatValues = ( k, l, r ) => k == 'values' ? concat( l, r ) : r
     * mergeDeepWithKey( concatValues,
     *  { a: true, c: { thing: 'foo', values: [ 10, 20 ] } },
     *  { b: true, c: { thing: 'bar', values: [ 15, 35 ] } }
     * );
     * //=> { a: true, b: true, c: { thing: 'bar', values: [ 10, 20, 15, 35 ] } }
     */
    mergeDeepWithKey,
} from 'ramda';

export {
    /**
     * Create a new object with the own properties of the first object merged with
     * the own properties of the second object. If a key exists in both objects,
     * the value from the first object will be used.
     *
     * @category Object
     * @param {Object} l
     * @param {Object} r
     * @returns {Object}
     * @see {@link mergeRight|mergeRight}
     * @see {@link mergeDeepLeft|mergeDeepLeft}
     * @see {@link mergeWith|mergeWith}
     * @see {@link mergeWithKey|mergeWithKey}
     * @example
     * mergeLeft( { 'age': 40 }, { 'name': 'fred', 'age': 10 } );
     * //=> { 'name': 'fred', 'age': 40 }
     *
     * const resetToDefault = mergeLeft( { x: 0 } );
     * resetToDefault( { x: 5, y: 2 } );
     * //=> { x: 0, y: 2 }
     */
    mergeLeft,
} from 'ramda';

export {
    /**
     * Create a new object with the own properties of the first object merged with
     * the own properties of the second object. If a key exists in both objects,
     * the value from the second object will be used.
     *
     * @category Object
     * @param {Object} l
     * @param {Object} r
     * @returns {Object}
     * @see {@link mergeLeft|mergeLeft}
     * @see {@link mergeDeepRight|mergeDeepRight}
     * @see {@link mergeWith|mergeWith}
     * @see {@link mergeWithKey|mergeWithKey}
     * @example
     * mergeRight( { 'name': 'fred', 'age': 10 }, { 'age': 40 } );
     * //=> { 'name': 'fred', 'age': 40 }
     *
     * const withDefaults = mergeRight( { x : 0, y: 0 } );
     * withDefaults( { y: 2 } ); //=> { x: 0, y: 2 }
     */
    mergeRight,
} from 'ramda';

export {
    /**
     * Creates a new object with the own properties of the two provided objects. If
     * a key exists in both objects, the provided function is applied to the values
     * associated with the key in each object, with the result being used as the
     * value associated with the key in the returned object.
     *
     * @category Object
     * @param {function} fn
     * @param {Object} l
     * @param {Object} r
     * @returns {Object}
     * @see {@link mergeDeepWith|mergeDeepWith}
     * @see {@link merge|merge}
     * @see {@link mergeWithKey|mergeWithKey}
     * @example
     * import { concat, mergeWith } from '@blue/util';
     * mergeWith( concat,
     *  { a: true, values: [ 10, 20 ] },
     *  { b: true, values: [ 15, 35 ] }
     * );
     * //=> { a: true, b: true, values: [ 10, 20, 15, 35 ] }
     */
    mergeWith,
} from 'ramda';

export {
    /**
     * Creates a new object with the own properties of the two provided objects.
     * If a key exists in both objects:
     * - and both associated values are also objects then the values will be
     *   recursively merged.
     * - otherwise the provided function is applied to the key and associated values
     *   using the resulting value as the new value associated with the key.
     * If a key only exists in one object, the value will be associated with the key
     * of the resulting object.
     *
     * @category Object
     * @param {function} fn
     * @param {Object} lObj
     * @param {Object} rObj
     * @returns {Object}
     * @see {@link mergeWithKey|mergeWithKey}
     * @see {@link mergeDeepWith|mergeDeepWith}
     * @example
     * import { concat, mergeWith } from '@blue/util';
     * let concatValues = ( k, l, r ) => k == 'values' ? concat( l, r ) : r
     * mergeDeepWithKey( concatValues,
     *  { a: true, c: { thing: 'foo', values: [ 10, 20 ] } },
     *  { b: true, c: { thing: 'bar', values: [ 15, 35 ] } }
     * );
     * //=> { a: true, b: true, c: { thing: 'bar', values: [ 10, 20, 15, 35 ] } }
     */
    mergeWithKey,
} from 'ramda';

export {
    /**
     * Returns the smaller of its two arguments.
     *
     * @category Relation
     * @param {*} a
     * @param {*} b
     * @returns {*}
     * @see {@link minBy|minBy}
     * @see {@link max|max}
     * @example
     * min( 789, 123 ); //=> 123
     * min( 'a', 'b' ); //=> 'a'
     */
    min,
} from 'ramda';

export {
    /**
     * Takes a function and two values, and returns whichever value produces the
     * smaller result when passed to the provided function.
     *
     * @category Relation
     * @param {function} f
     * @param {*} a
     * @param {*} b
     * @returns {*}
     * @see {@link min|min}
     * @see {@link maxBy|maxBy}
     * @example
     * import { minBy, reduce } from '@blue/util';
     * //  square :: Number -> Number
     * const square = n => n * n;
     * minBy( square, -3, 2 ); //=> 2
     * reduce( minBy( square ), Infinity, [ 3, -5, 4, 1, -2 ] ); //=> 1
     * reduce( minBy( square ), Infinity, [] ); //=> Infinity
     */
    minBy,
} from 'ramda';

export {
    /**
     * Divides the first parameter by the second and returns the remainder. Note
     * that this function preserves the JavaScript-style behavior for modulo. For
     * mathematical modulo see [`mathMod`](#mathMod).
     *
     * @category Math
     * @param {number} a The value to the divide.
     * @param {number} b The pseudo-modulus
     * @returns {number} The result of `b % a`.
     * @see {@link mathMod|mathMod}
     * @example
     * import { __, modulo } from '@blue/util';
     * modulo( 17, 3 );
     * //=> 2
     * // JS behavior:
     * modulo( -17, 3 );
     * //=> -2
     * modulo( 17, -3 );
     * //=> 2
     *
     * const isOdd = modulo( __, 2 );
     * isOdd( 42 );
     * //=> 0
     * isOdd( 21 );
     * //=> 1
     */
    modulo,
} from 'ramda';

export {
    /**
     * Multiplies two numbers. Equivalent to `a * b` but curried.
     *
     * @category Math
     * @param {number} a The first value.
     * @param {number} b The second value.
     * @returns {number} The result of `a * b`.
     * @see {@link divide|divide}
     * @example
     * const double = multiply( 2 );
     * const triple = multiply( 3 );
     * double( 3 );
     * //=>  6
     * triple( 4 );
     * //=> 12
     * multiply( 2, 5 );
     * //=> 10
     */
    multiply,
} from 'ramda';

export {
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
    nAry,
} from 'ramda';

export {
    /**
     * Negates its argument.
     *
     * @category Math
     * @param {number} n
     * @returns {number}
     * @example
     * negate( 42 );
     * //=> -42
     */
    negate,
} from 'ramda';

export {
    /**
     * Returns `true` if no elements of the list match the predicate, `false`
     * otherwise.
     *
     * Dispatches to the `all` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The predicate function.
     * @param {Array} list The array to consider.
     * @returns {boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
     * @see {@link all|all}
     * @see {@link any|any}
     * @example
     * const isEven = n => n % 2 === 0;
     * const isOdd = n => n % 2 === 1;
     * none( isEven, [ 1, 3, 5, 7, 9, 11 ] );
     * //=> true
     * none( isOdd, [ 1, 3, 5, 7, 8, 11 ] );
     * //=> false
     */
    none,
} from 'ramda';

export {
    /**
     * A function that returns the `!` of its argument. It will return `true` when
     * passed false-y value, and `false` when passed a truth-y one.
     *
     * @category Logic
     * @param {*} a any value
     * @returns {boolean} the logical inverse of passed argument.
     * @see {@link complement|complement}
     * @example
     * not( true );
     * //=> false
     * not( false );
     * //=> true
     * not( 0 );
     * //=> true
     * not( 1 );
     * //=> false
     */
    not,
} from 'ramda';

export {
    /**
     * Returns the nth element of the given list or string. If n is negative the
     * element at index length + n is returned.
     *
     * @category List
     * @param {number} offset
     * @param {*} list
     * @returns {*}
     * @example
     * const list = [ 'foo', 'bar', 'baz', 'quux' ];
     * nth( 1, list );
     * //=> 'bar'
     * nth( -1, list );
     * //=> 'quux'
     * nth( -99, list );
     * //=> undefined
     *
     * nth( 2, 'abc' );
     * //=> 'c'
     * nth( 3, 'abc' );
     * //=> ''
     */
    nth,
} from 'ramda';

export {
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
    nthArg,
} from 'ramda';

export {
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
    o,
} from 'ramda';

export {
    /**
     * Creates an object containing a single key:value pair.
     *
     * @category Object
     * @param {string} key
     * @param {*} val
     * @returns {Object}
     * @see {@link pair|pair}
     * @example
     * import { compose, map, objOf } from '@blue/util';
     * const matchPhrases = compose(
     *  objOf( 'must' ),
     *  map( objOf( 'match_phrase' ) )
     * );
     * matchPhrases( [ 'foo', 'bar', 'baz' ] );
     * //=> { must: [ { match_phrase: 'foo' }, { match_phrase: 'bar' }, { match_phrase: 'baz' } ] }
     */
    objOf,
} from 'ramda';

export {
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
    of,
} from 'ramda';

export {
    /**
     * Returns a partial copy of an object omitting the keys specified.
     *
     * @category Object
     * @param {Array} names an array of String property names to omit from the new object
     * @param {Object} obj The object to copy from
     * @returns {Object} A new object with properties from `names` not on it.
     * @see {@link pick|pick}
     * @example
     * omit( [ 'a', 'd' ], { a: 1, b: 2, c: 3, d: 4 } );
     * //=> { b: 2, c: 3 }
     */
    omit,
} from 'ramda';

export {
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
    once,
} from 'ramda';

export {
    /**
     * Returns `true` if one or both of its arguments are `true`. Returns `false`
     * if both arguments are `false`.
     *
     * @category Logic
     * @param {Any} a
     * @param {Any} b
     * @returns {Any} the first argument if truthy, otherwise the second argument.
     * @see {@link either|either}
     * @example
     * or( true, true );
     * //=> true
     * or( true, false );
     * //=> true
     * or( false, true );
     * //=> true
     * or( false, false );
     * //=> false
     */
    or,
} from 'ramda';

export {
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
    otherwise,
} from 'ramda';

export {
    /**
     * Returns the result of "setting" the portion of the given data structure
     * focused by the given lens to the result of applying the given function to
     * the focused value.
     *
     * @category Object
     * @param {Lens} lens
     * @param {*} v
     * @param {*} x
     * @returns {*}
     * @see {@link prop|prop}
     * @see {@link lensIndex|lensIndex}
     * @see {@link lensProp|lensProp}
     * @example
     * import { lensIndex, over, toUpper } from '@blue/util';
     * const headLens = lensIndex( 0 );
     * over( headLens, toUpper, [ 'foo', 'bar', 'baz' ] );
     * //=> ['FOO', 'bar', 'baz']
     */
    over,
} from 'ramda';

export {
    /**
     * Takes two arguments, `fst` and `snd`, and returns `[fst, snd]`.
     *
     * @category List
     * @param {*} fst
     * @param {*} snd
     * @returns {Array}
     * @see {@link objOf|objOf}
     * @see {@link of|of}
     * @example
     * pair( 'foo', 'bar' );
     * //=> [ 'foo', 'bar' ]
     */
    pair,
} from 'ramda';

export {
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
    partial,
} from 'ramda';

export {
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
    partialRight,
} from 'ramda';

export {
    /**
     * Takes a predicate and a list or other `Filterable` object and returns the
     * pair of filterable objects of the same type of elements which do and do not
     * satisfy, the predicate, respectively. Filterable objects include plain objects or any object
     * that has a filter method such as `Array`.
     *
     * @category List
     * @param {function} pred A predicate to determine which side the element belongs to.
     * @param {Array} filterable the list (or other filterable) to partition.
     * @returns {Array} An array, containing first the subset of elements that satisfy the predicate, and second the subset of elements that do not satisfy.
     * @see {@link filter|filter}
     * @see {@link reject|reject}
     * @example
     * import { includes, partition } from '@blue/util';
     * partition( includes( 's' ), [ 'sss', 'ttt', 'foo', 'bars' ] );
     * //=> [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
     *
     * partition( includes( 's' ), { a: 'sss', b: 'ttt', foo: 'bars' } );
     * //=> [ { a: 'sss', foo: 'bars' }, { b: 'ttt' } ]
     */
    partition,
} from 'ramda';

export {
    /**
     * Retrieve the value at a given path.
     *
     * @category Object
     * @param {Array} path The path to use.
     * @param {Object} obj The object to retrieve the nested property from.
     * @returns {*} The data at `path`.
     * @see {@link prop|prop}
     * @see {@link nth|nth}
     * @example
     * path( [ 'a', 'b' ], { a: { b: 2 } } );
     * //=> 2
     * path( [ 'a', 'b' ], { c: { b: 2 } } );
     * //=> undefined
     * path( [ 'a', 'b', 0 ], { a: { b: [ 1, 2, 3 ] } } );
     * //=> 1
     * path( [ 'a', 'b', -2 ], { a: { b: [ 1, 2, 3 ] } } );
     * //=> 2
     */
    path,
} from 'ramda';

export {
    /**
     * Determines whether a nested path on an object has a specific value, in
     * [`equals`](#equals) terms. Most likely used to filter a list.
     *
     * @category Relation
     * @param {Array} path The path of the nested property to use
     * @param {*} val The value to compare the nested property with
     * @param {Object} obj The object to check the nested property in
     * @returns {boolean} `true` if the value equals the nested object property, `false` otherwise.
     * @example
     * import { filter, pathEq } from '@blue/util';
     * const user1 = { address: { zipCode: 90210 } };
     * const user2 = { address: { zipCode: 55555 } };
     * const user3 = { name: 'Bob' };
     * const users = [ user1, user2, user3 ];
     * const isFamous = pathEq( [ 'address', 'zipCode' ], 90210 );
     * filter( isFamous, users );
     * //=> [ user1 ]
     */
    pathEq,
} from 'ramda';

export {
    /**
     * If the given, non-null object has a value at the given path, returns the
     * value at that path. Otherwise returns the provided default value.
     *
     * @category Object
     * @param {*} d The default value.
     * @param {Array} p The path to use.
     * @param {Object} obj The object to retrieve the nested property from.
     * @returns {*} The data at `path` of the supplied object or the default value.
     * @example
     * pathOr( 'N/A', [ 'a', 'b' ], { a: { b: 2 } } );
     * //=> 2
     * pathOr( 'N/A', [ 'a', 'b' ], { c: { b: 2 } } );
     * //=> "N/A"
     */
    pathOr,
} from 'ramda';

export {
    /**
     * Returns `true` if the specified object property at given path satisfies the
     * given predicate; `false` otherwise.
     *
     * @category Logic
     * @param {function} pred
     * @param {Array} propPath
     * @param {*} obj
     * @returns {boolean}
     * @see {@link propSatisfies|propSatisfies}
     * @see {@link path|path}
     * @example
     * pathSatisfies( ( y ) => y > 0, [ 'x', 'y' ], { x: { y: 2 } } );
     * //=> true
     */
    pathSatisfies,
} from 'ramda';

export {
    /**
     * Returns a partial copy of an object containing only the keys specified. If
     * the key does not exist, the property is ignored.
     *
     * @category Object
     * @param {Array} names an array of String property names to copy onto a new object
     * @param {Object} obj The object to copy from
     * @returns {Object} A new object with only properties from `names` on it.
     * @see {@link omit|omit}
     * @see {@link props|props}
     * @example
     * pick( [ 'a', 'd' ], { a: 1, b: 2, c: 3, d: 4 } );
     * //=> { a: 1, d: 4 }
     * pick( [ 'a', 'e', 'f' ], { a: 1, b: 2, c: 3, d: 4 } );
     * //=> { a: 1 }
     */
    pick,
} from 'ramda';

export {
    /**
     * Similar to `pick` except that this one includes a `key: undefined` pair for
     * properties that don't exist.
     *
     * @category Object
     * @param {Array} names an array of String property names to copy onto a new object
     * @param {Object} obj The object to copy from
     * @returns {Object} A new object with only properties from `names` on it.
     * @see {@link pick|pick}
     * @example
     * pickAll( [ 'a', 'd' ], { a: 1, b: 2, c: 3, d: 4 } );
     * //=> { a: 1, d: 4 }
     * pickAll( [ 'a', 'e', 'f' ], { a: 1, b: 2, c: 3, d: 4 } );
     * //=> { a: 1, e: undefined, f: undefined }
     */
    pickAll,
} from 'ramda';

export {
    /**
     * Returns a partial copy of an object containing only the keys that satisfy
     * the supplied predicate.
     *
     * @category Object
     * @param {function} pred A predicate to determine whether or not a key should be included on the output object.
     * @param {Object} obj The object to copy from
     * @returns {Object} A new object with only properties that satisfy `pred` on it.
     * @see {@link pick|pick}
     * @see {@link filter|filter}
     * @example
     * const isUpperCase = ( val, key ) => key.toUpperCase() === key;
     * pickBy( isUpperCase, { a: 1, b: 2, A: 3, B: 4 } );
     * //=> { A: 3, B: 4 }
     */
    pickBy,
} from 'ramda';

export {
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
    pipe,
} from 'ramda';

export {
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
    pipeWith,
} from 'ramda';

export {
    /**
     * Returns a new list by plucking the same named property off all objects in the list supplied.
     *
     * `pluck` will work on any [functor](https://github.com/fantasyland/fantasy-land#functor) in addition to arrays, as it is equivalent to `R.map(R.prop(k), f)`.
     *
     * @category List
     * @param {number|external:string} key The key name to pluck off of each object.
     * @param {Array} f The array or functor to consider.
     * @returns {Array} The list of values for the given key.
     * @see {@link props|props}
     * @example
     * const getAges = pluck( 'age' );
     * getAges( [ { name: 'fred', age: 29 }, { name: 'wilma', age: 27 } ] );
     * //=> [ 29, 27 ]
     * pluck( 0, [ [ 1, 2 ], [ 3, 4 ] ] );
     * //=> [1, 3]
     * pluck( 'val', { a: { val: 3 }, b: { val: 5 } } );
     * //=> { a: 3, b: 5 }
     */
    pluck,
} from 'ramda';

export {
    /**
     * Returns a new list with the given element at the front, followed by the
     * contents of the list.
     *
     * @category List
     * @param {*} el The item to add to the head of the output list.
     * @param {Array} list The array to add to the tail of the output list.
     * @returns {Array} A new array.
     * @see {@link append|append}
     * @example
     * prepend( 'fee', [ 'fi', 'fo', 'fum' ] );
     * //=> [ 'fee', 'fi', 'fo', 'fum' ]
     */
    prepend,
} from 'ramda';

export {
    /**
     * Multiplies together all the elements of a list.
     *
     * @category Math
     * @param {Array} list An array of numbers
     * @returns {number} The product of all the numbers in the list.
     * @see {@link reduce|reduce}
     * @example
     * product( [ 2, 4, 6, 8, 100, 1 ] );
     * //=> 38400
     */
    product,
} from 'ramda';

export {
    /**
     * Reasonable analog to SQL `select` statement.
     *
     * @category Object
     * @category Relation
     * @param {Array} props The property names to project
     * @param {Array} objs The objects to query
     * @returns {Array} An array of objects with just the `props` properties.
     * @example
     * const abby = { name: 'Abby', age: 7, hair: 'blond', grade: 2 };
     * const fred = { name: 'Fred', age: 12, hair: 'brown', grade: 7 };
     * const kids = [ abby, fred ];
     * project( [ 'name', 'grade' ], kids );
     * //=> [ { name: 'Abby', grade: 2 }, { name: 'Fred', grade: 7 } ]
     */
    project,
} from 'ramda';

export {
    /**
     * Returns a function that when supplied an object returns the indicated
     * property of that object, if it exists.
     *
     * @category Object
     * @param {String|Number} p The property name or array index
     * @param {Object} obj The object to query
     * @returns {*} The value at `obj.p`.
     * @see {@link path|path}
     * @see {@link nth|nth}
     * @example
     * import { compose, inc, prop } from '@blue/util';
     * prop( 'x', { x: 100 } );
     * //=> 100
     * prop( 'x', {} );
     * //=> undefined
     * prop( 0, [ 100 ] );
     * //=> 100
     * compose( inc, prop( 'x' ) )( { x: 3 } )
     * //=> 4
     */
    prop,
} from 'ramda';

export {
    /**
     * Returns `true` if the specified object property is equal, in
     * [`equals`](#equals) terms, to the given value; `false` otherwise.
     * You can test multiple properties with [`whereEq`](#whereEq).
     *
     * @category Relation
     * @param {string} name
     * @param {*} val
     * @param {*} obj
     * @returns {boolean}
     * @see {@link whereEq|whereEq}
     * @see {@link propSatisfies|propSatisfies}
     * @see {@link equals|equals}
     * @example
     * import { filter, propEq } from '@blue/util';
     * const abby = { name: 'Abby', age: 7, hair: 'blond' };
     * const fred = { name: 'Fred', age: 12, hair: 'brown' };
     * const rusty = { name: 'Rusty', age: 10, hair: 'brown' };
     * const alois = { name: 'Alois', age: 15, disposition: 'surly' };
     * const kids = [ abby, fred, rusty, alois ];
     * const hasBrownHair = propEq( 'hair', 'brown' );
     * filter( hasBrownHair, kids );
     * //=> [ fred, rusty ]
     */
    propEq,
} from 'ramda';

export {
    /**
     * Returns `true` if the specified object property is of the given type; `false` otherwise.
     *
     * @category Type
     * @param {function} type
     * @param {string} name
     * @param {*} obj
     * @returns {boolean}
     * @see {@link is|is}
     * @see {@link propSatisfies|propSatisfies}
     * @example
     * propIs( Number, 'x', { x: 1, y: 2 } );
     * //=> true
     * propIs( Number, 'x', { x: 'foo' } );
     * //=> false
     * propIs( Number, 'x', {} );
     * //=> false
     */
    propIs,
} from 'ramda';

export {
    /**
     * If the given, non-null object has an own property with the specified name,
     * returns the value of that property. Otherwise returns the provided default
     * value.
     *
     * @category Object
     * @param {*} val The default value.
     * @param {string} p The name of the property to return.
     * @param {Object} obj The object to query.
     * @returns {*} The value of given property of the supplied object or the default value.
     * @example
     * import { prop, propOr } from '@blue/util';
     * const alice = {
     *  name: 'ALICE',
     *  age: 101
     * };
     * const favorite = prop( 'favoriteLibrary' );
     * const favoriteWithDefault = propOr( 'Ramda', 'favoriteLibrary' );
     *
     * favorite( alice );
     * //=> undefined
     * favoriteWithDefault( alice );
     * //=> 'Ramda'
     */
    propOr,
} from 'ramda';

export {
    /**
     * Returns `true` if the specified object property satisfies the given
     * predicate; `false` otherwise. You can test multiple properties with [`where`](#where).
     *
     * @category Logic
     * @param {function} pred
     * @param {string} name
     * @param {*} obj
     * @returns {boolean}
     * @see {@link where|where}
     * @see {@link propEq|propEq}
     * @see {@link propIs|propIs}
     * @example
     * propSatisfies( ( x ) => x > 0, 'x', { x: 1, y: 2 } );
     * //=> true
     */
    propSatisfies,
} from 'ramda';

export {
    /**
     * Acts as multiple `prop`: array of keys in, array of values out. Preserves
     * order.
     *
     * @category Object
     * @param {Array} ps The property names to fetch
     * @param {Object} obj The object to query
     * @returns {Array} The corresponding values or partially applied function.
     * @example
     * import { compose, props, join } from '@blue/util';
     * props( [ 'x', 'y' ], { x: 1, y: 2 } );
     * //=> [ 1, 2 ]
     * props( [ 'c', 'a', 'b' ], { b: 2, a: 1 } );
     * //=> [ undefined, 1, 2 ]
     *
     * const fullName = compose( join(' '), props( [ 'first', 'last' ] ) );
     * fullName( { last: 'Bullet-Tooth', age: 33, first: 'Tony' } );
     * //=> 'Tony Bullet-Tooth'
     */
    props,
} from 'ramda';

export {
    /**
     * Returns a single item by iterating through the list, successively calling
     * the iterator function and passing it an accumulator value and the current
     * value from the array, and then passing the result to the next call.
     *
     * The iterator function receives two values: *(acc, value)*. It may use
     * [`reduced`](#reduced) to shortcut the iteration.
     *
     * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
     * is *(value, acc)*.
     *
     * Note: `reduce` does not skip deleted or unassigned indices (sparse
     * arrays), unlike the native `Array.prototype.reduce` method. For more details
     * on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
     *
     * Dispatches to the `reduce` method of the third argument, if present. When
     * doing so, it is up to the user to handle the [`reduced`](#reduced)
     * shortcuting, as this is not implemented by `reduce`.
     *
     * @category List
     * @param {function} fn The iterator function. Receives two values, the accumulator and the current element from the array.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link reduced|reduced}
     * @see {@link addIndex|addIndex}
     * @see {@link reduceRight|reduceRight}
     * @example
     * import { reduce, subtract } from '@blue/util';
     * reduce( subtract, 0, [ 1, 2, 3, 4 ] ); // => ( ( ( ( 0 - 1 ) - 2 ) - 3 ) - 4 ) = -10
     * //          -               -10
     * //         / \              / \
     * //        -   4           -6   4
     * //       / \              / \
     * //      -   3   ==>     -3   3
     * //     / \              / \
     * //    -   2           -1   2
     * //   / \              / \
     * //  0   1            0   1
     */
    reduce,
} from 'ramda';

export {
    /**
     * Groups the elements of the list according to the result of calling
     * the String-returning function `keyFn` on each element and reduces the elements
     * of each group to a single value via the reducer function `valueFn`.
     *
     * This function is basically a more general [`groupBy`](#groupBy) function.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} valueFn The function that reduces the elements of each group to a single value. Receives two values, accumulator for a particular group and the current element.
     * @param {*} acc The (initial) accumulator value for each group.
     * @param {function} keyFn The function that maps the list's element into a key.
     * @param {Array} list The array to group.
     * @returns {Object} An object with the output of `keyFn` for keys, mapped to the output of `valueFn` for elements which produced that key when passed to `keyFn`.
     * @see {@link groupBy|groupBy}
     * @see {@link reduce|reduce}
     * @example
     * import { reduce, subtract } from '@blue/util';
     * const groupNames = ( acc, { name } ) => acc.concat( name )
     * const toGrade = ( { score } ) =>
     *  score < 65 ? 'F' :
     *  score < 70 ? 'D' :
     *  score < 80 ? 'C' :
     *  score < 90 ? 'B' : 'A'
     *
     * const students = [
     *  { name: 'Abby', score: 83 },
     *  { name: 'Bart', score: 62 },
     *  { name: 'Curt', score: 88 },
     *  { name: 'Dora', score: 92 },
     * ]
     *
     * reduceBy( groupNames, [], toGrade, students );
     * //=> { "A": [ "Dora" ], "B": [ "Abby", "Curt" ], "F": [ "Bart" ] }
     */
    reduceBy,
} from 'ramda';

export {
    /**
     * Returns a single item by iterating through the list, successively calling
     * the iterator function and passing it an accumulator value and the current
     * value from the array, and then passing the result to the next call.
     *
     * Similar to [`reduce`](#reduce), except moves through the input list from the
     * right to the left.
     *
     * The iterator function receives two values: *(value, acc)*, while the arguments'
     * order of `reduce`'s iterator function is *(acc, value)*.
     *
     * Note: `reduceRight` does not skip deleted or unassigned indices (sparse
     * arrays), unlike the native `Array.prototype.reduceRight` method. For more details
     * on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
     *
     * @category List
     * @param {function} fn The iterator function. Receives two values, the current element from the array and the accumulator.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link reduce|reduce}
     * @see {@link addIndex|addIndex}
     * @example
     * import { reduceRight, subtract } from '@blue/util';
     * reduceRight( subtract, 0, [ 1, 2, 3, 4 ] ); // => ( 1 - ( 2 - ( 3 - ( 4 - 0 ) ) ) ) = -2
     * //    -               -2
     * //   / \              / \
     * //  1   -            1   3
     * //     / \              / \
     * //    2   -     ==>    2  -1
     * //       / \              / \
     * //      3   -            3   4
     * //         / \              / \
     * //        4   0            4   0
     */
    reduceRight,
} from 'ramda';

export {
    /**
     * Like [`reduce`](#reduce), `reduceWhile` returns a single item by iterating
     * through the list, successively calling the iterator function. `reduceWhile`
     * also takes a predicate that is evaluated before each step. If the predicate
     * returns `false`, it "short-circuits" the iteration and returns the current
     * value of the accumulator.
     *
     * @category List
     * @param {function} pred The predicate. It is passed the accumulator and the current element.
     * @param {function} fn The iterator function. Receives two values, the accumulator and the current element.
     * @param {*} a The accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link reduce|reduce}
     * @see {@link reduced|reduced}
     * @example
     * import { add, reduceWhile } from '@blue/util';
     * const isOdd = ( acc, x ) => x % 2 === 1;
     * const xs = [ 1, 3, 5, 60, 777, 800 ];
     * reduceWhile( isOdd, add, 0, xs );
     * //=> 9
     *
     * const ys = [ 2, 4, 6 ]
     * reduceWhile( isOdd, add, 111, ys );
     * //=> 111
     */
    reduceWhile,
} from 'ramda';

export {
    /**
     * Returns a value wrapped to indicate that it is the final value of the reduce
     * and transduce functions. The returned value should be considered a black
     * box: the internal structure is not guaranteed to be stable.
     *
     * Note: this optimization is only available to the below functions:
     * - [`reduce`](#reduce)
     * - [`reduceWhile`](#reduceWhile)
     * - [`transduce`](#transduce)
     *
     * @category List
     * @param {*} x The final value of the reduce.
     * @returns {*} The wrapped value.
     * @see {@link reduce|reduce}
     * @see {@link reduceWhile|reduceWhile}
     * @see {@link transduce|transduce}
     * @example
     * import { reduce, reduced } from '@blue/util';
     * reduce(
     *  ( acc, item ) => item > 3 ? reduced( acc ) : acc.concat( item ),
     *  [],
     *  [ 1, 2, 3, 4, 5 ]
     * );
     * //=> [ 1, 2, 3 ]
     */
    reduced,
} from 'ramda';

export {
    /**
     * The complement of [`filter`](#filter).
     *
     * Acts as a transducer if a transformer is given in list position. Filterable
     * objects include plain objects or any object that has a filter method such as `Array`.
     *
     * @category List
     * @param {function} pred
     * @param {Array} filterable
     * @returns {Array}
     * @see {@link filter|filter}
     * @see {@link transduce|transduce}
     * @see {@link addIndex|addIndex}
     * @example
     * const isOdd = ( n ) => n % 2 === 1;
     * reject( isOdd, [ 1, 2, 3, 4 ] );
     * //=> [2, 4 ]
     * reject( isOdd, { a: 1, b: 2, c: 3, d: 4 } );
     * //=> { b: 2, d: 4 }
     */
    reject,
} from 'ramda';

export {
    /**
     * Removes the sub-list of `list` starting at index `start` and containing
     * `count` elements. _Note that this is not destructive_: it returns a copy of
     * the list with the changes.
     * <small>No lists have been harmed in the application of this function.</small>
     *
     * @category List
     * @param {number} start The position to start removing elements
     * @param {number} count The number of elements to remove
     * @param {Array} list The list to remove from
     * @returns {Array} A new Array with `count` elements from `start` removed.
     * @see {@link without|without}
     * @example
     * remove( 2, 3, [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
     * //=> [ 1, 2, 6, 7, 8 ]
     */
    remove,
} from 'ramda';

export {
    /**
     * Returns a fixed list of size `n` containing a specified identical value.
     *
     * @category List
     * @param {*} value The value to repeat.
     * @param {number} n The desired size of the output list.
     * @returns {Array} A new array containing `n` `value`s.
     * @see {@link times|times}
     * @example
     * repeat( 'hi', 5 );
     * //=> [ 'hi', 'hi', 'hi', 'hi', 'hi' ]
     *
     * const obj = {};
     * const repeatedObjs = repeat( obj, 5 );
     * //=> [ {}, {}, {}, {}, {} ]
     * repeatedObjs[ 0 ] === repeatedObjs[ 1 ];
     * //=> true
     */
    repeat,
} from 'ramda';

export {
    /**
     * Replace a substring or regex match in a string with a replacement.
     *
     * The first two parameters correspond to the parameters of the
     * `String.prototype.replace()` function, so the second parameter can also be a
     * function.
     *
     * @category String
     * @sig RegExp|String -> String -> String -> String
     * @param {RegExp|String} pattern A regular expression or a substring to match.
     * @param {string} replacement The string to replace the matches with.
     * @param {string} str The String to do the search and replacement in.
     * @returns {string} The result.
     * @example
     * replace( 'foo', 'bar', 'foo foo foo' );
     * //=> 'bar foo foo'
     * replace( /foo/, 'bar', 'foo foo foo' );
     * //=> 'bar foo foo'
     *
     * // Use the "g" (global) flag to replace all occurrences:
     * replace( /foo/g, 'bar', 'foo foo foo' );
     * //=> 'bar bar bar'
     */
    replace,
} from 'ramda';

export {
    /**
     * Returns a new list or string with the elements or characters in reverse
     * order.
     *
     * @category List
     * @param {Array | external:string} list
     * @returns {Array | external:string}
     * @example
     * reverse( [ 1, 2, 3 ] );//=> [ 3, 2, 1 ]
     * reverse( [ 1, 2 ] );   //=> [ 2, 1 ]
     * reverse( [ 1 ] );      //=> [ 1 ]
     * reverse( [] );         //=> []
     *
     * reverse( 'abc' );      //=> 'cba'
     * reverse( 'ab' );       //=> 'ba'
     * reverse( 'a' );        //=> 'a'
     * reverse( '' );         //=> ''
     */
    reverse,
} from 'ramda';

export {
    /**
     * Scan is similar to [`reduce`](#reduce), but returns a list of successively
     * reduced values from the left
     *
     * @category List
     * @param {function} fn The iterator function. Receives two values, the accumulator and the current element from the array
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {Array} A list of all intermediately reduced values.
     * @see {@link reduce|reduce}
     * @see {@link mapAccum|mapAccum}
     * @example
     * import { multiply, scan } from '@blue/util';
     * const numbers = [ 1, 2, 3, 4 ];
     * const factorials = scan( multiply, 1, numbers );
     * //=> [ 1, 1, 2, 6, 24 ]
     */
    scan,
} from 'ramda';

export {
    /**
     * Returns the result of "setting" the portion of the given data structure
     * focused by the given lens to the given value.
     *
     * @category Object
     * @param {Lens} lens
     * @param {*} v
     * @param {*} x
     * @returns {*}
     * @see {@link prop|prop}
     * @see {@link lensIndex|lensIndex}
     * @see {@link lensProp|lensProp}
     * @example
     * import { lensProp, set } from '@blue/util';
     * const xLens = lensProp( 'x' );
     *
     * set( xLens, 4, { x: 1, y: 2 } );
     * //=> { x: 4, y: 2 }
     * set( xLens, 8, { x: 1, y: 2 } );
     * //=> { x: 8, y: 2 }
     */
    set,
} from 'ramda';

export {
    /**
     * Returns the elements of the given list or string (or object with a `slice`
     * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
     *
     * Dispatches to the `slice` method of the third argument, if present.
     *
     * @category List
     * @param {number} fromIndex The start index (inclusive).
     * @param {number} toIndex The end index (exclusive).
     * @param {*} list
     * @returns {*}
     * @example
     * slice( 1, 3, [ 'a', 'b', 'c', 'd' ] );
     * //=> ['b', 'c']
     * slice( 1, Infinity, [ 'a', 'b', 'c', 'd' ] );
     * //=> ['b', 'c', 'd']
     * slice( 0, -1, [ 'a', 'b', 'c', 'd' ] );
     * //=> ['a', 'b', 'c']
     * slice( -3, -1, [ 'a', 'b', 'c', 'd' ] );
     * //=> ['b', 'c']
     * slice( 0, 3, 'ramda' );
     * //=> 'ram'
     */
    slice,
} from 'ramda';

export {
    /**
     * Returns a copy of the list, sorted according to the comparator function,
     * which should accept two values at a time and return a negative number if the
     * first value is smaller, a positive number if it's larger, and zero if they
     * are equal. Please note that this is a **copy** of the list. It does not
     * modify the original.
     *
     * @category List
     * @param {function} comparator A sorting function :: a -> b -> Int
     * @param {Array} list The list to sort
     * @returns {Array} a new array with its elements sorted by the comparator function.
     * @example
     * const diff = ( a, b ) => a - b;
     * sort( diff, [ 4, 2, 7, 5 ] );
     * //=> [ 2, 4, 5, 7 ]
     */
    sort,
} from 'ramda';

export {
    /**
     * Sorts the list according to the supplied function.
     *
     * @category Relation
     * @param {function} fn
     * @param {Array} list The list to sort.
     * @returns {Array} A new list sorted by the keys generated by `fn`.
     * @example
     * import { compose, prop, sortBy, toLower } from '@blue/util';
     * const sortByFirstItem = sortBy( prop( 0 ) );
     * const pairs = [ [ -1, 1 ], [ -2, 2 ], [ -3, 3 ] ];
     * sortByFirstItem( pairs );
     * //=> [[-3, 3], [-2, 2], [-1, 1]]
     *
     * const sortByNameCaseInsensitive = sortBy( compose( toLower, prop( 'name' ) ) );
     * const alice = {
     *  name: 'ALICE',
     *  age: 101
     * };
     * const bob = {
     *  name: 'Bob',
     *  age: -10
     * };
     * const clara = {
     *  name: 'clara',
     *  age: 314.159
     * };
     * const people = [ clara, bob, alice ];
     * sortByNameCaseInsensitive( people );
     * //=> [alice, bob, clara]
     */
    sortBy,
} from 'ramda';

export {
    /**
     * Sorts a list according to a list of comparators.
     *
     * @category Relation
     * @param {Array} functions A list of comparator functions.
     * @param {Array} list The list to sort.
     * @returns {Array} A new list sorted according to the comarator functions.
     * @example
     * import { ascend, descend, prop, sortWith } from '@blue/util';
     * const alice = {
     *  name: 'alice',
     *  age: 40
     * };
     * const bob = {
     *  name: 'bob',
     *  age: 30
     * };
     * const clara = {
     *  name: 'clara',
     *  age: 40
     * };
     * const people = [ clara, bob, alice ];
     * const ageNameSort = sortWith( [
     *  descend( prop( 'age' ) ),
     *  ascend( prop( 'name' ) )
     * ] );
     * ageNameSort( people );
     * //=> [ alice, clara, bob ]
     */
    sortWith,
} from 'ramda';

export {
    /**
     * Splits a string into an array of strings based on the given
     * separator.
     *
     * @category String
     * @param {String|RegExp} sep The pattern.
     * @param {string} str The string to separate into an array.
     * @returns {Array} The array of strings from `str` separated by `str`.
     * @see {@link join|join}
     * @example
     * import { split, tail } from '@blue/util';
     * const pathComponents = split( '/' );
     * tail( pathComponents( '/usr/local/bin/node' ) );
     * //=> [ 'usr', 'local', 'bin', 'node' ]
     * split( '.', 'a.b.c.xyz.d ' );
     * //=> [ 'a', 'b', 'c', 'xyz', 'd' ]
     */
    split,
} from 'ramda';

export {
    /**
     * Splits a given list or string at a given index.
     *
     * @category List
     * @param {number} index The index where the array/string is split.
     * @param {Array | external:string} array The array/string to be split.
     * @returns {Array}
     * @example
     * splitAt( 1, [ 1, 2, 3 ] );
     * //=> [ [ 1 ], [ 2, 3 ] ]
     * splitAt( 5, 'hello world' );
     * //=> [ 'hello', ' world' ]
     * splitAt( -1, 'foobar' );
     * //=> [ 'fooba', 'r' ]
     */
    splitAt,
} from 'ramda';

export {
    /**
     * Splits a collection into slices of the specified length.
     *
     * @category List
     * @param {number} n
     * @param {Array} list
     * @returns {Array}
     * @example
     * splitEvery( 3, [ 1, 2, 3, 4, 5, 6, 7 ] );
     * //=> [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7 ] ]
     * splitEvery( 3, 'foobarbaz' );
     * //=> [ 'foo', 'bar', 'baz' ]
     */
    splitEvery,
} from 'ramda';

export {
    /**
     * Takes a list and a predicate and returns a pair of lists with the following properties:
     *
     *  - the result of concatenating the two output lists is equivalent to the input list;
     *  - none of the elements of the first output list satisfies the predicate; and
     *  - if the second output list is non-empty, its first element satisfies the predicate.
     *
     * @category List
     * @param {function} pred The predicate that determines where the array is split.
     * @param {Array} list The array to be split.
     * @returns {Array}
     * @example
     * import { equals, splitWhen } from '@blue/util';
     * splitWhen( equals( 2 ), [ 1, 2, 3, 1, 2, 3 ] );
     * //=> [ [ 1 ], [ 2, 3, 1, 2, 3 ] ]
     */
    splitWhen,
} from 'ramda';

export {
    /**
     * Checks if a list starts with the provided sublist.
     *
     * Similarly, checks if a string starts with the provided substring.
     *
     * @category List
     * @param {*} prefix
     * @param {*} list
     * @returns {boolean}
     * @see {@link endsWith|endsWith}
     * @example
     * import { equals, splitWhen } from '@blue/util';
     * startsWith( 'a', 'abc' );
     * //=> true
     * startsWith( 'b', 'abc' );
     * //=> false
     * startsWith( [ 'a' ], [ 'a', 'b', 'c' ] );
     * //=> true
     * startsWith( [ 'b' ], [ 'a', 'b', 'c' ] );
     * //=> false
     */
    startsWith,
} from 'ramda';

export {
    /**
     * Subtracts its second argument from its first argument.
     *
     * @category Math
     * @param {number} a The first value.
     * @param {number} b The second value.
     * @returns {number} The result of `a - b`.
     * @see {@link add|add}
     * @example
     * import { __, subtract } from '@blue/util';
     * subtract( 10, 8 );
     * //=> 2
     *
     * const minus5 = subtract( __, 5 );
     * minus5( 17 );
     * //=> 12
     *
     * const complementaryAngle = subtract( 90 );
     * complementaryAngle( 30 );
     * //=> 60
     * complementaryAngle( 72 );
     * //=> 18
     */
    subtract,
} from 'ramda';

export {
    /**
     * Adds together all the elements of a list.
     *
     * @category Math
     * @param {Array} list An array of numbers
     * @returns {number} The sum of all the numbers in the list.
     * @see {@link reduce|reduce}
     * @example
     * sum( [ 2, 4, 6, 8, 100, 1 ] );
     * //=> 121
     */
    sum,
} from 'ramda';

export {
    /**
     * Finds the set (i.e. no duplicates) of all elements contained in the first or
     * second list, but not both.
     *
     * @category Relation
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @returns {Array} The elements in `list1` or `list2`, but not both.
     * @see {@link symmetricDifferenceWith|symmetricDifferenceWith}
     * @see {@link difference|difference}
     * @see {@link differenceWith|differenceWith}
     * @example
     * symmetricDifference( [ 1, 2, 3, 4 ], [ 7, 6, 5, 4, 3 ] );
     * //=> [1,2,7,6,5]
     * symmetricDifference( [ 7, 6, 5, 4, 3 ], [ 1, 2, 3, 4 ] );
     * //=> [7,6,5,1,2]
     */
    symmetricDifference,
} from 'ramda';

export {
    /**
     * Finds the set (i.e. no duplicates) of all elements contained in the first or
     * second list, but not both. Duplication is determined according to the value
     * returned by applying the supplied predicate to two list elements.
     *
     * @category Relation
     * @param {function} pred A predicate used to test whether two items are equal.
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @returns {Array} The elements in `list1` or `list2`, but not both.
     * @see {@link symmetricDifference|symmetricDifference}
     * @see {@link difference|difference}
     * @see {@link differenceWith|differenceWith}
     * @example
     * import { eqBy, prop, symmetricDifferenceWith } from '@blue/util';
     * const eqA = eqBy( prop( 'a' ) );
     * const l1 = [ { a: 1 }, { a: 2 }, { a: 3 }, { a: 4 } ];
     * const l2 = [ { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 } ];
     * symmetricDifferenceWith( eqA, l1, l2 );
     * //=> [ { a: 1 }, { a: 2 }, { a: 5 }, { a: 6 } ]
     */
    symmetricDifferenceWith,
} from 'ramda';

export {
    /**
     * Returns all but the first element of the given list or string (or object
     * with a `tail` method).
     *
     * Dispatches to the `slice` method of the first argument, if present.
     *
     * @category List
     * @param {*} list
     * @returns {*}
     * @see {@link head|head}
     * @see {@link init|init}
     * @see {@link last|last}
     * @example
     * tail( [ 1, 2, 3 ] );  //=> [ 2, 3 ]
     * tail( [ 1, 2 ] );     //=> [ 2 ]
     * tail( [ 1 ] );        //=> []
     * tail( [] );           //=> []
     *
     * tail( 'abc' );  //=> 'bc'
     * tail( 'ab' );   //=> 'b'
     * tail( 'a' );    //=> ''
     * tail( '' );     //=> ''
     */
    tail,
} from 'ramda';

export {
    /**
     * Returns the first `n` elements of the given list, string, or
     * transducer/transformer (or object with a `take` method).
     *
     * Dispatches to the `take` method of the second argument, if present.
     *
     * @category List
     * @param {number} n
     * @param {*} list
     * @returns {*}
     * @see {@link drop|drop}
     * @example
     * take( 1, [ 'foo', 'bar', 'baz' ] ); //=> [ 'foo' ]
     * take( 2, [ 'foo', 'bar', 'baz' ] ); //=> [ 'foo', 'bar' ]
     * take( 3, [ 'foo', 'bar', 'baz' ] ); //=> [ 'foo', 'bar', 'baz' ]
     * take( 4, [ 'foo', 'bar', 'baz' ] ); //=> [ 'foo', 'bar', 'baz' ]
     * take( 3, 'ramda' );                 //=> 'ram'
     *
     * const personnel = [
     *  'Dave Brubeck',
     *  'Paul Desmond',
     *  'Eugene Wright',
     *  'Joe Morello',
     *  'Gerry Mulligan',
     *  'Bob Bates',
     *  'Joe Dodge',
     *  'Ron Crotty'
     * ];
     *
     * const takeFive = take( 5 );
     * takeFive( personnel );
     * //=> [ 'Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan' ]
     */
    take,
} from 'ramda';

export {
    /**
     * Returns a new list containing the last `n` elements of the given list.
     * If `n > list.length`, returns a list of `list.length` elements.
     *
     * @category List
     * @param {number} n The number of elements to return.
     * @param {Array} xs The collection to consider.
     * @returns {Array}
     * @see {@link dropLast|dropLast}
     * @example
     * takeLast( 1, [ 'foo', 'bar', 'baz' ] );
     * //=> [ 'baz' ]
     * takeLast( 2, [ 'foo', 'bar', 'baz' ] );
     * //=> [ 'bar', 'baz' ]
     * takeLast( 3, [ 'foo', 'bar', 'baz' ] );
     * //=> [ 'foo', 'bar', 'baz' ]
     * takeLast( 4, [ 'foo', 'bar', 'baz' ] );
     * //=> [ 'foo', 'bar', 'baz' ]
     * takeLast( 3, 'ramda' );
     * //=> 'mda'
     */
    takeLast,
} from 'ramda';

export {
    /**
     * Returns a new list containing the last `n` elements of a given list, passing
     * each value to the supplied predicate function, and terminating when the
     * predicate function returns `false`. Excludes the element that caused the
     * predicate function to fail. The predicate function is passed one argument:
     * *(value)*.
     *
     * @category List
     * @param {function} fn The function called per iteration.
     * @param {Array} xs The collection to iterate over.
     * @returns {Array} A new array.
     * @see {@link dropLastWhile|dropLastWhile}
     * @see {@link addIndex|addIndex}
     * @example
     * const isNotOne = ( x ) => x !== 1;
     * takeLastWhile( isNotOne, [ 1, 2, 3, 4 ] );
     * //=> [ 2, 3, 4 ]
     * takeLastWhile( ( x ) => x !== 'R' , 'Ramda' );
     * //=> 'amda'
     */
    takeLastWhile,
} from 'ramda';

export {
    /**
     * Returns a new list containing the first `n` elements of a given list,
     * passing each value to the supplied predicate function, and terminating when
     * the predicate function returns `false`. Excludes the element that caused the
     * predicate function to fail. The predicate function is passed one argument:
     * *(value)*.
     *
     * Dispatches to the `takeWhile` method of the second argument, if present.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {function} fn The function called per iteration.
     * @param {Array} xs The collection to iterate over.
     * @returns {Array} A new array.
     * @see {@link dropWhile|dropWhile}
     * @see {@link transduce|transduce}
     * @see {@link addIndex|addIndex}
     * @example
     * const isNotFour = ( x ) => x !== 4;
     * takeWhile( isNotFour, [ 1, 2, 3, 4, 3, 2, 1 ] );
     * //=> [ 1, 2, 3 ]
     * takeWhile( ( x ) => x !== 'd' , 'Ramda' );
     * //=> 'Ram'
     */
    takeWhile,
} from 'ramda';

export {
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
    tap,
} from 'ramda';

export {
    /**
     * Determines whether a given string matches a given regular expression.
     *
     * @category String
     * @param {RegExp} pattern
     * @param {string} str
     * @returns {boolean}
     * @see {@link match|match}
     * @example
     * test( /^x/, 'xyz' );
     * //=> true
     * test( /^y/, 'xyz' );
     * //=> false
     */
    test,
} from 'ramda';

export {
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
    thunkify,
} from 'ramda';

export {
    /**
     * Calls an input function `n` times, returning an array containing the results
     * of those function calls.
     *
     * `fn` is passed one argument: The current value of `n`, which begins at `0`
     * and is gradually incremented to `n - 1`.
     *
     * @category List
     * @param {function} fn The function to invoke. Passed one argument, the current value of `n`.
     * @param {number} n A value between `0` and `n - 1`. Increments after each function call.
     * @returns {Array} An array containing the return values of all calls to `fn`.
     * @see {@link repeat|repeat}
     * @example
     * import { identity, times } from '@blue/util';
     * times( identity, 5 );
     * //=> [ 0, 1, 2, 3, 4 ]
     */
    times,
} from 'ramda';

export {
    /**
     * The lower case version of a string.
     *
     * @category String
     * @param {string} str The string to lower case.
     * @returns {string} The lower case version of `str`.
     * @see {@link toUpper|toUpper}
     * @example
     * toLower( 'XYZ' );
     * //=> 'xyz'
     */
    toLower,
} from 'ramda';

export {
    /**
     * Converts an object into an array of key, value arrays. Only the object's
     * own properties are used.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @category Object
     * @param {Object} obj The object to extract from
     * @returns {Array} An array of key, value arrays from the object's own properties.
     * @see {@link fromPairs|fromPairs}
     * @example
     * toPairs( { a: 1, b: 2, c: 3 } ); //=> [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ]
     */
    toPairs,
} from 'ramda';

export {
    /**
     * Converts an object into an array of key, value arrays. The object's own
     * properties and prototype properties are used. Note that the order of the
     * output array is not guaranteed to be consistent across different JS
     * platforms.
     *
     * @category Object
     * @param {Object} obj The object to extract from
     * @returns {Array} An array of key, value arrays from the object's own and prototype properties.
     * @example
     * const F = function() { this.x = 'X'; };
     * F.prototype.y = 'Y';
     * const f = new F();
     * toPairsIn( f ); //=> [ [ 'x', 'X' ], [ 'y', 'Y' ] ]
     */
    toPairsIn,
} from 'ramda';

export {
    /**
     * The upper case version of a string.
     *
     * @category String
     * @param {string} str The string to upper case.
     * @returns {string} The upper case version of `str`.
     * @see {@link toLower|toLower}
     * @example
     * toUpper( 'abc' ); //=> 'ABC'
     */
    toUpper,
} from 'ramda';

export {
    /**
     * Initializes a transducer using supplied iterator function. Returns a single
     * item by iterating through the list, successively calling the transformed
     * iterator function and passing it an accumulator value and the current value
     * from the array, and then passing the result to the next call.
     *
     * The iterator function receives two values: *(acc, value)*. It will be
     * wrapped as a transformer to initialize the transducer. A transformer can be
     * passed directly in place of an iterator function. In both cases, iteration
     * may be stopped early with the [`reduced`](#reduced) function.
     *
     * A transducer is a function that accepts a transformer and returns a
     * transformer and can be composed directly.
     *
     * A transformer is an an object that provides a 2-arity reducing iterator
     * function, step, 0-arity initial value function, init, and 1-arity result
     * extraction function, result. The step function is used as the iterator
     * function in reduce. The result function is used to convert the final
     * accumulator into the return type and in most cases is
     * [`identity`](#identity). The init function can be used to provide an
     * initial accumulator, but is ignored by transduce.
     *
     * The iteration is performed with [`reduce`](#reduce) after initializing the transducer.
     *
     * @category List
     * @param {function} xf The transducer function. Receives a transformer and returns a transformer.
     * @param {function} fn The iterator function. Receives two values, the accumulator and the
     *        current element from the array. Wrapped as transformer, if necessary, and used to
     *        initialize the transducer
     * @param {*} acc The initial accumulator value.
     * @param {Array} list The list to iterate over.
     * @returns {*} The final, accumulated value.
     * @see {@link reduce|reduce}
     * @see {@link reduced|reduced}
     * @see {@link into|into}
     * @example
     * import { add, append, compose, filter, flip, map, range, take, transduce } from '@blue/util';
     * const numbers = [ 1, 2, 3, 4 ];
     * const transducer = compose( map( add( 1 ) ), take( 2 ) );
     * transduce( transducer, flip( append ), [], numbers ); //=> [ 2, 3 ]
     *
     * const isOdd = ( x ) => x % 2 === 1;
     * const firstOddTransducer = compose( filter( isOdd ), take( 1 ) );
     * transduce( firstOddTransducer, flip( append ), [], range( 0, 100 ) ); //=> [ 1 ]
     */
    transduce,
} from 'ramda';

export {
    /**
     * Transposes the rows and columns of a 2D list.
     * When passed a list of `n` lists of length `x`,
     * returns a list of `x` lists of length `n`.
     *
     * @category List
     * @param {Array} list A 2D list
     * @returns {Array} A 2D list
     * @example
     * transpose( [ [ 1, 'a' ], [ 2, 'b' ], [ 3, 'c' ] ] ) //=> [ [ 1, 2, 3 ], [ 'a', 'b', 'c' ] ]
     * transpose( [ [ 1, 2, 3 ], [ 'a', 'b', 'c' ] ] ) //=> [ [ 1, 'a' ], [ 2, 'b' ], [ 3, 'c' ] ]
     *
     * // If some of the rows are shorter than the following rows, their elements are skipped:
     * transpose( [ [ 10, 11 ], [ 20 ], [], [ 30, 31, 32 ] ] ) //=> [ [ 10, 20, 30 ], [ 11, 31 ], [ 32 ] ]
     */
    transpose,
} from 'ramda';

export {
    /**
     * Maps an [Applicative](https://github.com/fantasyland/fantasy-land#applicative)-returning
     * function over a [Traversable](https://github.com/fantasyland/fantasy-land#traversable),
     * then uses [`sequence`](#sequence) to transform the resulting Traversable of Applicative
     * into an Applicative of Traversable.
     *
     * Dispatches to the `traverse` method of the third argument, if present.
     *
     * @category List
     * @param {function} of
     * @param {function} f
     * @param {*} traversable
     * @returns {*}
     * @see {@link sequence|sequence}
     * @example
     * // Returns `Maybe.Nothing` if the given divisor is `0`
     * const safeDiv = ( n ) => d => d === 0 ? Maybe.Nothing() : Maybe.Just( n / d )
     *
     * traverse( Maybe.of, safeDiv( 10 ), [ 2, 4, 5 ] ); //=> Maybe.Just( [ 5, 2.5, 2 ] )
     * traverse( Maybe.of, safeDiv( 10 ), [ 2, 0, 5 ] ); //=> Maybe.Nothing
     */
    traverse,
} from 'ramda';

export {
    /**
     * Removes (strips) whitespace from both ends of the string.
     *
     * @category String
     * @sig String -> String
     * @param {string} str The string to trim.
     * @returns {string} Trimmed version of `str`.
     * @example
     * import { map, split, trim } from '@blue/util';
     * trim( '   xyz  ' ); //=> 'xyz'
     * map( trim, split( ',', 'x, y, z' ) ); //=> [ 'x', 'y', 'z' ]
     */
    trim,
} from 'ramda';

export {
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
    tryCatch,
} from 'ramda';

export {
    /**
     * Gives a single-word string description of the (native) type of a value,
     * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
     * attempt to distinguish user Object types any further, reporting them all as
     * 'Object'.
     *
     * @category Type
     * @param {*} val The value to test
     * @returns {string}
     * @example
     * type( {} ); //=> "Object"
     * type( 1 ); //=> "Number"
     * type( false ); //=> "Boolean"
     * type( 's' ); //=> "String"
     * type( null ); //=> "Null"
     * type( [] ); //=> "Array"
     * type( /[A-z]/ ); //=> "RegExp"
     * type( () => {} ); //=> "Function"
     * type( undefined ); //=> "Undefined"
     */
    type,
} from 'ramda';

export {
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
    unapply,
} from 'ramda';

export {
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
    unary,
} from 'ramda';

export {
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
    uncurryN,
} from 'ramda';

export {
    /**
     * Builds a list from a seed value. Accepts an iterator function, which returns
     * either false to stop iteration or an array of length 2 containing the value
     * to add to the resulting list and the seed to be used in the next call to the
     * iterator function.
     *
     * The iterator function receives one argument: *(seed)*.
     *
     * @category List
     * @param {function} fn The iterator function. receives one argument, `seed`, and returns
     *        either false to quit iteration or an array of length two to proceed. The element
     *        at index 0 of this array will be added to the resulting array, and the element
     *        at index 1 will be passed to the next call to `fn`.
     * @param {*} seed The seed value.
     * @returns {Array} The final list.
     * @example
     * const f = ( n ) => n > 50 ? false : [ -n, n + 10 ];
     * unfold( f, 10 ); //=> [ -10, -20, -30, -40, -50 ]
     */
    unfold,
} from 'ramda';

export {
    /**
     * Combines two lists into a set (i.e. no duplicates) composed of the elements
     * of each list.
     *
     * @category Relation
     * @param {Array} as The first list.
     * @param {Array} bs The second list.
     * @returns {Array} The first and second lists concatenated, with duplicates removed.
     * @example
     * union( [ 1, 2, 3 ], [ 2, 3, 4 ] ); //=> [ 1, 2, 3, 4 ]
     */
    union,
} from 'ramda';

export {
    /**
     * Combines two lists into a set (i.e. no duplicates) composed of the elements
     * of each list. Duplication is determined according to the value returned by
     * applying the supplied predicate to two list elements.
     *
     * @category Relation
     * @param {function} pred A predicate used to test whether two items are equal.
     * @param {Array} list1 The first list.
     * @param {Array} list2 The second list.
     * @returns {Array} The first and second lists concatenated, with duplicates removed.
     * @see {@link union|union}
     * @example
     * import { eqBy, prop, union } from '@blue/util';
     * const l1 = [ { a: 1 }, { a: 2 } ];
     * const l2 = [ { a: 1 }, { a: 4 } ];
     * unionWith( eqBy( prop( 'a' ) ), l1, l2 ); //=> [ { a: 1 }, { a: 2 }, { a: 4 } ]
     */
    unionWith,
} from 'ramda';

export {
    /**
     * Returns a new list containing only one copy of each element in the original
     * list. [`equals`](#equals) is used to determine equality.
     *
     * @category List
     * @param {Array} list The array to consider.
     * @returns {Array} The list of unique items.
     * @example
     * uniq( [ 1, 1, 2, 1 ] );     //=> [ 1, 2 ]
     * uniq( [ 1, '1' ] );         //=> [ 1, '1' ]
     * uniq( [ [ 42 ], [ 42 ] ] ); //=> [ [ 42 ] ]
     */
    uniq,
} from 'ramda';

export {
    /**
     * Returns a new list containing only one copy of each element in the original
     * list, based upon the value returned by applying the supplied function to
     * each list element. Prefers the first item if the supplied function produces
     * the same value on two items. [`equals`](#equals) is used for comparison.
     *
     * @category List
     * @param {function} fn A function used to produce a value to use during comparisons.
     * @param {Array} list The array to consider.
     * @returns {Array} The list of unique items.
     * @example
     * uniqBy( Math.abs, [ -1, -5, 2, 10, 1, 2 ] ); //=> [ -1, -5, 2, 10 ]
     */
    uniqBy,
} from 'ramda';

export {
    /**
     * Returns a new list containing only one copy of each element in the original
     * list, based upon the value returned by applying the supplied predicate to
     * two list elements. Prefers the first item if two items compare equal based
     * on the predicate.
     *
     * @category List
     * @param {function} pred A predicate used to test whether two items are equal.
     * @param {Array} list The array to consider.
     * @returns {Array} The list of unique items.
     * @example
     * import { eqBy, uniqWith } from '@blue/util';
     * const strEq = eqBy( String );
     * uniqWith( strEq )( [ 1, '1', 2, 1 ] ); //=> [ 1, 2 ]
     * uniqWith( strEq )( [ {}, {} ] );       //=> [ {} ]
     * uniqWith( strEq )( [ 1, '1', 1 ] );    //=> [ 1 ]
     * uniqWith( strEq )( [ '1', 1, 1 ] );    //=> [ '1' ]
     */
    uniqWith,
} from 'ramda';

export {
    /**
     * Tests the final argument by passing it to the given predicate function. If
     * the predicate is not satisfied, the function will return the result of
     * calling the `whenFalseFn` function with the same argument. If the predicate
     * is satisfied, the argument is returned as is.
     *
     * @category Logic
     * @param {function} pred        A predicate function
     * @param {function} whenFalseFn A function to invoke when the `pred` evaluates to a falsy value.
     * @param {*}        x           An object to test with the `pred` function and pass to `whenFalseFn` if necessary.
     * @returns {*} Either `x` or the result of applying `x` to `whenFalseFn`.
     * @see {@link ifElse|ifElse}
     * @see {@link when|when}
     * @see {@link cond|cond}
     * @example
     * import { inc, isNil, unless } from '@blue/util';
     * let safeInc = unless( isNil, inc );
     * safeInc( null ); //=> null
     * safeInc( 1 ); //=> 2
     */
    unless,
} from 'ramda';

export {
    /**
     * Shorthand for `chain( identity )`, which removes one level of nesting from any [Chain](https://github.com/fantasyland/fantasy-land#chain).
     *
     * @category List
     * @param {*} list
     * @returns {*}
     * @see {@link flatten|flatten}
     * @see {@link chain|chain}
     * @example
     * unnest( [ 1, [ 2 ], [ [ 3 ] ] ] ); //=> [ 1, 2, [ 3 ] ]
     * unnest( [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ] ); //=> [ 1, 2, 3, 4, 5, 6 ]
     */
    unnest,
} from 'ramda';

export {
    /**
     * Takes a predicate, a transformation function, and an initial value,
     * and returns a value of the same type as the initial value.
     * It does so by applying the transformation until the predicate is satisfied,
     * at which point it returns the satisfactory value.
     *
     * @category Logic
     * @param {function} pred A predicate function
     * @param {function} fn The iterator function
     * @param {*} init Initial value
     * @returns {*} Final value that satisfies predicate
     * @example
     * import { __, gt, multiply, until } from '@blue/util';
     * until( gt( __, 100 ), multiply( 2 ) )( 1 ) // => 128
     */
    until,
} from 'ramda';

export {
    /**
     * Returns a new copy of the array with the element at the provided index
     * replaced with the given value.
     *
     * @category List
     * @param {number} idx The index to update.
     * @param {*} x The value to exist at the given index of the returned array.
     * @param {Array|Arguments} list The source array-like object to be updated.
     * @returns {Array} A copy of `list` with the value at index `idx` replaced with `x`.
     * @see {@link adjust|adjust}
     * @example
     * update( 1, '_', [ 'a', 'b', 'c' ] );      //=> ['a', '_', 'c']
     * update( -1, '_', [ 'a', 'b', 'c' ] );     //=> ['a', 'b', '_']
     */
    update,
} from 'ramda';

export {
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
    useWith,
} from 'ramda';

export {
    /**
     * Returns a list of all the enumerable own properties of the supplied object.
     * Note that the order of the output array is not guaranteed across different
     * JS platforms.
     *
     * @category Object
     * @param {Object} obj The object to extract values from
     * @returns {Array} An array of the values of the object's own properties.
     * @see {@link valuesIn|valuesIn}
     * @see {@link keys|keys}
     * @example
     * values( { a: 1, b: 2, c: 3 } ); //=> [ 1, 2, 3 ]
     */
    values,
} from 'ramda';

export {
    /**
     * Returns a list of all the properties, including prototype properties, of the
     * supplied object.
     * Note that the order of the output array is not guaranteed to be consistent
     * across different JS platforms.
     *
     * @category Object
     * @param {Object} obj The object to extract values from
     * @returns {Array} An array of the values of the object's own and prototype properties.
     * @see {@link values|values}
     * @see {@link keysIn|keysIn}
     * @example
     * const F = function(){ this.x = 'X'; };
     * F.prototype.y = 'Y';
     * const f = new F();
     * valuesIn( f ); //=> [ 'X', 'Y' ]
     */
    valuesIn,
} from 'ramda';

export {
    /**
     * Returns a "view" of the given data structure, determined by the given lens.
     * The lens's focus determines which portion of the data structure is visible.
     *
     * @category Object
     * @param {Lens} lens
     * @param {*} x
     * @returns {*}
     * @see {@link prop|prop}
     * @see {@link lensIndex|lensIndex}
     * @see {@link lensProp|lensProp}
     * @example
     * import { lensProp, view } from '@blue/util';
     * const xLens = lensProp( 'x' );
     * view( xLens, { x: 1, y: 2 } );  //=> 1
     * view( xLens, { x: 4, y: 2 } );  //=> 4
     */
    view,
} from 'ramda';

export {
    /**
     * Tests the final argument by passing it to the given predicate function. If
     * the predicate is satisfied, the function will return the result of calling
     * the `whenTrueFn` function with the same argument. If the predicate is not
     * satisfied, the argument is returned as is.
     *
     * @category Logic
     * @param {function} pred       A predicate function
     * @param {function} whenTrueFn A function to invoke when the `condition` evaluates to a truthy value.
     * @param {*}        x          An object to test with the `pred` function and pass to `whenTrueFn` if necessary.
     * @returns {*} Either `x` or the result of applying `x` to `whenTrueFn`.
     * @see {@link ifElse|ifElse}
     * @see {@link unless|unless}
     * @see {@link cond|cond}
     * @example
     * import { __, append, gt, join, pipe, propSatisfies, take, when } from '@blue/util';
     * // truncate :: String -> String
     * const truncate = when(
     *  propSatisfies( gt( __, 10 ), 'length' ),
     *  pipe( take( 10 ), append( '…' ), join( '' ) )
     * );
     * truncate( '12345' );         //=> '12345'
     * truncate( '0123456789ABC' ); //=> '0123456789…'
     */
    when,
} from 'ramda';

export {
    /**
     * Takes a spec object and a test object; returns true if the test satisfies
     * the spec. Each of the spec's own properties must be a predicate function.
     * Each predicate is applied to the value of the corresponding property of the
     * test object. `where` returns true if all the predicates return true, false
     * otherwise.
     *
     * `where` is well suited to declaratively expressing constraints for other
     * functions such as [`filter`](#filter) and [`find`](#find).
     *
     * @category Object
     * @param {Object} spec
     * @param {Object} testObj
     * @returns {boolean}
     * @see {@link propSatisfies|propSatisfies}
     * @see {@link whereEq|whereEq}
     * @example
     * import { __, complement, equals, gt, lt, where } from '@blue/util';
     * // pred :: Object -> Boolean
     * const pred = where( {
     *  a: equals( 'foo' ),
     *  b: complement( equals( 'bar' ) ),
     *  x: gt( __, 10 ),
     *  y: lt( __, 20 )
     * } );
     *
     * pred( { a: 'foo', b: 'xxx', x: 11, y: 19 } ); //=> true
     * pred( { a: 'xxx', b: 'xxx', x: 11, y: 19 } ); //=> false
     * pred( { a: 'foo', b: 'bar', x: 11, y: 19 } ); //=> false
     * pred( { a: 'foo', b: 'xxx', x: 10, y: 19 } ); //=> false
     * pred( { a: 'foo', b: 'xxx', x: 11, y: 20 } ); //=> false
     */
    where,
} from 'ramda';

export {
    /**
     * Takes a spec object and a test object; returns true if the test satisfies
     * the spec, false otherwise. An object satisfies the spec if, for each of the spec's
     * own properties, accessing that property of the object gives the same
     * value (in `R.equals` terms) as accessing that property of the spec.
     *
     * `whereAny` is well suited to declaratively expressing constraints for other
     * functions such as `filter` and `find`.
     *
     * @category Object
     * @param {Object} spec
     * @param {Object} testObj
     * @returns {boolean}
     * @see {@link where|where}
     * @see {@link whereEq|whereEq}
     * @example
     * import { whereAny } from '@blue/util';
     * const spec = {x: 2, y: 1};
     * whereAny(spec, {w: 10, x: 2, y: 1, z: 3}); //=> true
     * whereAny(spec, {w: 10, x: 2, y: 2, z: 3}); //=> true
     * whereAny(spec, {w: 10, x: 3, y: 3, z: 3}); //=> false
     */
    whereAny,
} from 'ramda';

export {
    /**
     * Takes a spec object and a test object; returns true if the test satisfies
     * the spec, false otherwise. An object satisfies the spec if, for each of the
     * spec's own properties, accessing that property of the object gives the same
     * value (in [`equals`](#equals) terms) as accessing that property of the
     * spec.
     *
     * `whereEq` is a specialization of [`where`](#where).
     *
     * @category Object
     * @param {Object} spec
     * @param {Object} testObj
     * @returns {boolean}
     * @see {@link propEq|propEq}
     * @see {@link where|where}
     * @example
     * // pred :: Object -> Boolean
     * const pred = whereEq( { a: 1, b: 2 } );
     *
     * pred( { a: 1 } );              //=> false
     * pred( { a: 1, b: 2 } );        //=> true
     * pred( { a: 1, b: 2, c: 3 } );  //=> true
     * pred( { a: 1, b: 1 } );        //=> false
     */
    whereEq,
} from 'ramda';

export {
    /**
     * Returns a new list without values in the first argument.
     * [`equals`](#equals) is used to determine equality.
     *
     * Acts as a transducer if a transformer is given in list position.
     *
     * @category List
     * @param {Array} list1 The values to be removed from `list2`.
     * @param {Array} list2 The array to remove values from.
     * @returns {Array} The new array without values in `list1`.
     * @see {@link transduce|transduce}
     * @see {@link difference|difference}
     * @see {@link remove|remove}
     * @example
     * without( [ 1, 2 ], [ 1, 2, 1, 3, 4 ] ); //=> [ 3, 4 ]
     */
    without,
} from 'ramda';

export {
    /**
     * Creates a new list out of the two supplied by creating each possible pair
     * from the lists.
     *
     * @category List
     * @param {Array} as The first list.
     * @param {Array} bs The second list.
     * @returns {Array} The list made by combining each possible pair from `as` and `bs` into pairs (`[a, b]`).
     * @example
     * xprod( [ 1, 2 ], [ 'a', 'b' ] );
     * //=> [ [ 1, 'a' ], [ 1, 'b' ], [ 2, 'a' ], [ 2, 'b' ] ]
     */
    xprod,
} from 'ramda';

export {
    /**
     * Creates a new list out of the two supplied by pairing up equally-positioned
     * items from both lists. The returned list is truncated to the length of the
     * shorter of the two input lists.
     * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
     *
     * @category List
     * @param {Array} list1 The first array to consider.
     * @param {Array} list2 The second array to consider.
     * @returns {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
     * @example
     * zip( [ 1, 2, 3 ], [ 'a', 'b', 'c' ] );
     * //=> [ [ 1, 'a' ], [ 2, 'b' ], [ 3, 'c' ] ]
     */
    zip,
} from 'ramda';

export {
    /**
     * Creates a new object out of a list of keys and a list of values.
     * Key/value pairing is truncated to the length of the shorter of the two lists.
     * Note: `zipObj` is equivalent to `pipe(zip, fromPairs)`.
     *
     * @category List
     * @param {Array} keys The array that will be properties on the output object.
     * @param {Array} values The list of values on the output object.
     * @returns {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
     * @example
     * zipObj( [ 'a', 'b', 'c' ], [ 1, 2, 3 ] );
     * //=> { a: 1, b: 2, c: 3 }
     */
    zipObj,
} from 'ramda';

export {
    /**
     * Creates a new list out of the two supplied by applying the function to each
     * equally-positioned pair in the lists. The returned list is truncated to the
     * length of the shorter of the two input lists.
     *
     * @category List
     * @param {function} fn The function used to combine the two elements into one value.
     * @param {Array} list1 The first array to consider.
     * @param {Array} list2 The second array to consider.
     * @returns {Array} The list made by combining same-indexed elements of `list1` and `list2` using `fn`.
     * @example
     * const f = ( x, y ) => {
     *  // ...
     * };
     * zipWith( f, [ 1, 2, 3 ], [ 'a', 'b', 'c' ] );
     * //=> [ f( 1, 'a' ), f( 2, 'b' ), f( 3, 'c' ) ]
     */
    zipWith,
} from 'ramda';

export {
    /**
     * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
     * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative) into an
     * Applicative of Traversable.
     *
     * Dispatches to the `sequence` method of the second argument, if present.
     *
     * @category List
     * @param {function} of
     * @param {*} traversable
     * @returns {*}
     * @see {@link traverse|traverse}
     * @example
     * import { of, sequence } from '@blue/util';
     * sequence( Maybe.of, [ Just( 1 ), Just( 2 ), Just( 3 ) ] ); //=> Just( [ 1, 2, 3 ] )
     * sequence( Maybe.of, [ Just( 1 ), Just( 2 ), Nothing() ] ); //=> Nothing()
     *
     * sequence( of, Just( [ 1, 2, 3 ] ) ); //=> [ Just( 1 ), Just( 2 ), Just( 3 ) ]
     * sequence( of, Nothing() );           //=> [ Nothing() ]
     */
    // @ts-ignore
    sequence,
} from 'ramda';

// Date
export * from './date/index.js';

// List
export { default as fromRepeatedPairs } from './list/from-repeated-pairs';
export { default as range } from './list/range';
export { default as rangeN } from './list/range-n';
export { default as regExpRange } from './list/reg-exp-range';
export { default as sample } from './list/sample';
export { default as shuffle } from './list/shuffle';
export { default as trailingJoin } from './list/trailing-join';

// Math
export { default as guid } from './math/guid';
export { default as random } from './math/random';
export { default as rand } from './math/rand';
export { default as randHex } from './math/rand-hex';
export { default as randInt } from './math/rand-int';

// String
export { default as decodeHTML } from './string/decode-html';
export { default as decodeURIComponent } from './string/decode-uri-component';
export { default as encodeHTML } from './string/encode-html';
export { default as encodeURIComponent } from './string/encode-uri-component';
export { default as interpolate } from './string/interpolate';
export { default as removeNonPrintable } from './string/remove-non-printable';
export { default as removeNonWord } from './string/remove-non-word';
export { default as replaceDiacritics } from './string/replace-diacritics';
export { default as slugify } from './string/slugify';
export { default as toCamel } from './string/to-camel';
export { default as toPascal } from './string/to-pascal';
export { default as toProper } from './string/to-proper';
export { default as toRegExp } from './string/to-reg-exp';
export { default as toSentence } from './string/to-sentence';
export { default as toString } from './string/to-string';
export { default as trailingSplit } from './string/trailing-split';

// Type
export { default as isConstructor } from './type/is-constructor';
export { default as isValidDate } from './type/is-valid-date';
export { default as isFunction } from './type/is-function';
export { default as isNumber } from './type/is-number';
export { default as isNumeric } from './type/is-numeric';
export { default as isString } from './type/is-string';
export { default as like } from './type/like';
export { default as likeArray } from './type/like-array';
export { default as likePromise } from './type/like-promise';

// Category modules
export * as fn from './function/index.js';
export * as list from './list/index.js';
export * as logic from './logic/index.js';
export * as math from './math/index.js';
export * as object from './object/index.js';
export * as relation from './relation/index.js';
export * as string from './string/index.js';
export { default as types } from './type/index.js';
