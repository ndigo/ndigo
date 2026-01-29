/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import randInt from '../math/rand-int.js';
/**
 * @category List
 * @param {ArrayLike} list The list to be shuffled.
 * @returns {Array} The shuffled list.
 * @example
 * let list = [ "a", "b", "c" ];
 * shuffle( list );
 * //=> [ "c", "a", "b" ]
 * shuffle( list );
 * //=> [ "a", "c", "b" ]
 */
export default function shuffle(list) {
    const length = list.length, result = [];
    let index = -1, position;
    while (++index < length) {
        position = randInt(0, index);
        result[index] = result[position];
        result[position] = list[index];
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2h1ZmZsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0L3NodWZmbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFFMUM7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sQ0FBQyxPQUFPLFVBQVUsT0FBTyxDQUFVLElBQWtCO0lBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQ3RCLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFDckIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQ1YsUUFBZ0IsQ0FBQztJQUVyQixPQUFPLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBQ3RCLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyJ9