/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { pipe, replace, test } from 'ramda';

const
    regExpFlags = /[gimsuy]+/g,
    leadingSlash = /^\//,
    trailingSlashAndFlags = /\/([gimsuy]*)$/,
    patternWithTrailingSlashAndFlags = /.+\/([gimsuy]*)$/,

    cache = new Map<string, RegExp>(),

    hasValidFlags = test( regExpFlags ),
    removeLeadingSlash = replace( leadingSlash, '' ),
    removeTrailingSlashAndFlags = replace( trailingSlashAndFlags, '' ),
    extractFlags = replace( patternWithTrailingSlashAndFlags, '$1' ),
    removeSlashesAndFlags = pipe( removeLeadingSlash, removeTrailingSlashAndFlags );

/**
 * Returns a regular expression for the given `pattern`.
 * @function module:util.toRegExp
 * @param {external:string} value
 * @returns {external:RegExp}
 * @example
 * toRegExp( 'foo' );
 * //=> /foo/
 * toRegExp( '/foo/' );
 * //=> /foo/
 * toRegExp( '/foo/i' );
 * //=> /foo/i
 * @category String
 */
const toRegExp = ( value: string ): RegExp => {
    let regex: RegExp;

    if( cache.has( value ) ){
        regex = cache.get( value );
    } else {
        const
            flags = extractFlags( value ),
            pattern = removeSlashesAndFlags( value );
        regex = hasValidFlags( flags ) ?
            new RegExp( pattern, flags ) :
            new RegExp( pattern );
        cache.set( value, regex );
    }

    return regex;
};

export default toRegExp;
