[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / range

# Variable: range()

> **range**: (`from`, `to?`) => `number`[]

Defined in: packages/blue-util/src/list/range.ts:28

Returns a list of numbers from `from` (inclusive) to `to` (exclusive).

## Parameters

### from

`number`

The first number in the list.

### to?

`number`

One more or less than the last number in the list. If it is not provided, `to` will be set to `from` and an empty array will be returned.

## Returns

`number`[]

The list of numbers in the set `[a, b)`.

## Example

```ts
range( 1 );
//=> []
range( 1, 1 );
//=> []
range( 1, 1.1 );
//=> [ 1 ]
range( 1, 5 );
//=> [ 1, 2, 3, 4 ]
range( 50, 53 );
//=> [ 50, 51, 52 ]
```

## See

rangeBy
