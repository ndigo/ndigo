/**
 * @author Jeff Rose
 */
import randHex from './rand-hex.js';
import sample from '../list/sample.js';
/**
 * Generates a pseudo-random Globally Unique Identifier (v4).
 * Since the total number of GUIDs is 2^122 the chance of generating the same value twice is negligible.
 * @returns {string}
 * @category Math
 * @example
 * guid();
 * //=> "830e9f50-ac7f-4369-a14f-ed0e62b2fa0b"
 * guid();
 * //=> "5de3d09b-e79c-4727-932b-48c49228d508"
 */
const guid = () => `${randHex(8)}-${randHex(4)}-4${randHex(3)}-${sample(1, [8, 9, 'a', 'b']) + randHex(3)}-${randHex(12)}`;
export default guid;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXRoL2d1aWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLE9BQU8sTUFBTSxlQUFlLENBQUM7QUFDcEMsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUM7QUFFdkM7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUN0QixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUU1RyxlQUFlLElBQUksQ0FBQyJ9