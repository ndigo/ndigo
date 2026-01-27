/**
 * @author Jeff Rose
 * @see {@link https://github.com/davidbau/seedrandom}
 */
import alea from 'seedrandom/lib/alea';
function seed() {
    try {
        const values = new Uint8Array(256);
        // Try Web Crypto API first
        if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(values);
        }
        // Try Node.js crypto
        else if (typeof require !== 'undefined') {
            const nodeCrypto = require('crypto');
            nodeCrypto.randomFillSync(values);
        }
        else {
            throw new Error('No crypto implementation available');
        }
        // Convert to base64 for compact representation
        return btoa(String.fromCharCode(...values));
    }
    catch (e) {
        console.warn('Failed to generate cryptographic seed, using timestamp:', e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hdGgvcmFuZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sSUFBSSxNQUFNLHFCQUFxQixDQUFDO0FBRXZDLFNBQVMsSUFBSTtJQUNULElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLDJCQUEyQjtRQUMzQixJQUFJLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxXQUFXLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNoRixVQUFVLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0QscUJBQXFCO2FBQ2hCLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQzthQUNJLENBQUM7WUFDRixNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVELCtDQUErQztRQUMvQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMseURBQXlELEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0UsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sTUFBTSxHQUFpQixJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFFcEUsZUFBZSxNQUFNLENBQUMifQ==