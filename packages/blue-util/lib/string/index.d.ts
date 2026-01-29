/**
 * @author Jeff Rose
 * @module string
 */
import { match, replace, split, test, toLower, toUpper, trim } from 'ramda';
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
export { decodeHtml, decodeURIComponent, encodeHtml, encodeURIComponent, interpolate, removeNonPrintable, removeNonWord, replaceDiacritics, slugify, toCamel, toPascal, toProper, toRegExp, toSentence, toString, trailingSplit, };
declare const _default: {
    decodeHtml: (value: string) => string;
    decodeURIComponent: typeof decodeURIComponent;
    encodeHtml: (value: string) => string;
    encodeURIComponent: (value: string) => string;
    interpolate: (template: string, replacements: string | any[] | {
        [key: string]: any;
    }, syntax?: RegExp) => string;
    match: typeof match;
    removeNonPrintable: (value: string) => string;
    removeNonWord: (value: string) => string;
    replace: typeof replace;
    replaceDiacritics: (a: string) => string;
    slugify: {
        (delimiter: string, value: string): string;
        (delimiter: string): (value: string) => string;
    };
    split: typeof split;
    test: typeof test;
    toCamel: (value: string) => string;
    toLower: typeof toLower;
    toPascal: (value: string) => string;
    toProper: (value: string) => string;
    toRegExp: (value: string) => RegExp;
    toSentence: (value: string) => string;
    toString: (value: any) => string;
    toUpper: typeof toUpper;
    trailingSplit: {
        (separator: string, text: string): string[];
        (separator: string): (text: string) => string[];
    };
    trim: typeof trim;
};
export default _default;
//# sourceMappingURL=index.d.ts.map