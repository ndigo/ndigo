[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [scope](../README.md) / ScopedFactory

# Interface: ScopedFactory

A factory that exposes named [Scope](Scope.md) strategies and destroys scoped values.

## Methods

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

#### Parameters

##### scopeName

`string`

##### valueName

`string`

#### Returns

`void`

***

### getScope()

> **getScope**(`name`): [`Scope`](Scope.md)

#### Parameters

##### name

`string`

#### Returns

[`Scope`](Scope.md)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

#### Returns

`string`[]

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

#### Parameters

##### name

`string`

##### scope

[`Scope`](Scope.md)

#### Returns

`void`
