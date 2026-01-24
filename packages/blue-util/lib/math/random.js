/**
 * @author Jeff Rose
 * @see {@link https://github.com/davidbau/seedrandom}
 */
import alea from 'seedrandom/lib/alea';
function seed() {
    try {
        const values = new Uint8Array(256);
        crypto.getRandomValues(values);
        return String.fromCharCode.apply(0, values);
    }
    catch (e) {
        return String(Date.now);
    }
}
/**
 * Generates a pseudo-random number.
 * @function module:util.random
 * @category Math
 * @returns {external:number} A pseudo-random number between `0` and `1`.
 * @example
 * random();
 * //=> 0.9282578795792454
 * random();
 * //=> 0.3752569768646784
 */
const random = alea(seed(), { entropy: true }).double;
export default random;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hdGgvcmFuZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sSUFBSSxNQUFNLHFCQUFxQixDQUFDO0FBRXZDLFNBQVMsSUFBSTtJQUNULElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDVCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxNQUFNLEdBQWlCLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUVwRSxlQUFlLE1BQU0sQ0FBQyJ9