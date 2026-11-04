[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [ndigo-util](../README-2.md) / is

# Function: is()

See if an object (`val`) is an instance of the supplied constructor. This
function will check up the inheritance chain, if any.

## Param

**ctor**

A constructor

## Param

**val**

The value to test

## Example

```ts
is( Object, {} ); //=> true
is( Number, 1 ); //=> true
is( Object, 1 ); //=> false
is( String, 's' ); //=> true
is( String, new String('') ); //=> true
is( Object, new String('') ); //=> true
is( Object, 's' ); //=> false
is( Number, {} ); //=> false
```

## Call Signature

> **is**\<`T`\>(`Ctor`): (`val`) => `val is T`

### Type Parameters

#### T

`T`

### Parameters

#### Ctor

`Function`

### Returns

(`val`) => `val is T`

## Call Signature

> **is**\<`T`\>(`Ctor`, `val`): `val is T`

### Type Parameters

#### T

`T`

### Parameters

#### Ctor

`Function`

#### val

`unknown`

### Returns

`val is T`
