[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / divide

# Variable: divide

> `const` **divide**: \{(`a`): (`b`) => `number`; (`__`, `b`): (`a`) => `number`; (`a`, `b`): `number`; \} = `R.divide`

Defined in: packages/blue-util/src/math/index.ts:10

Divides two numbers. Equivalent to `a / b`.

## Call Signature

> (`a`): (`b`) => `number`

Divides two numbers. Equivalent to `a / b`.

See also [multiply](multiply.md)

### Parameters

#### a

`number`

### Returns

(`b`) => `number`

### Example

```typescript
R.divide(71, 100); //=> 0.71

const half = R.divide(R.__, 2);
half(42); //=> 21

const reciprocal = R.divide(1);
reciprocal(4);   //=> 0.25
```

## Call Signature

> (`__`, `b`): (`a`) => `number`

Divides two numbers. Equivalent to `a / b`.

See also [multiply](multiply.md)

### Parameters

#### \_\_

`Placeholder`

#### b

`number`

### Returns

(`a`) => `number`

### Example

```typescript
R.divide(71, 100); //=> 0.71

const half = R.divide(R.__, 2);
half(42); //=> 21

const reciprocal = R.divide(1);
reciprocal(4);   //=> 0.25
```

## Call Signature

> (`a`, `b`): `number`

Divides two numbers. Equivalent to `a / b`.

See also [multiply](multiply.md)

### Parameters

#### a

`number`

#### b

`number`

### Returns

`number`

### Example

```typescript
R.divide(71, 100); //=> 0.71

const half = R.divide(R.__, 2);
half(42); //=> 21

const reciprocal = R.divide(1);
reciprocal(4);   //=> 0.25
```

## Param

The first value.

## Param

The second value.

## Returns

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
