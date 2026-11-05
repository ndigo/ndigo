[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [index](../README.md) / like

# Function: like()

## Call Signature

> **like**(`descriptor`, `value`): `boolean`

Curried duck-typing predicate: `like(descriptor)` returns a function that
tests values against it, while `like(descriptor, value)` evaluates once.
Descriptor metadata is cached per descriptor in a `WeakMap`, so repeated
curried use pays the descriptor analysis cost once.

### Parameters

#### descriptor

[`LikeDescriptor`](../../type/like/type-aliases/LikeDescriptor.md)

#### value

`unknown`

### Returns

`boolean`

## Call Signature

> **like**(`descriptor`): (`value`) => `boolean`

Curried duck-typing predicate: `like(descriptor)` returns a function that
tests values against it, while `like(descriptor, value)` evaluates once.
Descriptor metadata is cached per descriptor in a `WeakMap`, so repeated
curried use pays the descriptor analysis cost once.

### Parameters

#### descriptor

[`LikeDescriptor`](../../type/like/type-aliases/LikeDescriptor.md)

### Returns

(`value`) => `boolean`
