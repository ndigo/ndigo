[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [type](../README.md) / propIs

# Function: propIs()

> **propIs**(`ctor`, `name`, `obj`): `boolean`

Defined in: [packages/blue-util/src/type/index.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/type/index.ts#lines-31)

Returns `true` if the specified object property is an instance of the
supplied constructor; `false` otherwise.

## Parameters

### ctor

`any`

The constructor to check against

### name

`string`

The name of the property to check

### obj

`any`

The object to query

## Returns

`boolean`

## Example

```ts
propIs( Number, 'x', { x: 1, y: 2 } ); //=> true
propIs( Number, 'x', { x: 'foo' } ); //=> false
propIs( Number, 'x', {} ); //=> false
```
