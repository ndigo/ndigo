/**
 * @author Jeff Rose
 * @see {@link https://github.com/janl/mustache.js/blob/master/mustache.js#L73}
 */
const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
}, decodedEntities = /[&<>"'`=\/]/g, encodeEntity = (entity) => entityMap[entity], encodeHTML = (value) => value.replace(decodedEntities, encodeEntity);
/**
 * @function module:util.encodeHTML
 * @param {external:string} value The decoded string
 * @returns {external:string} The encoded string
 * @example
 * encodeHTML( '<div>' );
 * //=> "&lt;div&gt;"
 * @category String
 */
export default encodeHTML;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RlLWh0bWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL2VuY29kZS1odG1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE1BQU0sU0FBUyxHQUFpQztJQUN4QyxHQUFHLEVBQUUsT0FBTztJQUNaLEdBQUcsRUFBRSxNQUFNO0lBQ1gsR0FBRyxFQUFFLE1BQU07SUFDWCxHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxPQUFPO0lBQ1osR0FBRyxFQUFFLFFBQVE7SUFDYixHQUFHLEVBQUUsUUFBUTtJQUNiLEdBQUcsRUFBRSxRQUFRO0NBQ2hCLEVBQ0QsZUFBZSxHQUFHLGNBQWMsRUFDaEMsWUFBWSxHQUFHLENBQUMsTUFBYyxFQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQzVELFVBQVUsR0FBRyxDQUFDLEtBQWEsRUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFekY7Ozs7Ozs7O0dBUUc7QUFDSCxlQUFlLFVBQVUsQ0FBQyJ9