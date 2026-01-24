/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#slugify}
 * @see {@link https://github.com/dodo/node-slug}
 */

import { curry, pipe, toLower } from 'ramda';

import removeNonWord from './remove-non-word';
import slug from 'slug';

/**
 * Converts a string into a slug.
 * @function module:util.slugify
 * @category String
 * @param {external:string} delimiter The character with which spaces will be replaced.
 * @param {external:string} value The value to be slugified.
 * @returns {external:string} The slugified string.
 * @example
 * const hyphenate = slugify( '-' );
 * hyphenate( 'Lorem Ipsum Dolor' );
 * //=> "lorem-ipsum-dolor"
 * slugify( '~', 'Lorem Ipsum Dolor' );
 * //=> "lorem~ipsum~dolor"
 */
const slugify = curry((delimiter: string, value: string): string =>
    pipe(
        removeNonWord,
        (val: string) => slug(val, { remove: null, replacement: delimiter, lower: false }),
        toLower
    )(value)
);

export default slugify;
