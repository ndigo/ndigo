[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationContextAwareProcessor

# Class: ApplicationContextAwareProcessor

Defined in: packages/blue-context/src/context.ts:331

Create a new ApplicationContextAwareProcessor for the given context.
 * An [InitializationAwareProcessor](../../../blue-factory/src/interfaces/InitializationAwareProcessor.md) implementation that passes the ApplicationContext to value that implement the EnvironmentAware\|EnvironmentAware, ResourceLoaderAware\|ResourceLoaderAware, ApplicationEventEmitterAware\|ApplicationEventEmitterAware, ContentSourceAware\|ContentSourceAware, and/or [ApplicationContextAware](../interfaces/ApplicationContextAware.md) interfaces.

Implemented interfaces are satisfied in order of their mention above.

## See

 - [EnvironmentAware](../interfaces/EnvironmentAware.md)
 - [ResourceLoaderAware](../interfaces/ResourceLoaderAware.md)
 - [ApplicationEventEmitterAware](../interfaces/ApplicationEventEmitterAware.md)
 - ContentSourceAware
 - [ApplicationContextAware](../interfaces/ApplicationContextAware.md)

## Implements

- [`InitializationAwareProcessor`](../../../blue-factory/src/interfaces/InitializationAwareProcessor.md)

## Constructors

### Constructor

> **new ApplicationContextAwareProcessor**(`applicationContext`): `ApplicationContextAwareProcessor`

Defined in: packages/blue-context/src/context.ts:334

#### Parameters

##### applicationContext

[`ApplicationContext`](../interfaces/ApplicationContext.md)

#### Returns

`ApplicationContextAwareProcessor`

## Properties

### applicationContext

> `readonly` **applicationContext**: [`ApplicationContext`](../interfaces/ApplicationContext.md)

Defined in: packages/blue-context/src/context.ts:332

## Methods

### processAfterInitialization()

> **processAfterInitialization**\<`T`\>(`name`, `value`): `T`

Defined in: packages/blue-context/src/context.ts:346

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

[`InitializationAwareProcessor`](../../../blue-factory/src/interfaces/InitializationAwareProcessor.md).[`processAfterInitialization`](../../../blue-factory/src/interfaces/InitializationAwareProcessor.md#processafterinitialization)

***

### processBeforeInitialization()

> **processBeforeInitialization**\<`T`\>(`name`, `value`): `T`

Defined in: packages/blue-context/src/context.ts:350

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

[`InitializationAwareProcessor`](../../../blue-factory/src/interfaces/InitializationAwareProcessor.md).[`processBeforeInitialization`](../../../blue-factory/src/interfaces/InitializationAwareProcessor.md#processbeforeinitialization)
