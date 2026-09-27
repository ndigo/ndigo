[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ApplicationContextAware

# Interface: ApplicationContextAware

Interface to be implemented by any object that wishes to be notified of the [ApplicationContext](ApplicationContext.md) that it runs in.

Implementing this interface makes sense for example when an object requires access to a set of collaborating values.

This interface can also be implemented if an object needs access to file resources, i.e. wants to call [getResource](ResourceLoader.md#getresource), wants to emit an application event, or requires access to the [ContentSource](#). However, it is preferable to implement the more specific `ResourceLoaderAware`, `ApplicationEventEmitterAware` or `ContentSourceAware` interface in such a specific scenario.

`AsApplicationContextAware` is a convenience mixin for application objects, implementing this interface.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

[`ApplicationContext`](ApplicationContext.md)

The ApplicationContext to be used by this object.

#### Returns

`void`
