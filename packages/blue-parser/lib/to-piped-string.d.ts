/**
 * Parses an object to piped list string.
 * @function module:util.toPipedString
 * @param {external:Object} object
 * @param {external:function} [validate]
 * @returns {external:string}
 * @example
 * toPipedString( { "abc": [ "1", "2", "3" ], "def": "456", "ghi": undefined, "jkl": "" } );
 * //=> "abc=1,2,3,|def=456|ghi|jkl="
 * @category Object
 */
export default function toPipedString(object: {
    [key: string]: any;
}, validate?: (key: string, value: any) => boolean): string;
//# sourceMappingURL=to-piped-string.d.ts.map