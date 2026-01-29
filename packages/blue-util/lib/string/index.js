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
 * Tests a regular expression against a String.
 * @category String
 * @param {RegExp} regexp
 * @param {string} str
 * @returns {Array|null}
 */
export { match };
/**
 * Replace a substring or regex match in a string with a replacement.
 * @category String
 * @param {RegExp|string} pattern
 * @param {string} replacement
 * @param {string} str
 * @returns {string}
 */
export { replace };
/**
 * Splits a string into an array of strings based on the given separator.
 * @category String
 * @param {string|RegExp} sep
 * @param {string} str
 * @returns {Array}
 */
export { split };
/**
 * Determines whether a given string matches a given regular expression.
 * @category String
 * @param {RegExp} pattern
 * @param {string} str
 * @returns {boolean}
 */
export { test };
/**
 * The lower case version of a string.
 * @category String
 * @param {string} str
 * @returns {string}
 */
export { toLower };
/**
 * The upper case version of a string.
 * @category String
 * @param {string} str
 * @returns {string}
 */
export { toUpper };
/**
 * Removes whitespace from both ends of the string.
 * @category String
 * @param {string} str
 * @returns {string}
 */
export { trim };
// Export custom functions
export { decodeHtml, decodeURIComponent, encodeHtml, encodeURIComponent, interpolate, removeNonPrintable, removeNonWord, replaceDiacritics, slugify, toCamel, toPascal, toProper, toRegExp, toSentence, toString, trailingSplit, };
// Default export: namespace object
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILDhDQUE4QztBQUM5QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRTVFLHdDQUF3QztBQUN4QyxPQUFPLFVBQVUsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLGtCQUFrQixNQUFNLDJCQUEyQixDQUFDO0FBQzNELE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sa0JBQWtCLE1BQU0sMkJBQTJCLENBQUM7QUFDM0QsT0FBTyxXQUFXLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxrQkFBa0IsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRCxPQUFPLGFBQWEsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLGlCQUFpQixNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sT0FBTyxNQUFNLGNBQWMsQ0FBQztBQUNuQyxPQUFPLE9BQU8sTUFBTSxlQUFlLENBQUM7QUFDcEMsT0FBTyxRQUFRLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxRQUFRLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxRQUFRLE1BQU0sZ0JBQWdCLENBQUM7QUFDdEMsT0FBTyxhQUFhLE1BQU0scUJBQXFCLENBQUM7QUFFaEQ7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBRWpCOzs7Ozs7O0dBT0c7QUFDSCxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFFbkI7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBRWpCOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUVoQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUVuQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUVuQjs7Ozs7R0FLRztBQUNILE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUVoQiwwQkFBMEI7QUFDMUIsT0FBTyxFQUNILFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsVUFBVSxFQUNWLGtCQUFrQixFQUNsQixXQUFXLEVBQ1gsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLGFBQWEsR0FDaEIsQ0FBQztBQUVGLG1DQUFtQztBQUNuQyxlQUFlO0lBQ1gsVUFBVTtJQUNWLGtCQUFrQjtJQUNsQixVQUFVO0lBQ1Ysa0JBQWtCO0lBQ2xCLFdBQVc7SUFDWCxLQUFLO0lBQ0wsa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixPQUFPO0lBQ1AsaUJBQWlCO0lBQ2pCLE9BQU87SUFDUCxLQUFLO0lBQ0wsSUFBSTtJQUNKLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsVUFBVTtJQUNWLFFBQVE7SUFDUixPQUFPO0lBQ1AsYUFBYTtJQUNiLElBQUk7Q0FDUCxDQUFDIn0=