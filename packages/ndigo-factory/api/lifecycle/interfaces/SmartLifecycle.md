[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [lifecycle](../README.md) / SmartLifecycle

# Interface: SmartLifecycle

A [Lifecycle](Lifecycle.md) that starts automatically and runs in a declared phase.

## Extends

- [`Lifecycle`](Lifecycle.md)
- [`Phased`](Phased.md)

## Properties

### isAutoStartup

> `readonly` **isAutoStartup**: `boolean`

Whether the component starts with the context.

***

### isRunning

> `readonly` **isRunning**: `boolean`

Whether the component is running.

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`isRunning`](Lifecycle.md#isrunning)

***

### phase

> `readonly` **phase**: `number`

The component's startup phase.

#### Inherited from

[`Phased`](Phased.md).[`phase`](Phased.md#phase)

## Methods

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
