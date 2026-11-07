[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [shared-dependency-registry](../README.md) / DependencyValidationResult

# Interface: DependencyValidationResult

Result of validating a feature's dependency manifest against the registry.

## Properties

### missing

> **missing**: `string`[]

Missing dependency names.

***

### valid

> **valid**: `boolean`

Whether validation passed.

***

### versionMismatches

> **versionMismatches**: `object`[]

Version mismatches found.

#### found

> **found**: `string`

#### name

> **name**: `string`

#### required

> **required**: `string`

***

### warnings

> **warnings**: `string`[]

Non-fatal warnings.
