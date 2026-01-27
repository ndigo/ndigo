/**
 * @author Jeff Rose
 */
import { empty as _empty, is } from 'ramda';
const isArrayBuffer = is(ArrayBuffer), isMap = is(Map), isSet = is(Set), isInt8Array = is(Int8Array), isInt16Array = is(Int16Array), isInt32Array = is(Int32Array), isFloat32Array = is(Float32Array), isFloat64Array = is(Float64Array), isUint8Array = is(Uint8Array), isUint16Array = is(Uint16Array), isUint32Array = is(Uint32Array), isWeakMap = is(WeakMap), isWeakSet = is(WeakSet);
/**
 * Returns the empty value of its argument's type. @blue/util defines the empty value of Array (`[]`), Object (`{}`), String (`''`), Map (`new Map()`), Set (`new Set()`), WeakMap (`new WeakMap()`), WeakSet (`new WeakSet()`) and Arguments. Other types are supported if they define `<Type>.empty`, `<Type>.prototype.empty` or implement the [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 * Dispatches to the `empty` method of the first argument, if present.
 * @returns {boolean}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb24vZW1wdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsS0FBSyxJQUFJLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFNUMsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUNqQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUNmLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQ2YsV0FBVyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFDM0IsWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDN0IsWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDN0IsY0FBYyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDakMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDakMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDN0IsYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDL0IsYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDL0IsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFDdkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUU1Qjs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUF3QixFQUFFO0lBQ3RDLElBQUksTUFBTSxHQUFhLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQyxJQUFJLE1BQU0sS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFO1lBQ1gsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFO2dCQUNYLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNaLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRTtvQkFDZixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDWixDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUU7d0JBQ2YsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7NEJBQ2hCLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ3BCLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dDQUNkLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xCLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29DQUNmLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0NBQ25CLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO3dDQUNmLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0NBQ25CLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDOzRDQUNqQixDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDOzRDQUNyQixDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnREFDakIsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQztnREFDckIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7b0RBQ2YsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQztvREFDbkIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7d0RBQ2hCLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7d0RBQ3BCLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOzREQUNoQixDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDOzREQUNwQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLGVBQWUsS0FBSyxDQUFDIn0=