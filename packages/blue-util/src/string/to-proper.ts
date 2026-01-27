/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#properCase}
 */

import { pipe, toLower, toUpper } from 'ramda';

const regex = /^\w|\s\w/g;

/**
 * Returns the proper case version of a string.
 * @param {string} value
 * @returns {string}
 * @category String
 * @example
 * toProper( 'lorem-ipsum-dolor' );
 * //=> "Lorem Ipsum Dolor"
 */
const toProper: (value: string) => string = pipe(toLower, (value: string): string => value.replace(regex, toUpper));

export default toProper;
