[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / modulo

# Function: modulo()

> **modulo**(`a`, `b`): `number`

Defined in: packages/blue-util/src/math/index.ts:165

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
