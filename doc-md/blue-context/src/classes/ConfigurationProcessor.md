[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurationProcessor

# Class: ConfigurationProcessor

Defined in: packages/blue-context/src/configuration.ts:348

A EntryRegistryProcessor\|EntryRegistryProcessor used for processing of @configuration\|@configuration classes.
This processor should be prioritized as it is important that any @entry\|@entry methods declared in the `@configuration` classes have their values registered before any other EntryProcessor\|EntryProcessor executes.

## Extends

- [`ResourceLoaderAware`](../interfaces/ResourceLoaderAware.md) & [`EnvironmentAware`](../interfaces/EnvironmentAware.md) & `Null`\<`this`\>

## Implements

- `EntryRegistryProcessor`

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

Defined in: packages/blue-context/src/configuration.ts:355

The environment used for resolving properties.

***

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).[$aware]`

## Methods

### processEntryRegistry()

> **processEntryRegistry**(`registry`): `void`

Defined in: packages/blue-context/src/configuration.ts:362

Processes configuration classes registered as entry registries.

#### Parameters

##### registry

`Registry`

The registry to process.

#### Returns

`void`

#### Implementation of

`EntryRegistryProcessor.processEntryRegistry`

***

### setEnvironment()

> **setEnvironment**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:46

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

Defined in: packages/blue-context/src/resource.ts:29

#### Parameters

##### loader

[`ResourceLoader`](../interfaces/ResourceLoader.md)

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setResourceLoader`
