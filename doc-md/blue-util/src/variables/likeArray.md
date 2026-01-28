[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / likeArray

# Variable: likeArray()

> `const` **likeArray**: (`value`) => `value is ArrayLike<any>`

Defined in: packages/blue-util/src/type/like-array.ts:51

Determines whether a given object is an array-like.

## Parameters

### value

`any`

The value to be tested.

## Returns

`value is ArrayLike<any>`

Whether or not `value` is an array-like.

## Example

```ts
likeArray( [] );
//=> true
likeArray( '' );
//=> true
likeArray( { 0: 'zero', 9: 'nine', length: 10 } );
//=> true
likeArray( { length: 0 } );
//=> true
likeArray( { length: 10 } );
//=> false
likeArray( {} );
//=> false
```
