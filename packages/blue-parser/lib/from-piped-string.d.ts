/**
 * Parses a piped list string into an object.
 * @function module:util.fromPipedString
 * @param {external:string} text The piped string
 * @returns {external:Object} The parsed piped string.
 * @example
 * fromPipedString( "abc=1,2,3,|def=456|ghi|jkl=" );
 * //=> { "abc": [ "1", "2", "3" ], "def": "456", "ghi": undefined, "jkl": "" }
 * @category String
 */
export default function fromPipedString(text: string): any;
//# sourceMappingURL=from-piped-string.d.ts.map