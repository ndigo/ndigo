/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import {
    both,
    forEachObjIndexed,
    isString,
    join,
    lt,
    map,
    pipe,
    propSatisfies,
    T,
    encodeURIComponent as encode,
    trailingJoin,
} from './_util';

const { isArray } = Array,
    greaterThanZero = lt(0),
    lengthGreaterThanZero = propSatisfies(greaterThanZero, 'length'),
    firstValueIsArray = propSatisfies(isArray, '0'),
    isMatrix = both(lengthGreaterThanZero, firstValueIsArray) as (value) => value is any[][],
    // [1,2,3] -> "1,2,3,"
    joinOnComma = trailingJoin(',') as (value: any[]) => string,
    // [1,2,3] -> "1|2|3|"
    joinOnPipe = trailingJoin('|'),
    // [[1,2],[3,4],[5,6]] -> "1,2&3,4&5,6&"
    joinAllOnAmpersand = pipe(map(join(',')), trailingJoin('&')) as (value: any[][]) => string;

// There is some very questionable "logic" in this function. The reasons for it have
// been lost to history. I did not create the algorithm, just the latest two
// implementations of it. It is used to parse the Persona Cookie, which was part of
// the legacy platform. The strangest and probably most detrimental part is
// double-encoding of the param at the end. I'm not sure why that was deemed necessary.
// It means "," becomes "%252C" as opposed to just "%2C", which is what would happen
// with a single encoding. This makes the resulting string larger than it likely needs
// to be. While it would be easy to correct this code, it would likely lead to impacts
// elsewhere and therefore would need to be coordinated. The investment to resolve
// this problem is likely greater than the gains.
// -JBR

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
export default function toPipedString(
    object: { [key: string]: any },
    validate: (key: string, value: any) => boolean = T
): string {
    const pipedString: string[] = [];
    let isValueArray: boolean, isValueMatrix: boolean, isValueValid: boolean, param: string;

    forEachObjIndexed(function (value, key: string): void {
        isValueArray = isArray(value);
        isValueMatrix = isValueArray && isMatrix(value);
        isValueValid = validate(key, value);

        if (isValueValid) {
            // Translate 2-dimensional array
            // The internal arrays of a 2-dimensional array do not have trailing separators
            if (isValueMatrix) {
                value = joinAllOnAmpersand(value);
            }

            // Translate array
            if (isValueArray) {
                value = joinOnComma(value);
            }

            // Two-Dimensional Arrays do not get encoded values
            param = isValueMatrix ? `${encode(key)}=${value}` : encode(`${key}=${encode(value as any)}`);

            pipedString.push(isString(value) ? param : key);
        }
    }, object);

    return joinOnPipe(pipedString);
}
