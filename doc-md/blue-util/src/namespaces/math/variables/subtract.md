[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / subtract

# Variable: subtract

> `const` **subtract**: \{(`a`): (`b`) => `number`; (`__`, `b`): (`a`) => `number`; (`a`, `b`): `number`; \} = `R.subtract`

Defined in: packages/blue-util/src/math/index.ts:19

Subtracts its second argument from its first argument.

## Call Signature

> (`a`): (`b`) => `number`

Subtracts its second argument from its first argument.

See also [add](add.md)

### Parameters

#### a

`number`

### Returns

(`b`) => `number`

### Example

```typescript
R.subtract(10, 8); //=> 2

const minus5 = R.subtract(R.__, 5);
minus5(17); //=> 12

const complementaryAngle = R.subtract(90);
complementaryAngle(30); //=> 60
complementaryAngle(72); //=> 18
```

## Call Signature

> (`__`, `b`): (`a`) => `number`

Subtracts its second argument from its first argument.

See also [add](add.md)

### Parameters

#### \_\_

`Placeholder`

#### b

`number`

### Returns

(`a`) => `number`

### Example

```typescript
R.subtract(10, 8); //=> 2

const minus5 = R.subtract(R.__, 5);
minus5(17); //=> 12

const complementaryAngle = R.subtract(90);
complementaryAngle(30); //=> 60
complementaryAngle(72); //=> 18
```

## Call Signature

> (`a`, `b`): `number`

Subtracts its second argument from its first argument.

See also [add](add.md)

### Parameters

#### a

`number`

#### b

`number`

### Returns

`number`

### Example

```typescript
R.subtract(10, 8); //=> 2

const minus5 = R.subtract(R.__, 5);
minus5(17); //=> 12

const complementaryAngle = R.subtract(90);
complementaryAngle(30); //=> 60
complementaryAngle(72); //=> 18
```

## Param

The first value.

## Param

The second value.

## Returns

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
