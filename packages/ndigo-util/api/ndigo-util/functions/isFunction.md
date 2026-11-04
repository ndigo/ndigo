[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [ndigo-util](../README-2.md) / isFunction

# Function: isFunction()

> **isFunction**(`value`): `value is Function`

Determines whether a given object is a function.

## Parameters

### value

`unknown`

The value to be tested.

## Returns

`value is Function`

Whether or not `value` is a function.

## Example

```ts
isFunction( new Function() );
//=> true
isFunction( () => void 0 );
//=> true
isFunction( function(){} );
//=> true
isFunction( {} );
//=> false
```
