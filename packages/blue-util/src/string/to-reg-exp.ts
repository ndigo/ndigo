/**
 * @author Jeff Rose
 */

const regExpFlags = /[gimsuy]+/,
    leadingSlash = /^\//,
    trailingSlashAndFlags = /\/([gimsuy]*)$/,
    patternWithTrailingSlashAndFlags = /.+\/([gimsuy]*)$/,
    cache = new Map<string, RegExp>(),
    hasValidFlags = (value: string) => regExpFlags.test(value),
    removeLeadingSlash = (val: string) => val.replace(leadingSlash, ''),
    removeTrailingSlashAndFlags = (val: string) => val.replace(trailingSlashAndFlags, ''),
    extractFlags = (val: string) => val.replace(patternWithTrailingSlashAndFlags, '$1'),
    removeSlashesAndFlags = (val: string) => {
        val = removeLeadingSlash(val);
        return removeTrailingSlashAndFlags(val);
    };

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
        regex = cache.get(value)!;
    } else {
        const flags = extractFlags(value),
            pattern = removeSlashesAndFlags(value);
        regex = hasValidFlags(flags) ? new RegExp(pattern, flags) : new RegExp(pattern);
        cache.set(value, regex);
    }

    return regex;
};

export default toRegExp;