/**
 */
const charMatcher = /[!'()*]/g,
    hexEncode = (value: string): string => `%${value.charCodeAt(0).toString(16).toUpperCase()}`,
    strictEncodeURIComponent = (value: string): string => encodeURIComponent(value).replace(charMatcher, hexEncode);

/**
 * A stricter URI encode adhering to {@link https://tools.ietf.org/html/rfc3986|RFC 3986}
 * @param {string} value A string value
 * @returns {string} The encoded string
 * @example
 * encodeURIComponent( 'unicorn!foobar' );
 * //=> 'unicorn%21foobar'
 * encodeURIComponent( 'unicorn*foobar' );
 * //=> 'unicorn%2Afoobar'
 * @category String
 */
export default strictEncodeURIComponent;
