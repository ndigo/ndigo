/**
 * @author Jeff Rose
 */
import { empty as _empty, is } from 'ramda';
const isArrayBuffer = is(ArrayBuffer), isMap = is(Map), isSet = is(Set), isInt8Array = is(Int8Array), isInt16Array = is(Int16Array), isInt32Array = is(Int32Array), isFloat32Array = is(Float32Array), isFloat64Array = is(Float64Array), isUint8Array = is(Uint8Array), isUint16Array = is(Uint16Array), isUint32Array = is(Uint32Array), isWeakMap = is(WeakMap), isWeakSet = is(WeakSet);
/**
 * Returns the empty value of its argument's type. @blue/util defines the empty value of Array (`[]`), Object (`{}`), String (`''`), Map (`new Map()`), Set (`new Set()`), WeakMap (`new WeakMap()`), WeakSet (`new WeakSet()`) and Arguments. Other types are supported if they define `<Type>.empty`, `<Type>.prototype.empty` or implement the [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 * Dispatches to the `empty` method of the first argument, if present.
 * @function module:util.empty
 * @returns {external:boolean}
 * @category Function
 * @example
 * empty( Just( 42 ) );               //=> Nothing()
 * empty( [ 1, 2, 3 ] );              //=> []
 * empty( 'unicorns' );               //=> ''
 * empty( { x: 1, y: 2 } );           //=> {}
 * empty( Uint8Array.from( '123' ) ); //=> Uint8Array []
 */
const empty = (x) => {
    let result = _empty(x);
    if (result === void 0) {
        result = isMap(x)
            ? new Map()
            : isSet(x)
                ? new Set()
                : isWeakMap(x)
                    ? new WeakMap()
                    : isWeakSet(x)
                        ? new WeakSet()
                        : isArrayBuffer(x)
                            ? new ArrayBuffer(0)
                            : isInt8Array(x)
                                ? new Int8Array(0)
                                : isInt16Array(x)
                                    ? new Int16Array(0)
                                    : isInt32Array(x)
                                        ? new Int32Array(0)
                                        : isFloat32Array(x)
                                            ? new Float32Array(0)
                                            : isFloat64Array(x)
                                                ? new Float64Array(0)
                                                : isUint8Array(x)
                                                    ? new Uint8Array(0)
                                                    : isUint16Array(x)
                                                        ? new Uint16Array(0)
                                                        : isUint32Array(x)
                                                            ? new Uint32Array(0)
                                                            : void 0;
    }
    return result;
};
export default empty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb24vZW1wdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsS0FBSyxJQUFJLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUMsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUNqQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUNmLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQ2YsV0FBVyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDM0IsWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDN0IsWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDN0IsY0FBYyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDakMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDakMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDN0IsYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDL0IsYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDL0IsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFDdkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUU1Qjs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBd0IsRUFBRTtJQUN0QyxJQUFJLE1BQU0sR0FBYSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRTtZQUNYLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNSLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRTtnQkFDWCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDWixDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUU7b0JBQ2YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ1osQ0FBQyxDQUFDLElBQUksT0FBTyxFQUFFO3dCQUNmLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUNoQixDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUNwQixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQ0FDZCxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dDQUNsQixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQ0FDZixDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO29DQUNuQixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzt3Q0FDZixDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO3dDQUNuQixDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzs0Q0FDakIsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQzs0Q0FDckIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0RBQ2pCLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0RBQ3JCLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29EQUNmLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0RBQ25CLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO3dEQUNoQixDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO3dEQUNwQixDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzs0REFDaEIsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQzs0REFDcEIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFRixlQUFlLEtBQUssQ0FBQyJ9