/**
 * @author Jeff Rose
 * @see {@link https://github.com/janl/mustache.js/blob/master/mustache.js#L73}
 */
const entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
}, leadingZeroes = /&#0+/g, encodedEntities = /&#?0*(amp|lt|gt|quot|39|x2F|x60|x3D);/g, decodeEntity = (entity) => entityMap[entity], decodeHTML = (value) => value.replace(leadingZeroes, '&#').replace(encodedEntities, decodeEntity);
/**
 * @param {string} value The encoded string
 * @returns {string} The decoded string
 * @example
 * decodeHTML( '&lt;div&gt;' );
 * //=> "<div>"
 * @category String
 */
export default decodeHTML;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb2RlLWh0bWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL2RlY29kZS1odG1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE1BQU0sU0FBUyxHQUFpQztJQUN4QyxPQUFPLEVBQUUsR0FBRztJQUNaLE1BQU0sRUFBRSxHQUFHO0lBQ1gsTUFBTSxFQUFFLEdBQUc7SUFDWCxRQUFRLEVBQUUsR0FBRztJQUNiLE9BQU8sRUFBRSxHQUFHO0lBQ1osUUFBUSxFQUFFLEdBQUc7SUFDYixRQUFRLEVBQUUsR0FBRztJQUNiLFFBQVEsRUFBRSxHQUFHO0NBQ2hCLEVBQ0QsYUFBYSxHQUFHLE9BQU8sRUFDdkIsZUFBZSxHQUFHLHdDQUF3QyxFQUMxRCxZQUFZLEdBQUcsQ0FBQyxNQUFjLEVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFDNUQsVUFBVSxHQUFHLENBQUMsS0FBYSxFQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXRIOzs7Ozs7O0dBT0c7QUFDSCxlQUFlLFVBQVUsQ0FBQyJ9