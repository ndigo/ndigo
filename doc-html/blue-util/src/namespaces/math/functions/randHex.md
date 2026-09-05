[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / randHex

# Function: randHex()

> **randHex**(`size?`): `string`

Defined in: [packages/blue-util/src/math/rand-hex.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/math/rand-hex.ts#lines-24)

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
