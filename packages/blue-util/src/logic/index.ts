/**
 * @author Jeff Rose
 * @module logic
 */

// Import Ramda Logic functions for re-export
import {
    allPass,
    and,
    anyPass,
    both,
    complement,
    cond,
    defaultTo,
    either,
    ifElse,
    isEmpty,
    isNotEmpty,
    not,
    or,
    pathSatisfies,
    propSatisfies,
    unless,
    until,
    when,
} from 'ramda';

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
export { allPass };

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
export { and };

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
export { anyPass };

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
export { both };

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
export { complement };

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
export { cond };

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
export { defaultTo };

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
export { either };

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
export { ifElse };

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
export { isEmpty };

export { pathSatisfies };

/**
 * Returns `true` if the specified object property satisfies the given predicate.
 *
 * @category Logic
 * @param {function} pred The predicate to apply to the property value
 * @param {string} name The property name
 * @param {*} obj The object to test
 * @returns {boolean}
 * @example
 * import { __, gt, propSatisfies } from '@blue/util';
 * const hasLongName = propSatisfies( gt( __, 10 ), 'length' );
 * hasLongName( 'short' ); //=> false
 */
export { propSatisfies };

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
export { not };

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
export { or };

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
export { unless };

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
export { until };

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
export { when };

export default {
    allPass,
    and,
    anyPass,
    both,
    complement,
    cond,
    defaultTo,
    either,
    ifElse,
    isEmpty,
    isNotEmpty,
    not,
    or,
    pathSatisfies,
    propSatisfies,
    unless,
    until,
    when,
};
