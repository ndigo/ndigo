[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationContextAware

# Interface: ApplicationContextAware

Defined in: packages/blue-context/src/context.ts:187

Interface to be implemented by any object that wishes to be notified of the [ApplicationContext](ApplicationContext.md) that it runs in.

Implementing this interface makes sense for example when an object requires access to a set of collaborating values.

This interface can also be implemented if an object needs access to file resources, i.e. wants to call [getResource](ResourceLoader.md#getresource), wants to emit an application event, or requires access to the ContentSource\|ContentSource. However, it is preferable to implement the more specific ResourceLoaderAware\|ResourceLoaderAware, ApplicationEventEmitterAware\|ApplicationEventEmitterAware or ContentSourceAware\|ContentSourceAware interface in such a specific scenario.

[AsApplicationContextAware](../functions/AsApplicationContextAware.md) is a convenience mixin for application objects, implementing this interface.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Defined in: packages/blue-context/src/context.ts:194

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

[`ApplicationContext`](ApplicationContext.md)

The ApplicationContext to be used by this object.

#### Returns

`void`
