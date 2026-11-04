[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / ViewComponent

# Class: ViewComponent

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

A symbol indicating that the value is aware.

#### Inherited from

[`ApplicationComponent`](ApplicationComponent.md).[`[$aware]`](ApplicationComponent.md#aware)

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

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
