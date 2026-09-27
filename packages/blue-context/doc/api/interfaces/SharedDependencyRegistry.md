[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / SharedDependencyRegistry

# Interface: SharedDependencyRegistry

Registry that holds shared dependency declarations and validates feature manifests.

## Methods

### declare()

> **declare**(`manifest`): `void`

Declare shared dependencies from shell configuration.

#### Parameters

##### manifest

`Record`\<`string`, [`SharedDependencyEntry`](SharedDependencyEntry.md)\>

A map of token description (string) to dependency entry.

#### Returns

`void`

***

### getDependency()

> **getDependency**(`name`): [`SharedDependencyEntry`](SharedDependencyEntry.md) \| `undefined`

Get a dependency entry by name.

#### Parameters

##### name

`string`

The dependency name (token description).

#### Returns

[`SharedDependencyEntry`](SharedDependencyEntry.md) \| `undefined`

The dependency entry, or `undefined` if not declared.

***

### validate()

> **validate**(`required`, `optional`): [`DependencyValidationResult`](DependencyValidationResult.md)

Validate a feature's dependency requirements against this registry.

#### Parameters

##### required

`Record`\<`string`, `string`\>

Map of dependency name to semver range, e.g. `{ ROUTER: '^1.0.0' }`.

##### optional

`Record`\<`string`, `string`\>

Map of optional dependency name to semver range.

#### Returns

[`DependencyValidationResult`](DependencyValidationResult.md)

Validation result with any missing or mismatched dependencies.
