/**
 * @author Jeff Rose
 * @module string
 */
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
export { decodeHtml, decodeURIComponent, encodeHtml, encodeURIComponent, interpolate, removeNonPrintable, removeNonWord, replaceDiacritics, slugify, toCamel, toPascal, toProper, toRegExp, toSentence, toString, trailingSplit, };
declare const _default: {
    decodeHtml: (value: string) => string;
    decodeURIComponent: typeof decodeURIComponent;
    encodeHtml: (value: string) => string;
    encodeURIComponent: (value: string) => string;
    interpolate: (template: string, replacements: string | any[] | {
        [key: string]: any;
    }, syntax?: RegExp) => string;
    removeNonPrintable: (value: string) => string;
    removeNonWord: (value: string) => string;
    replaceDiacritics: (text: string) => string;
    slugify: (delimiter: string, value: string) => string;
    toCamel: (value: string) => string;
    toPascal: (value: string) => string;
    toProper: (value: string) => string;
    toRegExp: (value: string) => RegExp;
    toSentence: (value: string) => string;
    toString: typeof toString;
    trailingSplit: typeof trailingSplit;
};
export default _default;
