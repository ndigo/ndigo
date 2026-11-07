[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [configuration](../README.md) / ConfigurationProcessor

# Class: ConfigurationProcessor

A [EntryRegistryProcessor](../../index/interfaces/EntryRegistryProcessor.md) used for processing of `configuration` classes.
This processor should be prioritized as it is important that any `entry` methods declared in the the `configuration` decorator classes have their values registered before any other `EntryProcessor` executes.

## Extends

- [`ResourceLoaderAware`](../../resource/interfaces/ResourceLoaderAware.md) & [`EnvironmentAware`](../../environment/interfaces/EnvironmentAware.md) & `Null`\<`this`\>

## Implements

- [`EntryRegistryProcessor`](../../index/interfaces/EntryRegistryProcessor.md)

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

> **environment**: [`Environment`](../../environment/interfaces/Environment.md)

The environment used for resolving properties.

## Methods

### processEntryRegistry()

> **processEntryRegistry**(`registry`): `void`

Processes configuration classes registered as entry registries.

#### Parameters

##### registry

[`Registry`](../../index/interfaces/Registry.md)

The registry to process.

#### Returns

`void`

#### Implementation of

[`EntryRegistryProcessor`](../../index/interfaces/EntryRegistryProcessor.md).[`processEntryRegistry`](../../index/interfaces/EntryRegistryProcessor.md#processentryregistry)

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Captures the environment.

#### Parameters

##### environment

[`Environment`](../../environment/interfaces/Environment.md)

The environment.

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setEnvironment`

***

### setResourceLoader()

> **setResourceLoader**(`loader`): `void`

Sets the resource loader.

#### Parameters

##### loader

[`ResourceLoader`](../../resource/interfaces/ResourceLoader.md)

The loader.

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setResourceLoader`
