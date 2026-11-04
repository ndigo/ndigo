[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / WildcardConverter

# Class: WildcardConverter

Parses a wildcard pattern into a bounded regular-expression source string.

Any string is a valid wildcard pattern — `*` matches any sequence of characters.
This function always succeeds.

## Param

**pattern**

Wildcard pattern where `*` matches any sequence of characters.

## Example

```ts
const wildcards = new WildcardConverter();
wildcards.convert('foo*bar') // '^foo.*?bar$'
wildcards.convert('*')       // '^.*?$'
```

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `string`\>

## Constructors

### Constructor

> **new WildcardConverter**(): `WildcardConverter`

#### Returns

`WildcardConverter`

## Methods

### convert()

> **convert**(`pattern`): `string`

Converts a value of type `S` to type `T`.

#### Parameters

##### pattern

`string`

#### Returns

`string`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
