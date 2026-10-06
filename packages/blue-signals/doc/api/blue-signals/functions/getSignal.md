[**@blue/signals v0.0.1**](../../README.md)

***

[@blue/signals](../../README.md) / [blue-signals](../README-1.md) / getSignal

# Function: getSignal()

> **getSignal**\<`T`\>(`instance`, `field`): `Signal`\<`T`\> \| `undefined`

Returns the backing `Signal` for a `@signal` field activated by `@reactive`,
or `undefined` when the field has no backing signal.

Throws when the instance still carries pending `@signal`/`@effect` metadata:
the declaring class is missing the `@reactive` class decorator, or the member
was declared on a subclass of a `@reactive` class — `@reactive` only
activates members declared in its own class.

## Type Parameters

### T

`T`

## Parameters

### instance

`object`

### field

`string`

## Returns

`Signal`\<`T`\> \| `undefined`
