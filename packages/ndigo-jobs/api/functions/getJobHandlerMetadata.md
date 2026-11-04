[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / getJobHandlerMetadata

# Function: getJobHandlerMetadata()

> **getJobHandlerMetadata**(`target`, `methodName`): [`JobHandlerMetadata`](../interfaces/JobHandlerMetadata.md) \| `undefined`

Reads the registration recorded by `@jobHandler` for a method.

## Parameters

### target

`object`

The decorated class constructor (or an instance).

### methodName

`string`

The decorated method name.

## Returns

[`JobHandlerMetadata`](../interfaces/JobHandlerMetadata.md) \| `undefined`

The registration, or `undefined` when not a job handler.
