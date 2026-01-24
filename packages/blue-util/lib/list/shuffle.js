/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import randInt from '../math/rand-int';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2h1ZmZsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXN0L3NodWZmbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxPQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFFdkM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLE9BQU8sQ0FBVSxJQUFrQjtJQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUN0QixNQUFNLEdBQVEsRUFBRSxDQUFDO0lBQ3JCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUNWLFFBQWdCLENBQUM7SUFFckIsT0FBTyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUN0QixRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMifQ==