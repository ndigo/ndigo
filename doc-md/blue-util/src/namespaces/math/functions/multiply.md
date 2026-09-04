[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / multiply

# Function: multiply()

> **multiply**(`a`, `b`): `number`

Defined in: packages/blue-util/src/math/index.ts:185

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
