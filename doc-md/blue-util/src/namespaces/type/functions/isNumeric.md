[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / isNumeric

# Function: isNumeric()

> **isNumeric**(`value`): `value is Numeric`

Defined in: packages/blue-util/src/type/is-numeric.ts:29

Determines whether a given value is numeric, i.e. a number or a string containing a number. The [isNumber](isNumber.md) method determines whether the value, parsed or not, is a number.

## Parameters

### value

`any`

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
