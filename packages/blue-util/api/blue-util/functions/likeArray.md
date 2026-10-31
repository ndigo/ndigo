[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / likeArray

# Function: likeArray()

> **likeArray**(`value`): `value is ArrayLike<unknown>`

Determines whether a given object is an array-like.

## Parameters

### value

`unknown`

The value to be tested.

## Returns

`value is ArrayLike<unknown>`

Whether or not  is an array-like.

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
