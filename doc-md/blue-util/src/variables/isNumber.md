[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / isNumber

# Variable: isNumber()

> `const` **isNumber**: (`value`) => `value is number`

Defined in: packages/blue-util/src/type/is-number.ts:35

Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.

## Parameters

### value

`any`

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
