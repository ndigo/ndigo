[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / PrototypeScope

# Class: PrototypeScope

Defined in: [packages/blue-factory/src/scope.ts:109](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-109)

**`Internal`**

Prototype scope implementation — creates a fresh instance on every `getValue()` call.

 AD-6: This is an implementation detail of the scoped factory. Only the
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

Defined in: [packages/blue-factory/src/scope.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-110)

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

Defined in: [packages/blue-factory/src/scope.ts:114](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-114)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### \_name

`string`

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

#### Returns

`T`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`getValue`](../interfaces/Scope.md#getvalue)
