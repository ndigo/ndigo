/**
 * @author Jeff Rose
 * @see {@link https://github.com/davidbau/seedrandom}
 */
import alea from 'seedrandom/lib/alea.js';
function seed() {
    try {
        const values = new Uint8Array(256);
        // Try Web Crypto API (available in modern browsers and Node.js 15+)
        if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(values);
        }
        else {
            // Fallback to less secure random if no crypto implementation is available
            console.warn('No cryptographic implementation available, falling back to Math.random for seed.');
            for (let i = 0; i < 256; i++) {
                values[i] = Math.floor(Math.random() * 256);
            }
        }
        // Convert to base64 for compact representation
        return btoa(String.fromCharCode(...values));
    }
    catch (e) {
        console.warn('Failed to generate cryptographic seed, using timestamp as fallback:', e);
        return `${Date.now()}-${Math.random()}`;
    }
}
/**
 * Generates a pseudo-random number.
 * @category Math
 * @returns {number} A pseudo-random number between `0` and `1`.
 * @example
 * random();
 * //=> 0.9282578795792454
 * random();
 * //=> 0.3752569768646784
 */
const random = alea(seed(), { entropy: true }).double;
export default random;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hdGgvcmFuZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sSUFBSSxNQUFNLHdCQUF3QixDQUFDO0FBRTFDLFNBQVMsSUFBSTtJQUNULElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLG9FQUFvRTtRQUNwRSxJQUFJLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxXQUFXLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNoRixVQUFVLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxDQUFDO2FBQU0sQ0FBQztZQUNKLDBFQUEwRTtZQUMxRSxPQUFPLENBQUMsSUFBSSxDQUFDLGtGQUFrRixDQUFDLENBQUM7WUFDakcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMzQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNMLENBQUM7UUFFRCwrQ0FBK0M7UUFDL0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLHFFQUFxRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7SUFDNUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLE1BQU0sR0FBaUIsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBRXBFLGVBQWUsTUFBTSxDQUFDIn0=