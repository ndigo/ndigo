[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-1.md) / subtract

# Function: subtract()

> **subtract**(`a`, `b`): `number`

Subtracts its second argument from its first argument.

## Parameters

### a

`number`

The first value.

### b

`number`

The second value.

## Returns

`number`

The result of `a - b`.

## See

[add](add.md)

## Example

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
