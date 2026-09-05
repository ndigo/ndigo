[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-model/src](../README.md) / PromiseOf

# Function: PromiseOf()

> **PromiseOf**(`model`): (`p`) => `Promise`\<`any`\>

Defined in: [packages/blue-model/src/basic.ts:146](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-model/src/basic.ts#lines-146)

Creates a promise model that validates the resolved value with another model.

## Parameters

### model

`any`

Model used to validate the fulfilled value.

## Returns

A function that wraps a promise and validates its resolution.

(`p`) => `Promise`\<`any`\>
