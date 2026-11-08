[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [scope](../README.md) / ScopedFactory

# Interface: ScopedFactory

A factory that exposes named [Scope](Scope.md) strategies and destroys scoped values.

## Methods

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

Destroys a scoped value.

#### Parameters

##### scopeName

`string`

The scope.

##### valueName

`string`

The value name.

#### Returns

`void`

***

### getScope()

> **getScope**(`name`): [`Scope`](Scope.md)

Returns a registered scope.

#### Parameters

##### name

`string`

The scope name.

#### Returns

[`Scope`](Scope.md)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Returns the registered scope names.

#### Returns

`string`[]

The scope names.

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Registers a scope.

#### Parameters

##### name

`string`

The scope name.

##### scope

[`Scope`](Scope.md)

The scope strategy.

#### Returns

`void`
