/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#removeNonWord}
 */
import { replace } from 'ramda';
const nonWord = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;
/**
 * Parses a piped list string into an object.
 * @param {string} value The string to be transformed.
 * @returns {string} The `value` with the non-word characters removed.
 * @category String
 * @example
 * removeNonWord( "lorem ~!@#$%^&*()_+`-={}[]|\\:\";'/?><., ipsum" );
 * //=> "lorem - ipsum"
 */
const removeNonWord = replace(nonWord, '');
export default removeNonWord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLW5vbi13b3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmluZy9yZW1vdmUtbm9uLXdvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFaEMsTUFBTSxPQUFPLEdBQUcsc0RBQXNELENBQUM7QUFFdkU7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLGFBQWEsR0FBOEIsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUV0RSxlQUFlLGFBQWEsQ0FBQyJ9