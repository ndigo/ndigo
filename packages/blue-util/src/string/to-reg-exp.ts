/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { pipe, replace } from 'ramda';

const regExpFlags = /[gimsuy]+/,
    leadingSlash = /^\//,
    trailingSlashAndFlags = /\/([gimsuy]*)$/,
    patternWithTrailingSlashAndFlags = /.+\/([gimsuy]*)$/,
    cache = new Map<string, RegExp>(),
    hasValidFlags = (value: string) => regExpFlags.test(value),
    removeLeadingSlash = replace(leadingSlash, ''),
    removeTrailingSlashAndFlags = replace(trailingSlashAndFlags, ''),
    extractFlags = replace(patternWithTrailingSlashAndFlags, '$1'),
    removeSlashesAndFlags = pipe(removeLeadingSlash, removeTrailingSlashAndFlags);

/**
 * Returns a regular expression for the given `pattern`.
 * @param {string} value
 * @returns {RegExp}
 * @example
 * toRegExp( 'foo' );
 * //=> /foo/
 * toRegExp( '/foo/' );
 * //=> /foo/
 * toRegExp( '/foo/i' );
 * //=> /foo/i
 * @category String
 */
const toRegExp = (value: string): RegExp => {
    let regex: RegExp;

    if (cache.has(value)) {
        regex = cache.get(value);
    } else {
        const flags = extractFlags(value),
            pattern = removeSlashesAndFlags(value);
        regex = hasValidFlags(flags) ? new RegExp(pattern, flags) : new RegExp(pattern);
        cache.set(value, regex);
    }

    return regex;
};

export default toRegExp;
