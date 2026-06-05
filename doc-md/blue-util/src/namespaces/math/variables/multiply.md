[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / multiply

# Variable: multiply

> `const` **multiply**: \{(`a`): (`b`) => `number`; (`a`, `b`): `number`; \} = `R.multiply`

Defined in: packages/blue-util/src/math/index.ts:16

Multiplies two numbers. Equivalent to `a * b` but curried.

## Call Signature

> (`a`): (`b`) => `number`

Multiplies two numbers. Equivalent to `a * b` but curried.

See also [divide](divide.md)

### Parameters

#### a

`number`

### Returns

(`b`) => `number`

### Example

```typescript
const double = R.multiply(2);
const triple = R.multiply(3);
double(3);       //=>  6
triple(4);       //=> 12
R.multiply(2, 5);  //=> 10
```

## Call Signature

> (`a`, `b`): `number`

Multiplies two numbers. Equivalent to `a * b` but curried.

See also [divide](divide.md)

### Parameters

#### a

`number`

#### b

`number`

### Returns

`number`

### Example

```typescript
const double = R.multiply(2);
const triple = R.multiply(3);
double(3);       //=>  6
triple(4);       //=> 12
R.multiply(2, 5);  //=> 10
```

## Param

The first value.

## Param

The second value.

## Returns

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
