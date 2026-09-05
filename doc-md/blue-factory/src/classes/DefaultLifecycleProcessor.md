[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / DefaultLifecycleProcessor

# Class: DefaultLifecycleProcessor

Defined in: [packages/blue-factory/src/lifecycle.ts:100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-100)

## Implements

- [`LifecycleProcessor`](../interfaces/LifecycleProcessor.md)

## Constructors

### Constructor

> **new DefaultLifecycleProcessor**(): `DefaultLifecycleProcessor`

Defined in: [packages/blue-factory/src/lifecycle.ts:103](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-103)

#### Returns

`DefaultLifecycleProcessor`

## Properties

### isRunning

> **isRunning**: `boolean`

Defined in: [packages/blue-factory/src/lifecycle.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-101)

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`isRunning`](../interfaces/LifecycleProcessor.md#isrunning)

## Methods

### onClose()

> **onClose**(`registry`): `void`

Defined in: [packages/blue-factory/src/lifecycle.ts:107](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-107)

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

Defined in: [packages/blue-factory/src/lifecycle.ts:121](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-121)

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

Defined in: [packages/blue-factory/src/lifecycle.ts:136](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-136)

#### Returns

`void`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`start`](../interfaces/LifecycleProcessor.md#start)

***

### stop()

> **stop**(): `void`

Defined in: [packages/blue-factory/src/lifecycle.ts:140](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/lifecycle.ts#lines-140)

#### Returns

`void`

#### Implementation of

[`LifecycleProcessor`](../interfaces/LifecycleProcessor.md).[`stop`](../interfaces/LifecycleProcessor.md#stop)
