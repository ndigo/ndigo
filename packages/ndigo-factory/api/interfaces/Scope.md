[**@ndigo/factory v0.0.1**](../README.md)

***

[@ndigo/factory](../README.md) / Scope

# Interface: Scope

A caching strategy: resolves named values through the supplied object
factory and can destroy cached values.

## Methods

### destroyValue()

> **destroyValue**(`name`): `void`

#### Parameters

##### name

`string`

#### Returns

`void`

***

### getValue()

> **getValue**\<`T`\>(`name`, `objectFactory`): `T`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

#### Returns

`T`
