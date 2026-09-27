[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / isNumber

# Function: isNumber()

> **isNumber**(`value`): `value is number`

Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.

## Parameters

### value

`unknown`

The value to be tested.

## Returns

`value is number`

Whether or not `value` is a number.

## Example

```ts
typeof new Number( 1 ) === 'number';
//=> false
isNumber( new Number( 1 ) );
//=> true
typeof 2 === 'number';
//=> true
isNumber( 2 );
//=> true
typeof NaN === 'number';
//=> true
isNumber( NaN );
//=> false
typeof Infinity === 'number';
//=> true
isNumber( Infinity );
//=> false
```
