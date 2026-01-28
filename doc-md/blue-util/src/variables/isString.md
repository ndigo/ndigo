[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / isString

# Variable: isString()

> `const` **isString**: (`value`) => `value is string`

Defined in: packages/blue-util/src/type/is-string.ts:21

Determines whether a given object is a string.

## Parameters

### value

`any`

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
