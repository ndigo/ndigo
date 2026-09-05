[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / domainData

# Function: domainData()

> **domainData**(`value`, `context`): `void` \| ((`initialValue`) => `any`)

Defined in: [packages/blue-domain/src/decorators.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/decorators.ts#lines-58)

Field decorator that mirrors the field through `this.model` (a `JSONObject` from `@blue/core`).
On `addInitializer`, initializes `this.model` if not already set (to a `createNull()` object),
stores the initial value to `this.model.set(fieldName, value)`, then redefines the property
with a getter/setter that proxies through `this.model.get(fieldName)` / `this.model.set(fieldName, value)`.

## Parameters

### value

`undefined`

### context

`ClassFieldDecoratorContext`

## Returns

`void` \| ((`initialValue`) => `any`)

A field decorator function
