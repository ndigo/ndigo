/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
declare const toQueryString: (object: any) => string;
/**
 * Parses an object to query string.
 * @function module:router.toQueryString
 * @category Object
 * @param {external:Object} object
 * @returns {external:string}
 * @example
 * toQueryString( { e:6, a:1, b:2, c:[3,4], d:5 } );
 * //=> "a=1&b=2&c=3&c=4&d=5&e=6"
 */
export default toQueryString;
//# sourceMappingURL=to-query-string.d.ts.map