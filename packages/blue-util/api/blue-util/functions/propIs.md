[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-3.md) / propIs

# Function: propIs()

> **propIs**(`ctor`, `name`, `obj`): `boolean`

Returns `true` if the specified object property is an instance of the
supplied constructor; `false` otherwise.

## Parameters

### ctor

`Function`

The constructor to check against

### name

`string`

The name of the property to check

### obj

`unknown`

The object to query

## Returns

`boolean`

## Example

```ts
propIs( Number, 'x', { x: 1, y: 2 } ); //=> true
propIs( Number, 'x', { x: 'foo' } ); //=> false
propIs( Number, 'x', {} ); //=> false
```
