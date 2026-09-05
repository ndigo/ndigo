[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / DependencyValidationResult

# Interface: DependencyValidationResult

Defined in: [packages/blue-context/src/shared-dependency-registry.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/shared-dependency-registry.ts#lines-25)

Result of validating a feature's dependency manifest against the registry.

## Properties

### valid

> **valid**: `boolean`

Defined in: [packages/blue-context/src/shared-dependency-registry.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/shared-dependency-registry.ts#lines-26)

***

### missing

> **missing**: `string`[]

Defined in: [packages/blue-context/src/shared-dependency-registry.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/shared-dependency-registry.ts#lines-27)

***

### versionMismatches

> **versionMismatches**: `object`[]

Defined in: [packages/blue-context/src/shared-dependency-registry.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/shared-dependency-registry.ts#lines-28)

#### name

> **name**: `string`

#### required

> **required**: `string`

#### found

> **found**: `string`

***

### warnings

> **warnings**: `string`[]

Defined in: [packages/blue-context/src/shared-dependency-registry.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/shared-dependency-registry.ts#lines-29)
