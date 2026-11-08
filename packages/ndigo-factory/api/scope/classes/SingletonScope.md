[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [scope](../README.md) / SingletonScope

# Class: SingletonScope

**`Internal`**

Singleton scope implementation — creates at most one instance per named value.
Destruction callbacks can be registered when an instance is created.

 AD-06: Implementation detail — see [PrototypeScope](PrototypeScope.md) for rationale.

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

Destroys a cached value.

#### Parameters

##### name

`string`

The value name.

#### Returns

`void`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`destroyValue`](../interfaces/Scope.md#destroyvalue)

***

### getValue()

> **getValue**\<`T`\>(`name`, `objectFactory`): `T`

Resolves a cached value, creating it on a miss.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The value name.

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

The lazy factory invoked on a miss.

#### Returns

`T`

The cached or newly created value.

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`getValue`](../interfaces/Scope.md#getvalue)

***

### registerDestructionCallback()

> **registerDestructionCallback**(`name`, `callback`): `void`

Registers a teardown callback for a value.

#### Parameters

##### name

`string`

The value name.

##### callback

() => `void`

The teardown callback.

#### Returns

`void`
