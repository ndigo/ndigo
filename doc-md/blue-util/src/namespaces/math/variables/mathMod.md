[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / mathMod

# Variable: mathMod

> `const` **mathMod**: \{(`a`): (`b`) => `number`; (`__`, `b`): (`a`) => `number`; (`a`, `b`): `number`; \} = `R.mathMod`

Defined in: packages/blue-util/src/math/index.ts:12

`mathMod` behaves like the modulo operator should mathematically, unlike the
`%` operator (and by extension, [`R.modulo`](#modulo)). So while
`-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
arguments, and returns NaN when the modulus is zero or negative.

## Call Signature

> (`a`): (`b`) => `number`

`mathMod` behaves like the modulo operator should mathematically, unlike the
`%` operator (and by extension, [`R.modulo`](#modulo)). So while
`-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
arguments, and returns NaN when the modulus is zero or negative.

See also [modulo](modulo.md)

### Parameters

#### a

`number`

### Returns

(`b`) => `number`

### Example

```typescript
R.mathMod(-17, 5);  //=> 3
R.mathMod(17, 5);   //=> 2
R.mathMod(17, -5);  //=> NaN
R.mathMod(17, 0);   //=> NaN
R.mathMod(17.2, 5); //=> NaN
R.mathMod(17, 5.3); //=> NaN

const clock = R.mathMod(R.__, 12);
clock(15); //=> 3
clock(24); //=> 0

const seventeenMod = R.mathMod(17);
seventeenMod(3);  //=> 2
seventeenMod(4);  //=> 1
seventeenMod(10); //=> 7
```

## Call Signature

> (`__`, `b`): (`a`) => `number`

`mathMod` behaves like the modulo operator should mathematically, unlike the
`%` operator (and by extension, [`R.modulo`](#modulo)). So while
`-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
arguments, and returns NaN when the modulus is zero or negative.

See also [modulo](modulo.md)

### Parameters

#### \_\_

`Placeholder`

#### b

`number`

### Returns

(`a`) => `number`

### Example

```typescript
R.mathMod(-17, 5);  //=> 3
R.mathMod(17, 5);   //=> 2
R.mathMod(17, -5);  //=> NaN
R.mathMod(17, 0);   //=> NaN
R.mathMod(17.2, 5); //=> NaN
R.mathMod(17, 5.3); //=> NaN

const clock = R.mathMod(R.__, 12);
clock(15); //=> 3
clock(24); //=> 0

const seventeenMod = R.mathMod(17);
seventeenMod(3);  //=> 2
seventeenMod(4);  //=> 1
seventeenMod(10); //=> 7
```

## Call Signature

> (`a`, `b`): `number`

`mathMod` behaves like the modulo operator should mathematically, unlike the
`%` operator (and by extension, [`R.modulo`](#modulo)). So while
`-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
arguments, and returns NaN when the modulus is zero or negative.

See also [modulo](modulo.md)

### Parameters

#### a

`number`

#### b

`number`

### Returns

`number`

### Example

```typescript
R.mathMod(-17, 5);  //=> 3
R.mathMod(17, 5);   //=> 2
R.mathMod(17, -5);  //=> NaN
R.mathMod(17, 0);   //=> NaN
R.mathMod(17.2, 5); //=> NaN
R.mathMod(17, 5.3); //=> NaN

const clock = R.mathMod(R.__, 12);
clock(15); //=> 3
clock(24); //=> 0

const seventeenMod = R.mathMod(17);
seventeenMod(3);  //=> 2
seventeenMod(4);  //=> 1
seventeenMod(10); //=> 7
```

## Param

The dividend.

## Param

the modulus.

## Returns

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
