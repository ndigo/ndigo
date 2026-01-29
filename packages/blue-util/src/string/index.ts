/**
 * @author Jeff Rose
 * @module string
 */

// Import Ramda String functions for re-export
import { match, replace, split, test, toLower, toUpper, trim } from 'ramda';

// Import custom functions for re-export
import decodeHtml from './decode-html.js';
import decodeURIComponent from './decode-uri-component.js';
import encodeHtml from './encode-html.js';
import encodeURIComponent from './encode-uri-component.js';
import interpolate from './interpolate.js';
import removeNonPrintable from './remove-non-printable.js';
import removeNonWord from './remove-non-word.js';
import replaceDiacritics from './replace-diacritics.js';
import slugify from './slugify.js';
import toCamel from './to-camel.js';
import toPascal from './to-pascal.js';
import toProper from './to-proper.js';
import toRegExp from './to-reg-exp.js';
import toSentence from './to-sentence.js';
import toString from './to-string.js';
import trailingSplit from './trailing-split.js';

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
export { match };

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
export { replace };

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
export { split };

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
export { test };

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
export { toLower };

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
export { toUpper };

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
export { trim };

// Export custom functions
export {
    decodeHtml,
    decodeURIComponent,
    encodeHtml,
    encodeURIComponent,
    interpolate,
    removeNonPrintable,
    removeNonWord,
    replaceDiacritics,
    slugify,
    toCamel,
    toPascal,
    toProper,
    toRegExp,
    toSentence,
    toString,
    trailingSplit,
};

export default {
    decodeHtml,
    decodeURIComponent,
    encodeHtml,
    encodeURIComponent,
    interpolate,
    match,
    removeNonPrintable,
    removeNonWord,
    replace,
    replaceDiacritics,
    slugify,
    split,
    test,
    toCamel,
    toLower,
    toPascal,
    toProper,
    toRegExp,
    toSentence,
    toString,
    toUpper,
    trailingSplit,
    trim,
};
