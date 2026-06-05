[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / parseWildcard

# Variable: parseWildcard

> `const` **parseWildcard**: [`Converter`](../type-aliases/Converter.md)\<`string`, `string`\>

Defined in: packages/blue-core/src/wildcard-expression.ts:20

Parses a wildcard pattern into a bounded regular-expression source string.

Any string is a valid wildcard pattern — `*` matches any sequence of characters.
This function always succeeds.

## Param

Wildcard pattern where `*` matches any sequence of characters.

## Returns

A regular-expression source string anchored with `^` and `$`.

## Example

```ts
parseWildcard('foo*bar') // '^foo.*?bar$'
parseWildcard('*')       // '^.*?$'
```
