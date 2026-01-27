/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link http://moutjs.com/docs/latest/string.html#slugify}
 * @see {@link https://github.com/dodo/node-slug}
 */
import { curry, pipe, toLower } from 'ramda';
import removeNonWord from './remove-non-word';
import slug from 'slug';
/**
 * Converts a string into a slug.
 * @category String
 * @param {string} delimiter The character with which spaces will be replaced.
 * @param {string} value The value to be slugified.
 * @returns {string} The slugified string.
 * @example
 * const hyphenate = slugify( '-' );
 * hyphenate( 'Lorem Ipsum Dolor' );
 * //=> "lorem-ipsum-dolor"
 * slugify( '~', 'Lorem Ipsum Dolor' );
 * //=> "lorem~ipsum~dolor"
 */
const slugify = curry((delimiter, value) => pipe(removeNonWord, (val) => slug(val, { remove: null, replacement: delimiter, lower: false }), toLower)(value));
export default slugify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2x1Z2lmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJpbmcvc2x1Z2lmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUVILE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUU3QyxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFPeEI7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxPQUFPLEdBQW9CLEtBQUssQ0FBQyxDQUFDLFNBQWlCLEVBQUUsS0FBYSxFQUFVLEVBQUUsQ0FDaEYsSUFBSSxDQUNBLGFBQWEsRUFDYixDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFDbEYsT0FBTyxDQUNWLENBQUMsS0FBSyxDQUFDLENBQ1gsQ0FBQztBQUVGLGVBQWUsT0FBTyxDQUFDIn0=