/**
 * @author Jeff Rose
 */
/**
 * Returns a regular expression for the given `pattern`.
 * @param {string} value - The pattern string (with optional /pattern/flags format)
 * @returns {RegExp}
 * @throws {Error} If the pattern is malformed
 * @security WARNING: This function accepts arbitrary regex patterns.
 *   Do not use with untrusted user input without validation.
 *   Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.
 * @category String
 */
declare const toRegExp: (value: string) => RegExp;
export default toRegExp;
