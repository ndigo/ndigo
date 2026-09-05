[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationComponent

# Class: ApplicationComponent

Defined in: [packages/blue-context/src/context.ts:868](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-868)

Base class for any object managed by the ApplicationContext.
Provides a standard way to access the application context.

## Extends

- [`ApplicationContextAware`](../interfaces/ApplicationContextAware.md) & `Null`\<`this`\>

## Extended by

- [`BusinessComponent`](BusinessComponent.md)
- [`ViewComponent`](ViewComponent.md)

## Constructors

### Constructor

> **new ApplicationComponent**(): `ApplicationComponent`

#### Returns

`ApplicationComponent`

#### Inherited from

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: [packages/blue-context/src/context.ts:195](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-195)

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`
