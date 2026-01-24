/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#camelCase}
 */
import { pipe, replace, toLower, toUpper } from 'ramda';
import removeNonWord from './remove-non-word';
import replaceDiacritics from './replace-diacritics';
const // Underscores and hyphens
dashes = /[\-_]/g, 
// Lower case letters preceded by a space
lowerCaseLetters = /\s[a-z]/g, 
// Spaces
spaces = /\s+/g, 
// Upper case letters at the beginning of a string
upperCaseLetters = /^[A-Z]/g, 
// Remove spaces
removeSpaces = replace(spaces, ''), 
// Convert hyphens and underscores to spaces
replaceDashesWithSpaces = replace(dashes, ' '), 
/**
 * Returns the camel case version of a string.
 * @function module:util.toCamel
 * @param {external:string} value
 * @returns {external:string}
 * @category String
 * @example
 * toCamel( 'lorem-ipsum-dolor' );
 * //=> "loremIpsumDolor"
 * @see {@link http://wiki.c2.com/?CamelCase}
 */
toCamel = pipe(replaceDiacritics, removeNonWord, replaceDashesWithSpaces, 
// Convert first character of each word to uppercase
(val) => val.replace(lowerCaseLetters, toUpper), removeSpaces, 
// Convert first character to lowercase
(val) => val.replace(upperCaseLetters, toLower));
export default toCamel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tY2FtZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL3RvLWNhbWVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRXhELE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8saUJBQWlCLE1BQU0sc0JBQXNCLENBQUM7QUFFckQsTUFBTSwwQkFBMEI7QUFDNUIsTUFBTSxHQUFHLFFBQVE7QUFDakIseUNBQXlDO0FBQ3pDLGdCQUFnQixHQUFHLFVBQVU7QUFDN0IsU0FBUztBQUNULE1BQU0sR0FBRyxNQUFNO0FBQ2Ysa0RBQWtEO0FBQ2xELGdCQUFnQixHQUFHLFNBQVM7QUFDNUIsZ0JBQWdCO0FBQ2hCLFlBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztBQUNsQyw0Q0FBNEM7QUFDNUMsdUJBQXVCLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7QUFDOUM7Ozs7Ozs7Ozs7R0FVRztBQUNILE9BQU8sR0FBOEIsSUFBSSxDQUNyQyxpQkFBaUIsRUFDakIsYUFBYSxFQUNiLHVCQUF1QjtBQUN2QixvREFBb0Q7QUFDcEQsQ0FBQyxHQUFXLEVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLEVBQy9ELFlBQVk7QUFDWix1Q0FBdUM7QUFDdkMsQ0FBQyxHQUFXLEVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQ2xFLENBQUM7QUFFTixlQUFlLE9BQU8sQ0FBQyJ9