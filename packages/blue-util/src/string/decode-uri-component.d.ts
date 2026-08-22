/**
 * @author Jeff Rose
 * @see {@link https://github.com/samverschueren/decode-uri-component}
 */
/**
 * Enhanced decodeURIComponent
 * - Decodes + to a space.
 * - Converts the BOM to a replacement character �.
 * - Does not throw with invalid encoded input.
 * - Decodes as much of the string as possible.
 * @param {string} value The encoded string
 * @returns {string} The decoded string
 * @category String
 */
export default function (value: string): string;
