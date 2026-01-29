/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import like from './like.js';
const /**
     * Determines whether a given object is thenable, i.e. has a `then` method.
     * @category Type
     * @param {*} value The value to be tested.
     * @returns {boolean} Whether or not `value` is thenable.
     * @example
     * const promise = new Promise( ... );
     * likePromise( promise );
     * //=> true
     * likePromise( { then: function(){} } );
     * //=> true
     * likePromise( {} );
     * //=> false
     */ likePromise = like({ then: Function });
export default likePromise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1wcm9taXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGUvbGlrZS1wcm9taXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUU3QixNQUFNOzs7Ozs7Ozs7Ozs7O09BYUMsQ0FDSCxXQUFXLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUF5QyxDQUFDO0FBRW5GLGVBQWUsV0FBVyxDQUFDIn0=