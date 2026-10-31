[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ApplicationComponent

# Class: ApplicationComponent

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

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

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

`AsApplicationContextAware(Null).setApplicationContext`
