[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / DomainMetadata

# Interface: DomainMetadata

Defined in: [packages/blue-domain/src/decorators.ts:97](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/decorators.ts#lines-97)

Reads domain-specific metadata from a class decorated with domain decorators.

## Param

The constructor function of the domain component class

## Properties

### name?

> `optional` **name?**: `string`

Defined in: [packages/blue-domain/src/decorators.ts:99](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/decorators.ts#lines-99)

Component name from @domainComponent, or undefined if not decorated

***

### actions

> **actions**: `string`[]

Defined in: [packages/blue-domain/src/decorators.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/decorators.ts#lines-101)

Action method names from `domainAction`

***

### data

> **data**: `string`[]

Defined in: [packages/blue-domain/src/decorators.ts:103](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/decorators.ts#lines-103)

Data field names from `domainData`
