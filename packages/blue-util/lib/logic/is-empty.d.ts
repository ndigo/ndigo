/**
 * @author Jeff Rose
 */
/**
 * Returns `true` if the given value is its type's empty value; `false` otherwise.
 * @function module:util.isEmpty
 * @returns {external:boolean}
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
declare const isEmpty: (x: any) => boolean;
export default isEmpty;
//# sourceMappingURL=is-empty.d.ts.map