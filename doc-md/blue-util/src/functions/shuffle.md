[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / shuffle

# Function: shuffle()

> **shuffle**\<`T`\>(`list`): `T`[]

Defined in: packages/blue-util/src/list/shuffle.ts:19

## Type Parameters

### T

`T` = `any`

## Parameters

### list

`ArrayLike`\<`T`\>

The list to be shuffled.

## Returns

`T`[]

The shuffled list.

## Example

```ts
let list = [ "a", "b", "c" ];
shuffle( list );
//=> [ "c", "a", "b" ]
shuffle( list );
//=> [ "a", "c", "b" ]
```
