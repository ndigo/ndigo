[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / SingletonScope

# Class: SingletonScope

Defined in: [packages/blue-factory/src/scope.ts:183](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-183)

**`Internal`**

Singleton scope implementation — creates at most one instance per named value.
Destruction callbacks can be registered when an instance is created.

 AD-6: Implementation detail — see [PrototypeScope](PrototypeScope.md) for rationale.

## Implements

- [`Scope`](../interfaces/Scope.md)

## Constructors

### Constructor

> **new SingletonScope**(): `SingletonScope`

#### Returns

`SingletonScope`

## Methods

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: [packages/blue-factory/src/scope.ts:187](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-187)

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

Defined in: [packages/blue-factory/src/scope.ts:198](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-198)

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

***

### registerDestructionCallback()

> **registerDestructionCallback**(`name`, `callback`): `void`

Defined in: [packages/blue-factory/src/scope.ts:206](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-206)

#### Parameters

##### name

`string`

##### callback

() => `void`

#### Returns

`void`
