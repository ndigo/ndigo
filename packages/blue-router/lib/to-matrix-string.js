/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { always, comparator, curryN, pipe, T } from '@blue/util/function';
import { filter, join, map, sort } from '@blue/util/list';
import { cond, complement, isEmpty } from '@blue/util/logic';
import { keys } from '@blue/util/object';
import { equals } from '@blue/util/relation';
import { encodeURIComponent as encodeValue } from '@blue/util/string';
const alwaysEmptyString = always(''), isNull = equals(null), isUndefined = equals(undefined), isDefined = complement(isUndefined), isNotEmpty = complement(isEmpty), 
// ["a","b","c","#"] -> ["a","b","c","%23"]
encodeValues = map(encodeValue), 
// ["a","",{},"b",[],"c"] -> ["a","b","c"]
filterEmpty = filter(isNotEmpty), 
// ["a",undefined,"b","c",undefined] -> ["a","b","c"]
filterUndefined = filter(isDefined), 
// ["a","b","c"] ->  "a,b,c"
joinOnComma = join(','), 
// ["a","b","c"] ->  "a=b=c"
joinOnEqual = join('='), 
// ["a","b","c"] ->  "a;b;c"
joinOnSemicolon = join(';'), 
// ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
encodeList = pipe(filterUndefined, encodeValues, joinOnComma), encodeParam = curryN(2, (object, key) => cond([
    [isUndefined, alwaysEmptyString],
    [isNull, always(encodeValue(key))],
    [Array.isArray, (list) => joinOnEqual([encodeValue(key), encodeList(list)])],
    [T, (value) => joinOnEqual([encodeValue(key), encodeValue(value)])],
])(object[key])), naturalComparator = comparator((a, b) => a < b), naturalSort = sort(naturalComparator), toMatrixString = (object) => {
    // @ts-ignore: ¯\_(ツ)_/¯
    const encodeParams = map(encodeParam(object));
    return object ? pipe(keys, naturalSort, encodeParams, filterEmpty, joinOnSemicolon)(object) : '';
};
/**
 * Parses an object to matrix string.
 * @category Object
 * @param {Object} object
 * @returns {string}
 * @example
 * toMatrixString( { e:6, a:1, b:2, c:[ 3,4 ], d:5 } );
 * //=> "a=1;b=2;c=3,4;d=5;e=6"
 */
export default toMatrixString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tbWF0cml4LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90by1tYXRyaXgtc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDMUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFELE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGtCQUFrQixJQUFJLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXRFLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUNoQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUNyQixXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUMvQixTQUFTLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUNuQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUNoQywyQ0FBMkM7QUFDM0MsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7QUFDL0IsMENBQTBDO0FBQzFDLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ2hDLHFEQUFxRDtBQUNyRCxlQUFlLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNuQyw0QkFBNEI7QUFDNUIsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDdkIsNEJBQTRCO0FBQzVCLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3ZCLDRCQUE0QjtBQUM1QixlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMzQix1REFBdUQ7QUFDdkQsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUM3RCxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQVcsRUFBRSxHQUFXLEVBQVUsRUFBRSxDQUN6RCxJQUFJLENBQUM7SUFDRCxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDOUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUNsQixFQUNELGlCQUFpQixHQUFHLFVBQVUsQ0FBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDN0QsV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUNyQyxjQUFjLEdBQUcsQ0FBQyxNQUFNLEVBQVUsRUFBRTtJQUNoQyx3QkFBd0I7SUFDeEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzlDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDckcsQ0FBQyxDQUFDO0FBRU47Ozs7Ozs7O0dBUUc7QUFDSCxlQUFlLGNBQWMsQ0FBQyJ9