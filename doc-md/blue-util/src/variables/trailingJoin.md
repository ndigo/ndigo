[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / trailingJoin

# Variable: trailingJoin

> `const` **trailingJoin**: `TrailingJoinFunction`

Defined in: packages/blue-util/src/list/trailing-join.ts:26

Returns a string made by inserting the separator after each element and concatenating all the elements into a single string.

The string that will be placed between list items.

The list to be joined.

## Returns

The concatenated list.

## Example

```ts
const trailingJoinOnColon = trailingJoin(':');
trailingJoinOnColon(['a', 'b', 'c']);
//=> "a:b:c:"
trailingJoin(',', ['a', 'b', 'c']);
//=> "a,b,c,"
```
