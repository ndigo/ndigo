[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-method](../README.md) / Invocable

# Interface: Invocable

Anything that can be invoked with positional arguments — the minimal shape a
handler method must satisfy, kept separate so interceptors and mocks can
implement it without the route plumbing below.

## Extended by

- [`HandlerMethod`](HandlerMethod.md)

## Methods

### invoke()

> **invoke**\<`T`\>(...`args`): `T`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### args

...`unknown`[]

#### Returns

`T`
