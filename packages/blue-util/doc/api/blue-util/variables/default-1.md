[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-1.md) / default

# Variable: default

> **default**: `object`

## Type Declaration

## Math

#### add

> **add**: (`a`, `b`) => `number`

Adds two values.

##### Parameters

###### a

`number`

###### b

`number`

##### Returns

`number`

##### See

[subtract](../functions/subtract.md)

##### Example

```ts
add( 2, 3 );
//=>  5
add( 7 )( 10 );
//=> 17
```

#### dec

> **dec**: (`n`) => `number`

Decrements its argument.

##### Parameters

###### n

`number`

##### Returns

`number`

n - 1

##### See

[inc](../functions/inc.md)

##### Example

```ts
dec( 42 ); //=> 41
```

#### divide

> **divide**: (`a`, `b`) => `number`

Divides two numbers. Equivalent to `a / b`.

##### Parameters

###### a

`number`

The first value.

###### b

`number`

The second value.

##### Returns

`number`

The result of `a / b`.

##### See

[multiply](../functions/multiply.md)

##### Example

```ts
import { __, divide } from '@blue/util';
divide( 71, 100 ); //=> 0.71

const half = divide( __, 2 );
half( 42 ); //=> 21

const reciprocal = divide( 1 );
reciprocal( 4 );   //=> 0.25
```

#### guid

> **guid**: () => `string`

Generates a pseudo-random Globally Unique Identifier (v4).
Since the total number of GUIDs is 2^122 the chance of generating the same value twice is negligible.

##### Returns

`string`

##### Example

```ts
guid();
//=> "830e9f50-ac7f-4369-a14f-ed0e62b2fa0b"
guid();
//=> "5de3d09b-e79c-4727-932b-48c49228d508"
```

#### inc

> **inc**: (`n`) => `number`

Increments its argument.

##### Parameters

###### n

`number`

##### Returns

`number`

n + 1

##### See

[dec](../functions/dec.md)

##### Example

```ts
inc( 42 ); //=> 43
```

#### mathMod

> **mathMod**: (`m`, `p`) => `number`

`mathMod` behaves like the modulo operator should mathematically, unlike the
`%` operator (and by extension, [`R.modulo`](#modulo)). So while
`-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
arguments, and returns NaN when the modulus is zero or negative.

##### Parameters

###### m

`number`

The dividend.

###### p

`number`

the modulus.

##### Returns

`number`

The result of `b mod a`.

##### See

[modulo](../functions/modulo.md)

##### Example

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

#### mean

> **mean**: (`list`) => `number`

Returns the mean of the given list of numbers.

##### Parameters

###### list

`number`[]

##### Returns

`number`

##### See

[median](../functions/median.md)

##### Example

```ts
mean( [ 2, 7, 9 ] ); //=> 6
mean( [] ); //=> NaN
```

#### median

> **median**: (`list`) => `number`

Returns the median of the given list of numbers.

##### Parameters

###### list

`number`[]

##### Returns

`number`

##### See

[mean](../functions/mean.md)

##### Example

```ts
median( [ 2, 9, 7 ] ); //=> 7
median( [ 7, 2, 10, 9 ] ); //=> 8
median( [] ); //=> NaN
```

#### modulo

> **modulo**: (`a`, `b`) => `number`

Divides the first parameter by the second and returns the remainder. Note
that this function preserves the JavaScript-style behavior for modulo. For
mathematical modulo see [`mathMod`](#mathMod).

##### Parameters

###### a

`number`

The value to the divide.

###### b

`number`

The pseudo-modulus

##### Returns

`number`

The result of `b % a`.

##### See

[mathMod](../functions/mathMod.md)

##### Example

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

#### multiply

> **multiply**: (`a`, `b`) => `number`

Multiplies two numbers. Equivalent to `a * b` but curried.

##### Parameters

###### a

`number`

The first value.

###### b

`number`

The second value.

##### Returns

`number`

The result of `a * b`.

##### See

[divide](../functions/divide.md)

##### Example

```ts
const double = multiply( 2 );
const triple = multiply( 3 );
double( 3 );
//=>  6
triple( 4 );
//=> 12
multiply( 2, 5 );
//=> 10
```

#### negate

> **negate**: (`n`) => `number`

Negates its argument.

##### Parameters

###### n

`number`

##### Returns

`number`

##### Example

```ts
negate( 42 );
//=> -42
```

#### product

> **product**: (`list`) => `number`

Multiplies together all the elements of a list.

##### Parameters

###### list

`number`[]

An array of numbers

##### Returns

`number`

The product of all the numbers in the list.

##### See

`reduce`

##### Example

```ts
product( [ 2, 4, 6, 8, 100, 1 ] );
//=> 38400
```

#### rand

> **rand**: (`min?`, `max?`) => `number`

Generates a pseudo-random number between `min` and `max`.

##### Parameters

###### min?

`number` = `Number.MIN_SAFE_INTEGER`

###### max?

`number` = `Number.MAX_SAFE_INTEGER`

##### Returns

`number`

A pseudo-random number between `min` and `max`.

##### Example

```ts
rand( 0, 10 );
//=> 7.369723
rand( 0, 10 );
//=> 5.987042
```

#### randHex

> **randHex**: (`size?`) => `string`

Generates a pseudo-random hexidecimal of the provided `size`.

##### Parameters

###### size?

`number` = `6`

The size of the hexidecimal.

##### Returns

`string`

A pseudo-random hexidecimal of the provided `size`.

##### Example

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

#### randInt

> **randInt**: (`min?`, `max?`) => `number`

Generates a pseudo-random integer between `min` and `max`.

##### Parameters

###### min?

`number`

###### max?

`number`

##### Returns

`number`

A pseudo-random integer between `min` and `max`.

##### Example

```ts
randInt( 0, 10 );
//=> 7
randInt( 0, 10 );
//=> 6
```

#### random

> **random**: () => `number`

Generates a pseudo-random number.

##### Returns

`number`

A pseudo-random number between `0` and `1`.

##### Example

```ts
random();
//=> 0.9282578795792454
random();
//=> 0.3752569768646784
```

#### subtract

> **subtract**: (`a`, `b`) => `number`

Subtracts its second argument from its first argument.

##### Parameters

###### a

`number`

The first value.

###### b

`number`

The second value.

##### Returns

`number`

The result of `a - b`.

##### See

[add](../functions/add.md)

##### Example

```ts
import { __, subtract } from '@blue/util';
subtract( 10, 8 );
//=> 2

const minus5 = subtract( __, 5 );
minus5( 17 );
//=> 12

const complementaryAngle = subtract( 90 );
complementaryAngle( 30 );
//=> 60
complementaryAngle( 72 );
//=> 18
```

#### sum

> **sum**: (`list`) => `number`

Adds together all the elements of a list.

##### Parameters

###### list

`number`[]

An array of numbers

##### Returns

`number`

The sum of all the numbers in the list.

##### See

`reduce`

##### Example

```ts
sum( [ 2, 4, 6, 8, 100, 1 ] );
//=> 121
```
