[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / type

# Function: type()

> **type**(`val`): `string`

Gives a single-word string description of the (native) type of a value,
returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
attempt to distinguish user Object types any further, reporting them all as
'Object'.

## Parameters

### val

`unknown`

The value to test

## Returns

`string`

## Example

```ts
type( {} ); //=> "Object"
type( 1 ); //=> "Number"
type( false ); //=> "Boolean"
type( 's' ); //=> "String"
type( null ); //=> "Null"
type( [] ); //=> "Array"
type( /[A-z]/ ); //=> "RegExp"
type( () => {} ); //=> "Function"
type( undefined ); //=> "Undefined"
```
