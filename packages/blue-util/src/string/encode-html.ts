/**
 * @see {@link https://github.com/janl/mustache.js/blob/master/mustache.js#L73}
 */

const entityMap: { [entity: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    },
    decodedEntities = /[&<>"'`=/]/g,
    encodeEntity = (entity: string): string => entityMap[entity],
    encodeHTML = (value: string): string => value.replace(decodedEntities, encodeEntity);

/**
 * @param {string} value The decoded string
 * @returns {string} The encoded string
 * @example
 * encodeHTML( '<div>' );
 * //=> "&lt;div&gt;"
 * @category String
 */
export default encodeHTML;
