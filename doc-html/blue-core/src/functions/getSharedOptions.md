[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / getSharedOptions

# Function: getSharedOptions()

> **getSharedOptions**(`target`): [`SharedOptions`](../interfaces/SharedOptions.md) \| `undefined`

Defined in: [packages/blue-core/src/shared.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/shared.ts#lines-48)

Reads the `@shared` metadata from a class constructor or instance.

## Parameters

### target

`any`

Class constructor, prototype, or instance.

## Returns

[`SharedOptions`](../interfaces/SharedOptions.md) \| `undefined`

The `SharedOptions` if the class is marked `@shared`, or `undefined`.
