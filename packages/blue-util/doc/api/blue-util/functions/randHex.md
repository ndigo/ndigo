[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-1.md) / randHex

# Function: randHex()

> **randHex**(`size?`): `string`

Generates a pseudo-random hexidecimal of the provided `size`.

## Parameters

### size?

`number` = `6`

The size of the hexidecimal.

## Returns

`string`

A pseudo-random hexidecimal of the provided `size`.

## Example

```ts
randHex();
// "dd8575"
randHex();
// "e6baeb"
randHex( 2 );
// "a2"
randHex( 30 );
// "effd7e2ad9a4a3067e30525fab983a"
```
