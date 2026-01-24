/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
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
declare const toRegExp: (value: string) => RegExp;
export default toRegExp;
//# sourceMappingURL=to-reg-exp.d.ts.map