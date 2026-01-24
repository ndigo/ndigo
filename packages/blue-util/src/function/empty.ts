/**
 * @author Jeff Rose
 */

import { empty as _empty, is } from 'ramda';

const
    isArrayBuffer = is( ArrayBuffer ),
    isMap = is( Map ),
    isSet = is( Set ),
    isInt8Array = is( Int8Array ),
    isInt16Array= is( Int16Array ),
    isInt32Array = is( Int32Array ),
    isFloat32Array = is( Float32Array ),
    isFloat64Array = is( Float64Array ),
    isUint8Array = is( Uint8Array ),
    isUint16Array = is( Uint16Array ),
    isUint32Array = is( Uint32Array ),
    isWeakMap = is( WeakMap ),
    isWeakSet = is( WeakSet );

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
const empty = ( x ): typeof x | undefined => {
    let result: typeof x = _empty( x );
    if( result === void 0 ){
        result = isMap( x ) ?
            new Map() :
            isSet( x ) ?
                new Set() :
                isWeakMap( x ) ?
                    new WeakMap() :
                    isWeakSet( x ) ?
                        new WeakSet() :
                            isArrayBuffer( x ) ?
                                new ArrayBuffer( 0 ) :
                                isInt8Array( x ) ?
                                    new Int8Array( 0 ) :
                                    isInt16Array( x ) ?
                                        new Int16Array( 0 ) :
                                        isInt32Array( x ) ?
                                            new Int32Array( 0 ) :
                                            isFloat32Array( x ) ?
                                                new Float32Array( 0 ) :
                                                isFloat64Array( x ) ?
                                                    new Float64Array( 0 ) :
                                                    isUint8Array( x ) ?
                                                        new Uint8Array( 0 ) :
                                                        isUint16Array( x ) ?
                                                            new Uint16Array( 0 ) :
                                                            isUint32Array( x ) ?
                                                                new Uint32Array( 0 ) :
                                                                void 0;
    }
    return result;
};

export default empty;
