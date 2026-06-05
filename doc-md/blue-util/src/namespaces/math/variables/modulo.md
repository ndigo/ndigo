[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / modulo

# Variable: modulo

> `const` **modulo**: \{(`a`): (`b`) => `number`; (`__`, `b`): (`a`) => `number`; (`a`, `b`): `number`; \} = `R.modulo`

Defined in: packages/blue-util/src/math/index.ts:15

Divides the first parameter by the second and returns the remainder. Note
that this function preserves the JavaScript-style behavior for modulo. For
mathematical modulo see [`mathMod`](#mathMod).

## Call Signature

> (`a`): (`b`) => `number`

Divides the first parameter by the second and returns the remainder. Note
that this function preserves the JavaScript-style behavior for modulo. For
mathematical modulo see [`mathMod`](#mathMod).

See also [mathMod](mathMod.md)

### Parameters

#### a

`number`

### Returns

(`b`) => `number`

### Example

```typescript
R.modulo(17, 3); //=> 2
// JS behavior:
R.modulo(-17, 3); //=> -2
R.modulo(17, -3); //=> 2

const isOdd = R.modulo(R.__, 2);
isOdd(42); //=> 0
isOdd(21); //=> 1
```

## Call Signature

> (`__`, `b`): (`a`) => `number`

Divides the first parameter by the second and returns the remainder. Note
that this function preserves the JavaScript-style behavior for modulo. For
mathematical modulo see [`mathMod`](#mathMod).

See also [mathMod](mathMod.md)

### Parameters

#### \_\_

`Placeholder`

#### b

`number`

### Returns

(`a`) => `number`

### Example

```typescript
R.modulo(17, 3); //=> 2
// JS behavior:
R.modulo(-17, 3); //=> -2
R.modulo(17, -3); //=> 2

const isOdd = R.modulo(R.__, 2);
isOdd(42); //=> 0
isOdd(21); //=> 1
```

## Call Signature

> (`a`, `b`): `number`

Divides the first parameter by the second and returns the remainder. Note
that this function preserves the JavaScript-style behavior for modulo. For
mathematical modulo see [`mathMod`](#mathMod).

See also [mathMod](mathMod.md)

### Parameters

#### a

`number`

#### b

`number`

### Returns

`number`

### Example

```typescript
R.modulo(17, 3); //=> 2
// JS behavior:
R.modulo(-17, 3); //=> -2
R.modulo(17, -3); //=> 2

const isOdd = R.modulo(R.__, 2);
isOdd(42); //=> 0
isOdd(21); //=> 1
```

## Param

The value to the divide.

## Param

The pseudo-modulus

## Returns

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
