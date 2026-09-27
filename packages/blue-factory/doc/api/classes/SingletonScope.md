[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / SingletonScope

# Class: SingletonScope

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

### registerDestructionCallback()

> **registerDestructionCallback**(`name`, `callback`): `void`

#### Parameters

##### name

`string`

##### callback

() => `void`

#### Returns

`void`
