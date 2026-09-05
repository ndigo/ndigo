[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-domain/src](../README.md) / domainAction

# Function: domainAction()

> **domainAction**\<`T`\>(`target`, `context`): `void` \| `T`

Defined in: [packages/blue-domain/src/decorators.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-domain/src/decorators.ts#lines-28)

Method decorator that wraps the method with try/catch error logging and stores the method name in Symbol.metadata
so the component knows which methods are actions.

## Type Parameters

### T

`T` *extends* (...`args`) => `any`

## Parameters

### target

`T`

### context

`ClassMethodDecoratorContext`

## Returns

`void` \| `T`

A method decorator function
