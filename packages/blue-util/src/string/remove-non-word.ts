/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonWord}
 */

import { replace } from 'ramda';

const nonWord = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;

/**
 * Parses a piped list string into an object.
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-word characters removed.
 * @category String
 * @example
 * removeNonWord( "lorem ~!@#$%^&*()_+`-={}[]|\\:\";'/?><., ipsum" );
 * //=> "lorem - ipsum"
 */
const removeNonWord: (value: string) => string = replace(nonWord, '');

export default removeNonWord;
