[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / parseKeypath

# Variable: parseKeypath

> `const` **parseKeypath**: [`Converter`](../type-aliases/Converter.md)\<`string`, [`KeypathToken`](../type-aliases/KeypathToken.md)[] \| `null`\>

Defined in: packages/blue-core/src/keypath-expression.ts:34

Parses a dotted and bracketed property-access expression into an ordered array of path tokens.

Returns `null` for invalid input — callers treat an unparseable keypath as "no match"
rather than an error condition.

## Param

A keypath string such as `user.address.street` or `items[0].name`.

## Returns

An array of [KeypathToken](../type-aliases/KeypathToken.md) values, or `null` if the input is not a valid keypath.

## Example

```ts
parseKeypath('user.name')        // ['user', 'name']
parseKeypath('items[0].title')   // ['items', 0, 'title']
parseKeypath('a["key"]')         // ['a', 'key']
parseKeypath('')                 // null
parseKeypath('123invalid')       // null
```
