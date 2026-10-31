[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-1.md) / rand

# Function: rand()

> **rand**(`min?`, `max?`): `number`

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
