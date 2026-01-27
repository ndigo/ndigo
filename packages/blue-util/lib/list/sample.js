/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { curry } from 'ramda';
import randInt from '../math/rand-int';
/**
 * @category List
 * @param {number} n The number of values to be sampled.
 * @param {ArrayLike} list The list from which values will be sampled.
 * @returns {Array} The sampled value(s).
 * @example
 * let list = [ "a", "b", "c" ];
 * sample( 2, list );
 * //=> [ "c", "a" ]
 * const sampleOne = sample( 1 );
 * sampleOne( list );
 * //=> [ "b" ]
 */
const sampleOne = (list) => Array.prototype.splice.call(list, randInt(0, list.length - 1), 1)[0], sample = curry((n, list) => {
    const length = list.length, result = [];
    n = Math.max(Math.min(n, length), 1);
    while (n--) {
        result.push(sampleOne(list));
    }
    return result;
});
export default sample;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpc3Qvc2FtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDOUIsT0FBTyxPQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFPdkM7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxTQUFTLEdBQUcsQ0FBVSxJQUFrQixFQUFLLEVBQUUsQ0FDN0MsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3hFLE1BQU0sR0FBbUIsS0FBSyxDQUFDLENBQVUsQ0FBUyxFQUFFLElBQWtCLEVBQU8sRUFBRTtJQUMzRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUN0QixNQUFNLEdBQVEsRUFBRSxDQUFDO0lBRXJCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXJDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBRVAsZUFBZSxNQUFNLENBQUMifQ==