/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
/**
 * Determines whether a given object is an array-like.
 * @function module:util.likeArray
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is an array-like.
 * @example
 * likeArray( [] );
 * //=> true
 * likeArray( '' );
 * //=> true
 * likeArray( { 0: 'zero', 9: 'nine', length: 10 } );
 * //=> true
 * likeArray( { length: 0 } );
 * //=> true
 * likeArray( { length: 10 } );
 * //=> false
 * likeArray( {} );
 * //=> false
 */
declare const likeArray: (value: any) => value is ArrayLike<any>;
export default likeArray;
//# sourceMappingURL=like-array.d.ts.map