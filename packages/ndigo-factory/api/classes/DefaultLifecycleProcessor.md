[**@ndigo/factory v0.0.1**](../README.md)

***

[@ndigo/factory](../README.md) / DefaultLifecycleProcessor

# Class: DefaultLifecycleProcessor

Default [LifecycleProcessor](../interfaces/LifecycleProcessor.md): on refresh starts auto-startup targets
in ascending phase order; on close stops running targets in descending
phase order.

## Implements

- [`LifecycleProcessor`](../interfaces/LifecycleProcessor.md)

## Constructors

### Constructor

> **new DefaultLifecycleProcessor**(): `DefaultLifecycleProcessor`

#### Returns

`DefaultLifecycleProcessor`

## Properties

### isRunning

> **isRunning**: `boolean`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`isRunning`](../interfaces/LifecycleProcessor.md#isrunning)

## Methods

### onClose()

> **onClose**(`registry`): `void`

#### Parameters

##### registry

[`Registry`](../interfaces/Registry.md)

#### Returns

`void`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`onClose`](../interfaces/LifecycleProcessor.md#onclose)

***

### onRefresh()

> **onRefresh**(`registry`): `void`

#### Parameters

##### registry

[`Registry`](../interfaces/Registry.md)

#### Returns

`void`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`onRefresh`](../interfaces/LifecycleProcessor.md#onrefresh)

***

### start()

> **start**(): `void`

#### Returns

`void`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`start`](../interfaces/LifecycleProcessor.md#start)

***

### stop()

> **stop**(): `void`

#### Returns

`void`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`stop`](../interfaces/LifecycleProcessor.md#stop)
