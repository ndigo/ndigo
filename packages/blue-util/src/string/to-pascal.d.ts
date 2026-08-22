/**
 * @author Jeff Rose
 * @see {@link http://moutjs.com/docs/latest/string.html#pascalCase}
 */
declare const 
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
toPascal: (value: string) => string;
export default toPascal;
