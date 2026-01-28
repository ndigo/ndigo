[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / empty

# Function: empty()

> **empty**(`x`): `any`

Defined in: packages/blue-util/src/function/empty.ts:33

Returns the empty value of its argument's type. @blue/util defines the empty value of Array (`[]`), Object (`{}`), String (`''`), Map (`new Map()`), Set (`new Set()`), WeakMap (`new WeakMap()`), WeakSet (`new WeakSet()`) and Arguments. Other types are supported if they define `<Type>.empty`, `<Type>.prototype.empty` or implement the [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
Dispatches to the `empty` method of the first argument, if present.

## Parameters

### x

`any`

## Returns

`any`

## Example

```ts
empty( Just( 42 ) );               //=> Nothing()
empty( [ 1, 2, 3 ] );              //=> []
empty( 'unicorns' );               //=> ''
empty( { x: 1, y: 2 } );           //=> {}
empty( Uint8Array.from( '123' ) ); //=> Uint8Array []
```
