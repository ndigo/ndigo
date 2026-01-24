/**
 * @author Jeff Rose
 * @see {@link https://github.com/kevva/strict-uri-encode}
 * @see {@link https://tools.ietf.org/html/rfc3986}
 */
declare const strictEncodeURIComponent: (value: string) => string;
/**
 * A stricter URI encode adhering to {@link https://tools.ietf.org/html/rfc3986|RFC 3986}
 * @function module:util.encodeURIComponent
 * @param {external:string} value A string value
 * @returns {external:string} The encoded string
 * @example
 * encodeURIComponent( 'unicorn!foobar' );
 * //=> 'unicorn%21foobar'
 * encodeURIComponent( 'unicorn*foobar' );
 * //=> 'unicorn%2Afoobar'
 * @category String
 */
export default strictEncodeURIComponent;
//# sourceMappingURL=encode-uri-component.d.ts.map