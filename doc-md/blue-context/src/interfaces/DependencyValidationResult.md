[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / DependencyValidationResult

# Interface: DependencyValidationResult

Defined in: packages/blue-context/src/shared-dependency-registry.ts:27

Result of validating a feature's dependency manifest against the registry.

## Properties

### valid

> **valid**: `boolean`

Defined in: packages/blue-context/src/shared-dependency-registry.ts:28

***

### missing

> **missing**: `string`[]

Defined in: packages/blue-context/src/shared-dependency-registry.ts:29

***

### versionMismatches

> **versionMismatches**: `object`[]

Defined in: packages/blue-context/src/shared-dependency-registry.ts:30

#### name

> **name**: `string`

#### required

> **required**: `string`

#### found

> **found**: `string`

***

### warnings

> **warnings**: `string`[]

Defined in: packages/blue-context/src/shared-dependency-registry.ts:31
