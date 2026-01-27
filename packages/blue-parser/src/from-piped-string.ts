/**
 * @author Jeff Rose
 */
import { ifElse, map, split, test, when, decodeURIComponent as decode, trailingSplit } from './_util';

const ampersand = /&/,
    comma = /,/,
    createNull = Object.create.bind(Object, null),
    // "a|b|c|" -> ["a","b","c"]
    splitOnPipe = trailingSplit('|'),
    // "a=b" -> ["a","b"]
    splitOnEqual = split('='),
    // "a&b&" -> ["a","b"]
    // "ab" -> "ab"
    splitOnAmpersand: (value: string) => string | string[] = when(test(ampersand), trailingSplit('&')),
    // "a,b,c," -> ["a","b","c"]
    splitOnComma: (value: string) => string | string[] = when(test(comma), trailingSplit(',')),
    // "a,b,c," -> ["a","b","c"]
    // ["a,b,","c,d,"] -> [["a","b"],["c","d"]]
    splitAllOnComma = ifElse(
        Array.isArray,
        map(splitOnComma),
        splitOnComma
    ) as (value: string | string[]) => string[] | string[][];

/**
 * Parses a piped list string into an object.
 * @param {string} text The piped string
 * @returns {Object} The parsed piped string.
 * @example
 * fromPipedString( "abc=1,2,3,|def=456|ghi|jkl=" );
 * //=> { "abc": [ "1", "2", "3" ], "def": "456", "ghi": undefined, "jkl": "" }
 * @category String
 */
export default function fromPipedString(text: string): any {
    const params = splitOnPipe(decode(text)),
        length = params.length,
        parsed = createNull();
    let index = 0,
        param: string[],
        key: string,
        value: string | string[] | string[][];

    for (; index < length; index++) {
        param = splitOnEqual(params[index]);
        key = param[0];
        value = param[1] && splitOnAmpersand(decode(param[1]));
        parsed[key] = splitAllOnComma(value);
    }

    return parsed;
}
