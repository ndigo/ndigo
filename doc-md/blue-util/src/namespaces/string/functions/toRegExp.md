[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / toRegExp

# Function: toRegExp()

> **toRegExp**(`value`): `RegExp`

Defined in: packages/blue-util/src/string/to-reg-exp.ts:32

Returns a regular expression for the given `pattern`.

## Parameters

### value

`string`

## Returns

`RegExp`

## Example

```ts
toRegExp( 'foo' );
//=> /foo/
toRegExp( '/foo/' );
//=> /foo/
toRegExp( '/foo/i' );
//=> /foo/i
```
