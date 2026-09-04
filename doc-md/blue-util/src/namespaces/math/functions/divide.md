[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / divide

# Function: divide()

> **divide**(`a`, `b`): `number`

Defined in: packages/blue-util/src/math/index.ts:59

Divides two numbers. Equivalent to `a / b`.

## Parameters

### a

`number`

The first value.

### b

`number`

The second value.

## Returns

`number`

The result of `a / b`.

## See

[multiply](multiply.md)

## Example

```ts
import { __, divide } from '@blue/util';
divide( 71, 100 ); //=> 0.71

const half = divide( __, 2 );
half( 42 ); //=> 21

const reciprocal = divide( 1 );
reciprocal( 4 );   //=> 0.25
```
