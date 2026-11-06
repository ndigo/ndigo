/**
 * Removes non-word characters from a string.
 */

/**
 * Remove non-word characters.
 *
 * @param value - The string to be transformed.
 * @returns The `value` with the non-word characters removed.
 *
 * @example
 * ```ts
 * removeNonWord('lorem ipsum'); //=> 'lorem ipsum'
 * ```
 */
const removeNonWord: (value: string) => string = (val: string) =>
    val.replace(/[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g, '');

export default removeNonWord;
