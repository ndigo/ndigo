/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
declare const toMatrixString: (object: any) => string;
/**
 * Parses an object to matrix string.
 * @function module:router.toMatrixString
 * @category Object
 * @param {external:Object} object
 * @returns {external:string}
 * @example
 * toMatrixString( { e:6, a:1, b:2, c:[ 3,4 ], d:5 } );
 * //=> "a=1;b=2;c=3,4;d=5;e=6"
 */
export default toMatrixString;
//# sourceMappingURL=to-matrix-string.d.ts.map