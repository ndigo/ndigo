[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / unmountFeatureContext

# Function: unmountFeatureContext()

> **unmountFeatureContext**(`feature`, `policy?`): `void`

Defined in: packages/blue-context/src/context-hierarchy.ts:142

Unmount a feature context by disconnecting relay gateway and optionally closing the context.

## Parameters

### feature

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Feature context composition.

### policy?

[`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md) = `'preserve'`

Unmount policy: preserve context or close it.

## Returns

`void`
