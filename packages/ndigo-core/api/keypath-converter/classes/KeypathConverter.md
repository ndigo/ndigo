[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [keypath-converter](../README.md) / KeypathConverter

# Class: KeypathConverter

Parses a dotted and bracketed property-access expression into an ordered array of path tokens.

Returns `null` for invalid input — callers treat an unparseable keypath as "no match"
rather than an error condition.

## Param

**input**

A keypath string such as `user.address.street` or `items[0].name`.

## Example

```ts
const keypaths = new KeypathConverter();
keypaths.convert('user.name')        // ['user', 'name']
keypaths.convert('items[0].title')   // ['items', 0, 'title']
keypaths.convert('a["key"]')         // ['a', 'key']
```

## Implements

- [`Converter`](../../converter/interfaces/Converter.md)\<`string`, [`KeypathToken`](../type-aliases/KeypathToken.md)[] \| `null`\>

## Constructors

### Constructor

> **new KeypathConverter**(): `KeypathConverter`

#### Returns

`KeypathConverter`

## Methods

### convert()

> **convert**(`input`): [`KeypathToken`](../type-aliases/KeypathToken.md)[] \| `null`

Converts a value of type `S` to type `T`.

#### Parameters

##### input

`string`

#### Returns

[`KeypathToken`](../type-aliases/KeypathToken.md)[] \| `null`

The converted target value.

#### Implementation of

[`Converter`](../../converter/interfaces/Converter.md).[`convert`](../../converter/interfaces/Converter.md#convert)
