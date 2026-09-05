/**
 * @see {@link https://github.com/janl/mustache.js/blob/master/mustache.js#L73}
 */

const entityMap: { [entity: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '=',
    },
    leadingZeroes = /&#0+/g,
    encodedEntities = /&#?0*(amp|lt|gt|quot|39|x2F|x60|x3D);/g,
    decodeEntity = (entity: string): string => entityMap[entity],
    decodeHTML = (value: string): string => value.replace(leadingZeroes, '&#').replace(encodedEntities, decodeEntity);

/**
 * @param {string} value The encoded string
 * @returns {string} The decoded string
 * @example
 * decodeHTML( '&lt;div&gt;' );
 * //=> "<div>"
 * @category String
 */
export default decodeHTML;
