[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / HashScope

# Class: HashScope

Defined in: [packages/blue-factory/src/scope.ts:125](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-125)

**`Internal`**

Hash (route) scope implementation — one instance per scope key.
Activate a scope context by calling `setCurrentKey(key)` before `getValue()`.

 AD-6: Implementation detail — see [PrototypeScope](PrototypeScope.md) for rationale.

## Implements

- [`Scope`](../interfaces/Scope.md)

## Constructors

### Constructor

> **new HashScope**(): `HashScope`

#### Returns

`HashScope`

## Methods

### endScope()

> **endScope**(`key`): `void`

Defined in: [packages/blue-factory/src/scope.ts:129](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-129)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### getCurrentKey()

> **getCurrentKey**(): `string` \| `null`

Defined in: [packages/blue-factory/src/scope.ts:136](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-136)

#### Returns

`string` \| `null`

***

### setCurrentKey()

> **setCurrentKey**(`key`): `void`

Defined in: [packages/blue-factory/src/scope.ts:140](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-140)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: [packages/blue-factory/src/scope.ts:148](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-148)

#### Parameters

##### name

`string`

#### Returns

`void`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`destroyValue`](../interfaces/Scope.md#destroyvalue)

***

### getValue()

> **getValue**\<`T`\>(`name`, `objectFactory`): `T`

Defined in: [packages/blue-factory/src/scope.ts:159](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-159)

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

#### Returns

`T`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`getValue`](../interfaces/Scope.md#getvalue)
