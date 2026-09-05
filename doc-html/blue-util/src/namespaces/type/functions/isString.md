[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / isString

# Function: isString()

> **isString**(`value`): `value is string`

Defined in: [packages/blue-util/src/type/is-string.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/type/is-string.ts#lines-19)

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
