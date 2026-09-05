[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / median

# Function: median()

> **median**(`list`): `number`

Defined in: [packages/blue-util/src/math/index.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/math/index.ts#lines-132)

Returns the median of the given list of numbers.

## Parameters

### list

`number`[]

## Returns

`number`

## See

[mean](mean.md)

## Example

```ts
median( [ 2, 9, 7 ] ); //=> 7
median( [ 7, 2, 10, 9 ] ); //=> 8
median( [] ); //=> NaN
```
