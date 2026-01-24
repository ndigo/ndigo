/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
/**
 * @function module:util.shuffle
 * @category List
 * @param {external:ArrayLike} list The list to be shuffled.
 * @returns {external:Array} The shuffled list.
 * @example
 * let list = [ "a", "b", "c" ];
 * shuffle( list );
 * //=> [ "c", "a", "b" ]
 * shuffle( list );
 * //=> [ "a", "c", "b" ]
 */
export default function shuffle<T = any>(list: ArrayLike<T>): T[];
//# sourceMappingURL=shuffle.d.ts.map