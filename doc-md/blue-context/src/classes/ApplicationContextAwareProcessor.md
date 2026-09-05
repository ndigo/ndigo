[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationContextAwareProcessor

# Class: ApplicationContextAwareProcessor

Defined in: [packages/blue-context/src/context.ts:886](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-886)

Create a new ApplicationContextAwareProcessor for the given context.
An [InitializationAwareProcessor](#) implementation that passes the ApplicationContext to value that implement the `EnvironmentAware`, `ResourceLoaderAware`, `ApplicationEventEmitterAware`, `ContentSourceAware`, and/or [ApplicationContextAware](../interfaces/ApplicationContextAware.md) interfaces.

## Implements

- [`InitializationAwareProcessor`](#)

## Constructors

### Constructor

> **new ApplicationContextAwareProcessor**(`applicationContext`): `ApplicationContextAwareProcessor`

Defined in: [packages/blue-context/src/context.ts:894](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-894)

Creates a processor bound to a specific application context.

#### Parameters

##### applicationContext

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The context to inject into aware values.

#### Returns

`ApplicationContextAwareProcessor`

## Properties

### applicationContext

> `readonly` **applicationContext**: [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: [packages/blue-context/src/context.ts:887](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-887)

## Methods

### processAfterInitialization()

> **processAfterInitialization**\<`T`\>(`name`, `value`): `T`

Defined in: [packages/blue-context/src/context.ts:909](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-909)

Returns the value unchanged after initialization.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### value

`T`

#### Returns

`T`

#### Implementation of

`InitializationAwareProcessor.processAfterInitialization`

***

### processBeforeInitialization()

> **processBeforeInitialization**\<`T`\>(`name`, `value`): `T`

Defined in: [packages/blue-context/src/context.ts:919](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context.ts#lines-919)

Injects the application context into aware values before initialization.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The entry name.

##### value

`T`

The initialized value.

#### Returns

`T`

#### Implementation of

`InitializationAwareProcessor.processBeforeInitialization`
