[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / trailingSplit

# Variable: trailingSplit

> `const` **trailingSplit**: `TrailingSplitFunction`

Defined in: packages/blue-util/src/string/trailing-split.ts:26

Splits a string into an array of strings based on the given separator.

## Returns

## Example

```ts
const trailingSplitOnPipe = trailingSplit('|');
trailingSplitOnPipe('a|b|c|');
//=> [ "a", "b", "c" ]
trailingSplit(',', 'a,b,c,');
//=> [ "a", "b", "c" ]
```
