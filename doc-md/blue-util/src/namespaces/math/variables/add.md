[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / add

# Variable: add

> `const` **add**: \{(`a`): (`b`) => `number`; (`a`, `b`): `number`; \} = `R.add`

Defined in: packages/blue-util/src/math/index.ts:8

Adds two values.

## Call Signature

> (`a`): (`b`) => `number`

Adds two values.

See also [subtract](subtract.md)

### Parameters

#### a

`number`

### Returns

(`b`) => `number`

### Example

```typescript
R.add(2, 3);       //=>  5
R.add(7)(10);      //=> 17
```

## Call Signature

> (`a`, `b`): `number`

Adds two values.

See also [subtract](subtract.md)

### Parameters

#### a

`number`

#### b

`number`

### Returns

`number`

### Example

```typescript
R.add(2, 3);       //=>  5
R.add(7)(10);      //=> 17
```

## Param

## Param

## Returns

## See

[subtract](subtract.md)

## Example

```ts
add( 2, 3 );
//=>  5
add( 7 )( 10 );
//=> 17
```
