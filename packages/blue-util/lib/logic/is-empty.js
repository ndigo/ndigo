/**
 * @author Jeff Rose
 */
import { isEmpty as _isEmpty, equals, pipe } from 'ramda';
import empty from '../function/empty';
/**
 * Returns `true` if the given value is its type's empty value; `false` otherwise.
 * @returns {boolean}
 * @category Logic
 * @example
 * isEmpty( [ 1, 2, 3 ] );           //=> false
 * isEmpty( [] );                    //=> true
 * isEmpty( '' );                    //=> true
 * isEmpty( null );                  //=> false
 * isEmpty( {} );                    //=> true
 * isEmpty( { length: 0 } );         //=> false
 * isEmpty( Uint8Array.from( '' ) ); //=> true
 */
const isEmpty = (x) => {
    let result = _isEmpty(x);
    if (x != null && result === false) {
        result = pipe(empty, equals(x))(x);
    }
    return result;
};
export default isEmpty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtZW1wdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbG9naWMvaXMtZW1wdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsT0FBTyxJQUFJLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQzFELE9BQU8sS0FBSyxNQUFNLG1CQUFtQixDQUFDO0FBRXRDOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFXLEVBQUU7SUFDM0IsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxNQUFNLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDaEMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLGVBQWUsT0FBTyxDQUFDIn0=