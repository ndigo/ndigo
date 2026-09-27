[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / HashScope

# Class: HashScope

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

### destroyValue()

> **destroyValue**(`name`): `void`

#### Parameters

##### name

`string`

#### Returns

`void`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`destroyValue`](../interfaces/Scope.md#destroyvalue)

***

### endScope()

> **endScope**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`

***

### getCurrentKey()

> **getCurrentKey**(): `string` \| `null`

#### Returns

`string` \| `null`

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

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`getValue`](../interfaces/Scope.md#getvalue)

***

### setCurrentKey()

> **setCurrentKey**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`
