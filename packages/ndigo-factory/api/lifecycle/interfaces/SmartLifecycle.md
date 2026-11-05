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

***

### isRunning

> `readonly` **isRunning**: `boolean`

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`isRunning`](Lifecycle.md#isrunning)

***

### phase

> `readonly` **phase**: `number`

#### Inherited from

[`Phased`](Phased.md).[`phase`](Phased.md#phase)

## Methods

### start()

> **start**(): `void`

#### Returns

`void`

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`start`](Lifecycle.md#start)

***

### stop()

> **stop**(): `void`

#### Returns

`void`

#### Inherited from

[`Lifecycle`](Lifecycle.md).[`stop`](Lifecycle.md#stop)
