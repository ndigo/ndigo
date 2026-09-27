[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-1.md) / modulo

# Function: modulo()

> **modulo**(`a`, `b`): `number`

Divides the first parameter by the second and returns the remainder. Note
that this function preserves the JavaScript-style behavior for modulo. For
mathematical modulo see [`mathMod`](#mathMod).

## Parameters

### a

`number`

The value to the divide.

### b

`number`

The pseudo-modulus

## Returns

`number`

The result of `b % a`.

## See

[mathMod](mathMod.md)

## Example

```ts
import { __, modulo } from '@blue/util';
modulo( 17, 3 );
//=> 2
// JS behavior:
modulo( -17, 3 );
//=> -2
modulo( 17, -3 );
//=> 2

const isOdd = modulo( __, 2 );
isOdd( 42 );
//=> 0
isOdd( 21 );
//=> 1
```
