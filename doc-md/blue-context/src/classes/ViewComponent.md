[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ViewComponent

# Class: ViewComponent

Defined in: packages/blue-context/src/context.ts:874

Base class for view components.
Encapsulates presentation logic and DOM interaction.

## Extends

- [`ApplicationComponent`](ApplicationComponent.md)

## Constructors

### Constructor

> **new ViewComponent**(): `ViewComponent`

#### Returns

`ViewComponent`

#### Inherited from

[`ApplicationComponent`](ApplicationComponent.md).[`constructor`](ApplicationComponent.md#constructor)

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

[`ApplicationComponent`](ApplicationComponent.md).[`[$aware]`](ApplicationComponent.md#aware)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/src/context.ts:195

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

[`ApplicationComponent`](ApplicationComponent.md).[`setApplicationContext`](ApplicationComponent.md#setapplicationcontext)
