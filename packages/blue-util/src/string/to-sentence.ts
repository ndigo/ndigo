/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#sentenceCase}
 */

import { pipe, toLower, toUpper } from 'ramda';

const regex = /(^\w)|\.\s+(\w)/gm;

/**
 * Returns the sentence case version of a string.
 * @function module:util.toSentence
 * @param {external:string} value
 * @returns {external:string}
 * @category String
 * @example
 * toSentence( 'lorem-ipsum-dolor' );
 * //=> "Lorem ipsum dolor"
 */
const toSentence: ( value: string ) => string = pipe(
    toLower,
    ( value: string ): string => value.replace( regex, toUpper )
);

export default toSentence;
