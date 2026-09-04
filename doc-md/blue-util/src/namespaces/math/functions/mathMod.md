[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / mathMod

# Function: mathMod()

> **mathMod**(`m`, `p`): `number`

Defined in: packages/blue-util/src/math/index.ts:102

`mathMod` behaves like the modulo operator should mathematically, unlike the
`%` operator (and by extension, [`R.modulo`](#modulo)). So while
`-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
arguments, and returns NaN when the modulus is zero or negative.

## Parameters

### m

`number`

The dividend.

### p

`number`

the modulus.

## Returns

`number`

The result of `b mod a`.

## See

[modulo](modulo.md)

## Example

```ts
import { __, mathMod } from '@blue/util';
mathMod( -17, 5 );  //=> 3
mathMod( 17, 5 );   //=> 2
mathMod( 17, -5 );  //=> NaN
mathMod( 17, 0 );   //=> NaN
mathMod( 17.2, 5 ); //=> NaN
mathMod( 17, 5.3 ); //=> NaN

const clock = mathMod( __, 12 );
clock( 15 ); //=> 3
clock( 24 ); //=> 0

const seventeenMod = mathMod( 17 );
seventeenMod( 3 );  //=> 2
seventeenMod( 4 );  //=> 1
seventeenMod( 10 ); //=> 7
```
