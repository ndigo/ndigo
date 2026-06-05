[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / createFeatureContext

# Function: createFeatureContext()

> **createFeatureContext**(`parent`, `options`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Defined in: packages/blue-context/src/context-hierarchy.ts:115

Create a feature context as a child of `parent`, optionally wiring an allowlisted relay gateway.

## Parameters

### parent

[`ApplicationContext`](../interfaces/ApplicationContext.md)

The shell or owning parent context.

### options

[`FeatureContextOptions`](../interfaces/FeatureContextOptions.md)

Feature context options.

## Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

The composed feature context and optional gateway.
