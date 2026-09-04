[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationContextAwareProcessor

# Class: ApplicationContextAwareProcessor

Defined in: packages/blue-context/src/context.ts:880

Create a new ApplicationContextAwareProcessor for the given context.
An InitializationAwareProcessor\|InitializationAwareProcessor implementation that passes the ApplicationContext to value that implement the EnvironmentAware\|EnvironmentAware, ResourceLoaderAware\|ResourceLoaderAware, ApplicationEventEmitterAware\|ApplicationEventEmitterAware, ContentSourceAware\|ContentSourceAware, and/or [ApplicationContextAware](../interfaces/ApplicationContextAware.md) interfaces.

## Implements

- `InitializationAwareProcessor`

## Constructors

### Constructor

> **new ApplicationContextAwareProcessor**(`applicationContext`): `ApplicationContextAwareProcessor`

Defined in: packages/blue-context/src/context.ts:888

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

Defined in: packages/blue-context/src/context.ts:881

## Methods

### processAfterInitialization()

> **processAfterInitialization**\<`T`\>(`name`, `value`): `T`

Defined in: packages/blue-context/src/context.ts:903

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

Defined in: packages/blue-context/src/context.ts:913

Injects the application context into aware values before initialization.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The bean name.

##### value

`T`

The initialized value.

#### Returns

`T`

#### Implementation of

`InitializationAwareProcessor.processBeforeInitialization`
