[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / getSharedOptions

# Function: getSharedOptions()

> **getSharedOptions**(`target`): [`SharedOptions`](../interfaces/SharedOptions.md) \| `undefined`

Reads the `@shared` metadata from a class constructor or instance.

## Parameters

### target

`unknown`

Class constructor, prototype, or instance.

## Returns

[`SharedOptions`](../interfaces/SharedOptions.md) \| `undefined`

The `SharedOptions` if the class is marked `@shared`, or `undefined`.
