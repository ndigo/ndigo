[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / DefaultSharedDependencyRegistry

# Class: DefaultSharedDependencyRegistry

Defined in: packages/blue-context/src/shared-dependency-registry.ts:70

Default implementation of `SharedDependencyRegistry`.

Validates feature dependencies against the ancestor context chain
at mount time, checking both the registry's declarations and actual
runtime bean presence.

## Implements

- [`SharedDependencyRegistry`](../interfaces/SharedDependencyRegistry.md)

## Constructors

### Constructor

> **new DefaultSharedDependencyRegistry**(): `DefaultSharedDependencyRegistry`

Defined in: packages/blue-context/src/shared-dependency-registry.ts:73

#### Returns

`DefaultSharedDependencyRegistry`

## Methods

### declare()

> **declare**(`manifest`): `void`

Defined in: packages/blue-context/src/shared-dependency-registry.ts:77

Declare shared dependencies from shell configuration.

#### Parameters

##### manifest

`Record`\<`string`, [`SharedDependencyEntry`](../interfaces/SharedDependencyEntry.md)\>

A map of token description (string) to dependency entry.

#### Returns

`void`

#### Implementation of

[`SharedDependencyRegistry`](../interfaces/SharedDependencyRegistry.md).[`declare`](../interfaces/SharedDependencyRegistry.md#declare)

***

### getDependency()

> **getDependency**(`name`): [`SharedDependencyEntry`](../interfaces/SharedDependencyEntry.md) \| `undefined`

Defined in: packages/blue-context/src/shared-dependency-registry.ts:83

Get a dependency entry by name.

#### Parameters

##### name

`string`

The dependency name (token description).

#### Returns

[`SharedDependencyEntry`](../interfaces/SharedDependencyEntry.md) \| `undefined`

The dependency entry, or `undefined` if not declared.

#### Implementation of

[`SharedDependencyRegistry`](../interfaces/SharedDependencyRegistry.md).[`getDependency`](../interfaces/SharedDependencyRegistry.md#getdependency)

***

### validate()

> **validate**(`required`, `optional`): [`DependencyValidationResult`](../interfaces/DependencyValidationResult.md)

Defined in: packages/blue-context/src/shared-dependency-registry.ts:87

Validate a feature's dependency requirements against this registry.

#### Parameters

##### required

`Record`\<`string`, `string`\>

Map of dependency name to semver range, e.g. `{ ROUTER: '^1.0.0' }`.

##### optional

`Record`\<`string`, `string`\>

Map of optional dependency name to semver range.

#### Returns

[`DependencyValidationResult`](../interfaces/DependencyValidationResult.md)

Validation result with any missing or mismatched dependencies.

#### Implementation of

[`SharedDependencyRegistry`](../interfaces/SharedDependencyRegistry.md).[`validate`](../interfaces/SharedDependencyRegistry.md#validate)
