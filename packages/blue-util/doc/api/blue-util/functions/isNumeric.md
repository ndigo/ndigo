[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / isNumeric

# Function: isNumeric()

> **isNumeric**(`value`): `value is Numeric`

Determines whether a given value is numeric, i.e. a number or a string containing a number. The [isNumber](isNumber.md) method determines whether the value, parsed or not, is a number.

## Parameters

### value

`unknown`

The value to be tested.

## Returns

`value is Numeric`

Whether or not `value` is numeric.

## Example

```ts
isNumeric( new Number( 1 ) );
//=> true
isNumeric( 2 );
//=> true
isNumeric( '2' );
//=> true
isNumeric( NaN );
//=> false
isNumeric( Infinity );
//=> false
```

## See

[isNumber](isNumber.md)
