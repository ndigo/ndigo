[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / HashScope

# Class: HashScope

Defined in: packages/blue-factory/src/scope.ts:124

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

Defined in: packages/blue-factory/src/scope.ts:128

#### Parameters

##### key

`string`

#### Returns

`void`

***

### getCurrentKey()

> **getCurrentKey**(): `string`

Defined in: packages/blue-factory/src/scope.ts:135

#### Returns

`string`

***

### setCurrentKey()

> **setCurrentKey**(`key`): `void`

Defined in: packages/blue-factory/src/scope.ts:139

#### Parameters

##### key

`string`

#### Returns

`void`

***

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/scope.ts:147

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

Defined in: packages/blue-factory/src/scope.ts:156

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
