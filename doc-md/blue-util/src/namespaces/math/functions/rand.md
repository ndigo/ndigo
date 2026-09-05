[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / rand

# Function: rand()

> **rand**(`min?`, `max?`): `number`

Defined in: [packages/blue-util/src/math/rand.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/math/rand.ts#lines-19)

Generates a pseudo-random number between `min` and `max`.

## Parameters

### min?

`number` = `Number.MIN_SAFE_INTEGER`

### max?

`number` = `Number.MAX_SAFE_INTEGER`

## Returns

`number`

A pseudo-random number between `min` and `max`.

## Example

```ts
rand( 0, 10 );
//=> 7.369723
rand( 0, 10 );
//=> 5.987042
```
