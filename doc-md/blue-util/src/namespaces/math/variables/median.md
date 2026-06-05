[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / median

# Variable: median

> `const` **median**: (`list`) => `number` = `R.median`

Defined in: packages/blue-util/src/math/index.ts:14

Returns the median of the given list of numbers.

Returns the median of the given list of numbers.

See also [mean](mean.md)

## Parameters

### list

readonly `number`[]

## Returns

`number`

## Example

```typescript
R.median([2, 9, 7]); //=> 7
R.median([7, 2, 10, 9]); //=> 8
R.median([]); //=> NaN
```

## Param

## Returns

## See

[mean](mean.md)

## Example

```ts
median( [ 2, 9, 7 ] ); //=> 7
median( [ 7, 2, 10, 9 ] ); //=> 8
median( [] ); //=> NaN
```
