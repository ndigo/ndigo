/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { always, complement, cond, curryN, equals, filter, isEmpty, join, keys, map, pipe, T, encodeURIComponent as encodeValue, comparator, sort, } from './_util';
const isNull = equals(null), isUndefined = equals(undefined), isDefined = complement(isUndefined), isNotEmpty = complement(isEmpty), 
// ["a","b","c","#"] -> ["a","b","c","%23"]
encodeValues = map(encodeValue), 
// ["a","",{},"b",[],"c"] -> ["a","b","c"]
filterEmpty = filter(isNotEmpty), 
// ["a",undefined,"b","c",undefined] -> ["a","b","c"]
filterUndefined = filter(isDefined), 
// ["a","b","c"] -> "a,b,c"
joinOnComma = join(','), 
// ["a","b","c"] -> "a=b=c"
joinOnEqual = join('='), 
// ["a","b","c"] -> "a;b;c"
joinOnSemicolon = join(';'), 
// ["a",undefined,"b","c",undefined,"#"] -> "a,b,c,%23"
encodeList = pipe(filterUndefined, encodeValues, joinOnComma), encodeParam = curryN(2, (object, key) => cond([
    [isUndefined, () => ''],
    [isNull, always(encodeValue(key))],
    [Array.isArray, (list) => joinOnEqual([encodeValue(key), encodeList(list)])],
    [T, (value) => joinOnEqual([encodeValue(key), encodeValue(value)])],
])(object[key])), naturalComparator = comparator((a, b) => a < b), naturalSort = sort(naturalComparator), toMatrixString = (object) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tbWF0cml4LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90by1tYXRyaXgtc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILE9BQU8sRUFDSCxNQUFNLEVBQ04sVUFBVSxFQUNWLElBQUksRUFDSixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsSUFBSSxFQUNKLElBQUksRUFDSixHQUFHLEVBQ0gsSUFBSSxFQUNKLENBQUMsRUFDRCxrQkFBa0IsSUFBSSxXQUFXLEVBQ2pDLFVBQVUsRUFDVixJQUFJLEdBQ1AsTUFBTSxTQUFTLENBQUM7QUFFakIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUN2QixXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUMvQixTQUFTLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUNuQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUNoQywyQ0FBMkM7QUFDM0MsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7QUFDL0IsMENBQTBDO0FBQzFDLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ2hDLHFEQUFxRDtBQUNyRCxlQUFlLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNuQywyQkFBMkI7QUFDM0IsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDdkIsMkJBQTJCO0FBQzNCLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3ZCLDJCQUEyQjtBQUMzQixlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMzQix1REFBdUQ7QUFDdkQsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUM3RCxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFXLEVBQVUsRUFBRSxDQUNwRCxJQUFJLENBQUM7SUFDRCxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdkIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDbEIsRUFDRCxpQkFBaUIsR0FBRyxVQUFVLENBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzdELFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFDckMsY0FBYyxHQUFHLENBQUMsTUFBTSxFQUFVLEVBQUU7SUFDaEMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzlDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDckcsQ0FBQyxDQUFDO0FBRU47Ozs7Ozs7O0dBUUc7QUFDSCxlQUFlLGNBQWMsQ0FBQyJ9