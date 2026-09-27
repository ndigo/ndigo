[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ApplicationContextAwareProcessor

# Class: ApplicationContextAwareProcessor

Create a new ApplicationContextAwareProcessor for the given context.
An [InitializationAwareProcessor](#) implementation that passes the ApplicationContext to value that implement the `EnvironmentAware`, `ResourceLoaderAware`, `ApplicationEventEmitterAware`, `ContentSourceAware`, `MessageSourceAware`, and/or `ApplicationContextAware` interfaces.

## Implements

- [`InitializationAwareProcessor`](#)

## Constructors

### Constructor

> **new ApplicationContextAwareProcessor**(`applicationContext`): `ApplicationContextAwareProcessor`

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

## Methods

### processAfterInitialization()

> **processAfterInitialization**\<`T`\>(`name`, `value`): `T`

Returns the value unchanged after initialization.

#### Type Parameters

##### T

`T` = `unknown`

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

Injects the application context into aware values before initialization.

#### Type Parameters

##### T

`T` = `unknown`

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
