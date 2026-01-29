/**
 * @author Jeff Rose
 * @module list
 */
import { addIndex, addIndexRight, adjust, all, any, aperture, append, chain, collectBy, concat, count, drop, dropLast, dropLastWhile, dropRepeats, dropRepeatsBy, dropRepeatsWith, dropWhile, endsWith, filter, find, findIndex, findLast, findLastIndex, flatten, forEach, fromPairs, groupBy, groupWith, head, includes, indexBy, indexOf, init, insert, insertAll, intersperse, into, join, last, lastIndexOf, length, map, mapAccum, mapAccumRight, mergeAll, none, nth, pair, partition, pluck, prepend, reduce, reduceBy, reduceRight, reduceWhile, reduced, reject, remove, repeat, reverse, scan, slice, sort, splitAt, splitEvery, splitWhen, startsWith, tail, take, takeLast, takeLastWhile, takeWhile, times, transduce, transpose, traverse, unfold, uniq, uniqBy, uniqWith, unnest, update, without, xprod, zip, zipObj, zipWith } from 'ramda';
import shuffle from './shuffle.js';
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
export { adjust };
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
export { all };
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
export { any };
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
export { aperture };
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
export { append };
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
export { chain };
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
export { collectBy };
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
export { concat };
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
export { count };
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
export { drop };
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
export { dropLast };
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
export { dropLastWhile };
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
export { dropRepeats };
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
export { dropRepeatsBy };
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
export { dropRepeatsWith };
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
export { dropWhile };
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
export { endsWith };
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
export { filter };
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
export { find };
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
export { findIndex };
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
export { findLast };
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
export { findLastIndex };
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
export { flatten };
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
export { forEach };
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
export { fromPairs };
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
export { groupWith };
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
export { head };
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
export { includes };
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
export { indexOf };
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
export { init };
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
export { insert };
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
export { insertAll };
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
export { intersperse };
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
export { into };
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
export { join };
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
export { last };
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
export { lastIndexOf };
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
export { length };
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
export { map };
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
export { mapAccum };
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
export { mapAccumRight };
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
export { none };
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
export { nth };
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
export { pair };
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
export { partition };
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
export { pluck };
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
export { prepend };
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
export { reduce };
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
export { reduceBy };
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
export { reduceRight };
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
export { reduceWhile };
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
export { reduced };
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
export { reject };
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
export { remove };
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
export { repeat };
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
export { reverse };
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
export { scan };
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
export { slice };
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
export { sort };
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
export { splitAt };
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
export { splitEvery };
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
export { splitWhen };
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
export { startsWith };
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
export { tail };
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
export { take };
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
export { takeLast };
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
export { takeLastWhile };
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
export { takeWhile };
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
export { times };
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
export { transduce };
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
export { transpose };
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
export { traverse };
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
export { unfold };
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
export { uniq };
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
export { uniqBy };
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
export { uniqWith };
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
export { unnest };
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
export { update };
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
export { without };
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
export { zip };
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
export { zipObj };
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
export { zipWith };
declare const _default: {
    addIndex: typeof addIndex;
    addIndexRight: typeof addIndexRight;
    adjust: typeof adjust;
    all: typeof all;
    any: typeof any;
    aperture: typeof aperture;
    append: typeof append;
    chain: typeof chain;
    collectBy: typeof collectBy;
    concat: typeof concat;
    count: typeof count;
    drop: typeof drop;
    dropLast: typeof dropLast;
    dropLastWhile: typeof dropLastWhile;
    dropRepeats: typeof dropRepeats;
    dropRepeatsBy: typeof dropRepeatsBy;
    dropRepeatsWith: typeof dropRepeatsWith;
    dropWhile: typeof dropWhile;
    endsWith: typeof endsWith;
    filter: typeof filter;
    find: typeof find;
    findIndex: typeof findIndex;
    findLast: typeof findLast;
    findLastIndex: typeof findLastIndex;
    flatten: typeof flatten;
    forEach: typeof forEach;
    fromPairs: typeof fromPairs;
    fromRepeatedPairs: (pairs: [any, any][]) => {
        any?: any | any[];
    };
    groupBy: typeof groupBy;
    groupWith: typeof groupWith;
    head: typeof head;
    includes: typeof includes;
    indexBy: typeof indexBy;
    indexOf: typeof indexOf;
    init: typeof init;
    insert: typeof insert;
    insertAll: typeof insertAll;
    intersperse: typeof intersperse;
    into: typeof into;
    join: typeof join;
    last: typeof last;
    lastIndexOf: typeof lastIndexOf;
    length: typeof length;
    map: typeof map;
    mapAccum: typeof mapAccum;
    mapAccumRight: typeof mapAccumRight;
    mergeAll: typeof mergeAll;
    none: typeof none;
    nth: typeof nth;
    pair: typeof pair;
    partition: typeof partition;
    pluck: typeof pluck;
    prepend: typeof prepend;
    range: (from: number, to?: number) => number[];
    rangeN: {
        (step: number, from: number, to?: number): number[];
        (step: number): (from: number, to?: number) => number[];
        (step: number, from: number): (to?: number) => number[];
    };
    reduce: typeof reduce;
    reduceBy: typeof reduceBy;
    reduceRight: typeof reduceRight;
    reduceWhile: typeof reduceWhile;
    reduced: typeof reduced;
    regExpRange: {
        (from: import("../type/is-numeric.js").Numeric, to?: import("../type/is-numeric.js").Numeric, init?: import("./reg-exp-range.js").RegExpRangeInit): string;
        cache: Map<string, {
            a: number;
            b: number;
            isPadded?: boolean;
            maxLen?: number;
            min: import("../type/is-numeric.js").Numeric;
            max: import("../type/is-numeric.js").Numeric;
            negatives?: {
                pattern: string;
                count: number[];
                digits: number;
                value?: string;
            }[];
            positives?: {
                pattern: string;
                count: number[];
                digits: number;
                value?: string;
            }[];
            result?: string;
        }>;
        clearCache(): void;
    };
    reject: typeof reject;
    remove: typeof remove;
    repeat: typeof repeat;
    reverse: typeof reverse;
    sample: {
        <T = any>(n: number, list: ArrayLike<T>): T[];
        <T = any>(n: number): (list: ArrayLike<T>) => T[];
    };
    scan: typeof scan;
    sequence: any;
    shuffle: typeof shuffle;
    slice: typeof slice;
    sort: typeof sort;
    splitAt: typeof splitAt;
    splitEvery: typeof splitEvery;
    splitWhen: typeof splitWhen;
    startsWith: typeof startsWith;
    tail: typeof tail;
    take: typeof take;
    takeLast: typeof takeLast;
    takeLastWhile: typeof takeLastWhile;
    takeWhile: typeof takeWhile;
    times: typeof times;
    trailingJoin: {
        (separator: string, list: any[]): string;
        (separator: string): (list: any[]) => string;
    };
    transduce: typeof transduce;
    transpose: typeof transpose;
    traverse: typeof traverse;
    unfold: typeof unfold;
    uniq: typeof uniq;
    uniqBy: typeof uniqBy;
    uniqWith: typeof uniqWith;
    unnest: typeof unnest;
    update: typeof update;
    without: typeof without;
    xprod: typeof xprod;
    zip: typeof zip;
    zipObj: typeof zipObj;
    zipWith: typeof zipWith;
};
export default _default;
//# sourceMappingURL=index.d.ts.map