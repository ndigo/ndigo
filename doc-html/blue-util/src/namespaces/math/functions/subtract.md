[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / subtract

# Function: subtract()

> **subtract**(`a`, `b`): `number`

Defined in: [packages/blue-util/src/math/index.ts:235](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/math/index.ts#lines-235)

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
