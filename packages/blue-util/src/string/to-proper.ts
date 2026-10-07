/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
const regex = /^\w|\s\w/g;

/**
 * Returns the proper case version of a string.
 * @param {string} value
 * @returns {string}
 * @category String
 * @example
 * toProper( 'lorem ipsum dolor' );
 * //=> "Lorem Ipsum Dolor"
 */
const toProper = (value: string): string => value.toLowerCase().replace(regex, (c: string): string => c.toUpperCase());

export default toProper;
