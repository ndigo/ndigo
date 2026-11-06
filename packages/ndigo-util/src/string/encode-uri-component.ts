/**
 * URI component encoding.
 */
const charMatcher = /[!'()*]/g,
    hexEncode = (value: string): string => `%${value.charCodeAt(0).toString(16).toUpperCase()}`,
    strictEncodeURIComponent = (value: string): string => encodeURIComponent(value).replace(charMatcher, hexEncode);

/**
 * A stricter URI encode adhering to {@link https://tools.ietf.org/html/rfc3986|RFC 3986}.
 *
 * @param value - A string value.
 * @returns The encoded string.
 *
 * @example
 * ```ts
 * encodeURIComponent('unicorn!foobar'); //=> 'unicorn%21foobar'
 * encodeURIComponent('unicorn*foobar'); //=> 'unicorn%2Afoobar'
 * ```
 */
export default strictEncodeURIComponent;
