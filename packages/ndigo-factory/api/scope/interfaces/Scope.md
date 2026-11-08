[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [scope](../README.md) / Scope

# Interface: Scope

A caching strategy: resolves named values through the supplied object
factory and can destroy cached values.

## Methods

### destroyValue()

> **destroyValue**(`name`): `void`

Destroys a cached value.

#### Parameters

##### name

`string`

The value name.

#### Returns

`void`

***

### getValue()

> **getValue**\<`T`\>(`name`, `objectFactory`): `T`

Resolves a named value through the object factory.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The value name.

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

The lazy factory invoked on a miss.

#### Returns

`T`

The cached or newly created value.
