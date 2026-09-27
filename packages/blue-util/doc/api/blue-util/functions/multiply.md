[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-1.md) / multiply

# Function: multiply()

> **multiply**(`a`, `b`): `number`

Multiplies two numbers. Equivalent to `a * b` but curried.

## Parameters

### a

`number`

The first value.

### b

`number`

The second value.

## Returns

`number`

The result of `a * b`.

## See

[divide](divide.md)

## Example

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
