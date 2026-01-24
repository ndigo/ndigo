/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { always, complement, cond, curryN, equals, filter, isEmpty, join, keys, map, pipe, T, encodeURIComponent as encodeValue, comparator, sort, } from '@blue/util';
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
 * @function module:router.toMatrixString
 * @category Object
 * @param {external:Object} object
 * @returns {external:string}
 * @example
 * toMatrixString( { e:6, a:1, b:2, c:[ 3,4 ], d:5 } );
 * //=> "a=1;b=2;c=3,4;d=5;e=6"
 */
export default toMatrixString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tbWF0cml4LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90by1tYXRyaXgtc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFDSCxNQUFNLEVBQ04sVUFBVSxFQUNWLElBQUksRUFDSixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsSUFBSSxFQUNKLElBQUksRUFDSixHQUFHLEVBQ0gsSUFBSSxFQUNKLENBQUMsRUFDRCxrQkFBa0IsSUFBSSxXQUFXLEVBQ2pDLFVBQVUsRUFDVixJQUFJLEdBQ1AsTUFBTSxZQUFZLENBQUM7QUFFcEIsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQ2hDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQ3JCLFdBQVcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQy9CLFNBQVMsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQ25DLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO0FBQ2hDLDJDQUEyQztBQUMzQyxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztBQUMvQiwwQ0FBMEM7QUFDMUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDaEMscURBQXFEO0FBQ3JELGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ25DLDRCQUE0QjtBQUM1QixXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN2Qiw0QkFBNEI7QUFDNUIsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDdkIsNEJBQTRCO0FBQzVCLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQzNCLHVEQUF1RDtBQUN2RCxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLEVBQzdELFdBQVcsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBVyxFQUFFLEdBQVcsRUFBVSxFQUFFLENBQ3pELElBQUksQ0FBQztJQUNELENBQUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDO0lBQ2hDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM5RSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQ2xCLEVBQ0QsaUJBQWlCLEdBQUcsVUFBVSxDQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUM3RCxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQ3JDLGNBQWMsR0FBRyxDQUFDLE1BQU0sRUFBVSxFQUFFO0lBQ2hDLHdCQUF3QjtJQUN4QixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDOUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNyRyxDQUFDLENBQUM7QUFFTjs7Ozs7Ozs7O0dBU0c7QUFDSCxlQUFlLGNBQWMsQ0FBQyJ9