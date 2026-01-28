/**
 * @author Jeff Rose
 */
import { ifElse, map, split, test, when, decodeURIComponent as decode, trailingSplit } from './_util';
const ampersand = /&/, comma = /,/, createNull = Object.create.bind(Object, null), 
// "a|b|c|" -> ["a","b","c"]
splitOnPipe = trailingSplit('|'), 
// "a=b" -> ["a","b"]
splitOnEqual = split('='), 
// "a&b&" -> ["a","b"]
// "ab" -> "ab"
splitOnAmpersand = when(test(ampersand), trailingSplit('&')), 
// "a,b,c," -> ["a","b","c"]
splitOnComma = when(test(comma), trailingSplit(',')), 
// "a,b,c," -> ["a","b","c"]
// ["a,b,","c,d,"] -> [["a","b"],["c","d"]]
splitAllOnComma = ifElse(Array.isArray, map(splitOnComma), splitOnComma);
/**
 * Parses a piped list string into an object.
 * @param {string} text The piped string
 * @returns {Object} The parsed piped string.
 * @example
 * fromPipedString( "abc=1,2,3,|def=456|ghi|jkl=" );
 * //=> { "abc": [ "1", "2", "3" ], "def": "456", "ghi": undefined, "jkl": "" }
 * @category String
 */
export default function fromPipedString(text) {
    const params = splitOnPipe(decode(text)), length = params.length, parsed = createNull();
    let index = 0, param, key, value;
    for (; index < length; index++) {
        param = splitOnEqual(params[index]);
        key = param[0];
        value = param[1] && splitOnAmpersand(decode(param[1]));
        parsed[key] = splitAllOnComma(value);
    }
    return parsed;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbS1waXBlZC1zdHJpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZnJvbS1waXBlZC1zdHJpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSCxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsYUFBYSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXRHLE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFDakIsS0FBSyxHQUFHLEdBQUcsRUFDWCxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztBQUM3Qyw0QkFBNEI7QUFDNUIsV0FBVyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUM7QUFDaEMscUJBQXFCO0FBQ3JCLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFzQjtBQUN0QixlQUFlO0FBQ2YsZ0JBQWdCLEdBQXlDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xHLDRCQUE0QjtBQUM1QixZQUFZLEdBQXlDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFGLDRCQUE0QjtBQUM1QiwyQ0FBMkM7QUFDM0MsZUFBZSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxZQUFZLENBRTdDLENBQUM7QUFFL0I7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLGVBQWUsQ0FBQyxJQUFZO0lBQ2hELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDcEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQ3RCLE1BQU0sR0FBRyxVQUFVLEVBQUUsQ0FBQztJQUMxQixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQ1QsS0FBZSxFQUNmLEdBQVcsRUFDWCxLQUFxQyxDQUFDO0lBRTFDLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQzdCLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEMsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyJ9