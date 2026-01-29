/**
 * @author Jeff Rose
 * @module object
 */

import {
    assoc,
    assocPath,
    bind,
    clone,
    dissoc,
    dissocPath,
    eqProps,
    evolve,
    forEachObjIndexed,
    has,
    hasIn,
    hasPath,
    invert,
    invertObj,
    keys,
    keysIn,
    lens,
    lensIndex,
    lensPath,
    lensProp,
    mapObjIndexed,
    mergeDeepLeft,
    mergeDeepRight,
    mergeDeepWith,
    mergeDeepWithKey,
    mergeLeft,
    mergeRight,
    mergeWith,
    mergeWithKey,
    objOf,
    omit,
    over,
    path,
    pathOr,
    pick,
    pickAll,
    pickBy,
    project,
    prop,
    propOr,
    props,
    set,
    toPairs,
    toPairsIn,
    values,
    valuesIn,
    view,
    where,
    whereAny,
    whereEq,
} from 'ramda';

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
export { assoc };

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
export { assocPath };

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
export { clone };

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
export { dissoc };

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
export { dissocPath };

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
export { eqProps };

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
export { evolve };

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
export { forEachObjIndexed };

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
export { has };

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
export { hasIn };

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
export { hasPath };

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
export { invert };

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
export { invertObj };

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
export { keys };

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
export { keysIn };

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
export { lens };

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
export { lensIndex };

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
export { lensPath };

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
export { lensProp };

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
export { mapObjIndexed };

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
export { mergeDeepLeft };

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
export { mergeDeepRight };

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
export { mergeDeepWith };

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
export { mergeDeepWithKey };

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
export { mergeLeft };

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
export { mergeRight };

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
export { mergeWith };

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
export { mergeWithKey };

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
export { objOf };

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
export { omit };

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
export { over };

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
export { path };

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
export { pathOr };

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
export { pick };

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
export { pickAll };

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
export { pickBy };

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
export { project };

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
export { prop };

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
export { propOr };

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
export { props };

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
export { set };

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
export { toPairs };

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
export { toPairsIn };

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
export { values };

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
export { valuesIn };

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
export { view };

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
export { where };

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
export { whereAny };

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
export { whereEq };

export default {
    assoc,
    assocPath,
    bind,
    clone,
    dissoc,
    dissocPath,
    eqProps,
    evolve,
    forEachObjIndexed,
    has,
    hasIn,
    hasPath,
    invert,
    invertObj,
    keys,
    keysIn,
    lens,
    lensIndex,
    lensPath,
    lensProp,
    mapObjIndexed,
    mergeDeepLeft,
    mergeDeepRight,
    mergeDeepWith,
    mergeDeepWithKey,
    mergeLeft,
    mergeRight,
    mergeWith,
    mergeWithKey,
    objOf,
    omit,
    over,
    path,
    pathOr,
    pick,
    pickAll,
    pickBy,
    project,
    prop,
    propOr,
    props,
    set,
    toPairs,
    toPairsIn,
    values,
    valuesIn,
    view,
    where,
    whereAny,
    whereEq,
};
