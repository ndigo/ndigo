[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ConfigurationProcessor

# Class: ConfigurationProcessor

Defined in: [packages/blue-context/src/configuration.ts:348](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/configuration.ts#lines-348)

A [EntryRegistryProcessor](#) used for processing of `configuration` classes.
This processor should be prioritized as it is important that any `entry` methods declared in the the `configuration` decorator classes have their values registered before any other `EntryProcessor` executes.

## Extends

- [`ResourceLoaderAware`](../interfaces/ResourceLoaderAware.md) & [`EnvironmentAware`](../interfaces/EnvironmentAware.md) & `Null`\<`this`\>

## Implements

- [`EntryRegistryProcessor`](#)

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

Defined in: [packages/blue-context/src/configuration.ts:355](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/configuration.ts#lines-355)

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

Defined in: [packages/blue-context/src/configuration.ts:362](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/configuration.ts#lines-362)

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

Defined in: [packages/blue-context/src/environment.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-46)

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

Defined in: [packages/blue-context/src/resource.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/resource.ts#lines-29)

#### Parameters

##### loader

[`ResourceLoader`](../interfaces/ResourceLoader.md)

#### Returns

`void`

#### Inherited from

`AsResourceLoaderAware(AsEnvironmentAware(Null)).setResourceLoader`
