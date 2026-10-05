[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / PrototypeScope

# Class: PrototypeScope

**`Internal`**

Prototype scope implementation — creates a fresh instance on every `getValue()` call.

 AD-06: This is an implementation detail of the scoped factory. Only the
[Scope](../interfaces/Scope.md) and [ScopedFactory](../interfaces/ScopedFactory.md) interfaces are part of the stable public API.
A future scoping split may move concrete scope implementations to a separate module.

## Implements

- [`Scope`](../interfaces/Scope.md)

## Constructors

### Constructor

> **new PrototypeScope**(): `PrototypeScope`

#### Returns

`PrototypeScope`

## Methods

### destroyValue()

> **destroyValue**(`_name`): `void`

#### Parameters

##### \_name

`string`

#### Returns

`void`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`destroyValue`](../interfaces/Scope.md#destroyvalue)

***

### getValue()

> **getValue**\<`T`\>(`_name`, `objectFactory`): `T`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### \_name

`string`

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

#### Returns

`T`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`getValue`](../interfaces/Scope.md#getvalue)
