[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / isString

# Function: isString()

> **isString**(`value`): `value is string`

Determines whether a given object is a string.

## Parameters

### value

`unknown`

The value to be tested.

## Returns

`value is string`

Whether or not `value` is a string.

## Example

```ts
isString( new String( 'hello' ) );
//=> true
isString( 'hello' } );
//=> true
isString( {} );
//=> false
```
