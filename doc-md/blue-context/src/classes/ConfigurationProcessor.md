[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurationProcessor

# Class: ConfigurationProcessor

Defined in: packages/blue-context/src/configuration.ts:301

A [EntryRegistryProcessor](../../../blue-factory/src/interfaces/EntryRegistryProcessor.md) used for processing of @configuration\|@configuration classes.
This processor should be prioritized as it is important that any @entry\|@entry methods declared in the `@configuration` classes have their values registered before any other EntryProcessor\|EntryProcessor executes.

## See

 - module:context.AsEnvironmentAware
 - module:context.AsResourceLoaderAware

## Extends

- [`ResourceLoaderAware`](../interfaces/ResourceLoaderAware.md) & [`EnvironmentAware`](../interfaces/EnvironmentAware.md) & [`Null`](../../../blue-core/src/classes/Null.md)\<`this`\>

## Implements

- [`EntryRegistryProcessor`](../../../blue-factory/src/interfaces/EntryRegistryProcessor.md)

## Constructors

### Constructor

> **new ConfigurationProcessor**(): `ConfigurationProcessor`

#### Returns

`ConfigurationProcessor`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).constructor`

## Properties

### environment

> **environment**: [`Environment`](../interfaces/Environment.md)

Defined in: packages/blue-context/src/configuration.ts:305

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/src/aware.ts:16

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).[$aware]`

## Methods

### processEntryRegistry()

> **processEntryRegistry**(`registry`): `void`

Defined in: packages/blue-context/src/configuration.ts:307

#### Parameters

##### registry

[`Registry`](../../../blue-factory/src/interfaces/Registry.md)

#### Returns

`void`

#### Implementation of

[`EntryRegistryProcessor`](../../../blue-factory/src/interfaces/EntryRegistryProcessor.md).[`processEntryRegistry`](../../../blue-factory/src/interfaces/EntryRegistryProcessor.md#processentryregistry)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:23

#### Parameters

##### environment

[`Environment`](../interfaces/Environment.md)

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setEnvironment`

***

### setResourceLoader()

> **setResourceLoader**(`loader`): `void`

Defined in: packages/blue-context/src/resource.ts:20

#### Parameters

##### loader

[`ResourceLoader`](../interfaces/ResourceLoader.md)

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setResourceLoader`
