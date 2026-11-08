[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [lifecycle](../README.md) / LifecycleProcessor

# Interface: LifecycleProcessor

Drives registered [SmartLifecycle](SmartLifecycle.md) targets on context refresh and close.

## Extends

- [`Lifecycle`](Lifecycle.md)

## Properties

### isRunning

> `readonly` **isRunning**: `boolean`

Whether the component is running.

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`isRunning`](Lifecycle.md#isrunning)

## Methods

### onClose()

> **onClose**(`registry`): `void`

Stops running targets on context close.

#### Parameters

##### registry

[`Registry`](../../registry/interfaces/Registry.md)

The registry of lifecycle targets.

#### Returns

`void`

***

### onRefresh()

> **onRefresh**(`registry`): `void`

Starts auto-startup targets on context refresh.

#### Parameters

##### registry

[`Registry`](../../registry/interfaces/Registry.md)

The registry of lifecycle targets.

#### Returns

`void`

***

### start()

> **start**(): `void`

Starts the component.

#### Returns

`void`

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`start`](Lifecycle.md#start)

***

### stop()

> **stop**(): `void`

Stops the component.

#### Returns

`void`

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`stop`](Lifecycle.md#stop)
