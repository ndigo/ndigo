[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-hierarchy](../README.md) / createFeatureContext

# Function: createFeatureContext()

> **createFeatureContext**(`parent`, `options`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Create a feature context as a child of `parent`, optionally wiring an allowlisted relay gateway.

## Parameters

### parent

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

The shell or owning parent context.

### options

[`FeatureContextOptions`](../interfaces/FeatureContextOptions.md)

Feature context options.

## Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

The composed feature context and optional gateway.
