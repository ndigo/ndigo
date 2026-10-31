[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ConfigurationProcessor

# Class: ConfigurationProcessor

A [EntryRegistryProcessor](../interfaces/EntryRegistryProcessor.md) used for processing of `configuration` classes.
This processor should be prioritized as it is important that any `entry` methods declared in the the `configuration` decorator classes have their values registered before any other `EntryProcessor` executes.

## Extends

- [`ResourceLoaderAware`](../interfaces/ResourceLoaderAware.md) & [`EnvironmentAware`](../interfaces/EnvironmentAware.md) & `Null`\<`this`\>

## Implements

- [`EntryRegistryProcessor`](../interfaces/EntryRegistryProcessor.md)

## Constructors

### Constructor

> **new ConfigurationProcessor**(): `ConfigurationProcessor`

#### Returns

`ConfigurationProcessor`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).[$aware]`

***

### environment

> **environment**: [`Environment`](../interfaces/Environment.md)

The environment used for resolving properties.

## Methods

### processEntryRegistry()

> **processEntryRegistry**(`registry`): `void`

Processes configuration classes registered as entry registries.

#### Parameters

##### registry

[`Registry`](../interfaces/Registry.md)

The registry to process.

#### Returns

`void`

#### Implementation of

[`EntryRegistryProcessor`](../interfaces/EntryRegistryProcessor.md).[`processEntryRegistry`](../interfaces/EntryRegistryProcessor.md#processentryregistry)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

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

#### Parameters

##### loader

[`ResourceLoader`](../interfaces/ResourceLoader.md)

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setResourceLoader`
