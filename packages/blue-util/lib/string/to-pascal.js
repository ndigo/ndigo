/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#pascalCase}
 */
import { pipe, toUpper } from 'ramda';
import toCamel from './to-camel';
const // Lower case letters at the beginning of a string
lowerCaseLetters = /^[a-z]/, 
/**
 * Returns the pascal case version of a string.
     * @param {string} value
 * @returns {string}
 * @category String
 * @example
 * toPascal( 'lorem-ipsum-dolor' );
 * //=> "LoremIpsumDolor"
 * @see {@link http://wiki.c2.com/?PascalCase}
 */
toPascal = pipe(toCamel, (value) => value.replace(lowerCaseLetters, toUpper));
export default toPascal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tcGFzY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmluZy90by1wYXNjYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRXRDLE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQztBQUVqQyxNQUFNLGtEQUFrRDtBQUNwRCxnQkFBZ0IsR0FBRyxRQUFRO0FBQzNCOzs7Ozs7Ozs7R0FTRztBQUNILFFBQVEsR0FBOEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQWEsRUFBVSxFQUFFLENBQzFFLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQzNDLENBQUM7QUFFTixlQUFlLFFBQVEsQ0FBQyJ9