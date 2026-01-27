/**
 * @author Jeff Rose
 */
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
declare const empty: (x: any) => typeof x | undefined;
export default empty;
//# sourceMappingURL=empty.d.ts.map