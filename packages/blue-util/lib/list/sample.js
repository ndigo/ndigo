/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { curry } from 'ramda';
import randInt from '../math/rand-int';
/**
 * @function module:util.sample
 * @category List
 * @param {external:number} n The number of values to be sampled.
 * @param {external:ArrayLike} list The list from which values will be sampled.
 * @returns {external:Array} The sampled value(s).
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpc3Qvc2FtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDOUIsT0FBTyxPQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFPdkM7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0sU0FBUyxHQUFHLENBQVUsSUFBa0IsRUFBSyxFQUFFLENBQzdDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN4RSxNQUFNLEdBQW1CLEtBQUssQ0FBQyxDQUFVLENBQVMsRUFBRSxJQUFrQixFQUFPLEVBQUU7SUFDM0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFDdEIsTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUVyQixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVyQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMsQ0FBQztBQUVQLGVBQWUsTUFBTSxDQUFDIn0=