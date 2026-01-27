/**
 * Parses a piped list string into an object.
 * @param {string} text The piped string
 * @returns {Object} The parsed piped string.
 * @example
 * fromPipedString( "abc=1,2,3,|def=456|ghi|jkl=" );
 * //=> { "abc": [ "1", "2", "3" ], "def": "456", "ghi": undefined, "jkl": "" }
 * @category String
 */
export default function fromPipedString(text: string): any;
//# sourceMappingURL=from-piped-string.d.ts.map