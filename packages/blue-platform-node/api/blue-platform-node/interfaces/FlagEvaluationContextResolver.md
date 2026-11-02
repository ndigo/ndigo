[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / FlagEvaluationContextResolver

# Interface: FlagEvaluationContextResolver

Builds the `FlagEvaluationContext` for a request's flag evaluation.
Implementations run on the request path: keep them synchronous and
side-effect-free.

## Methods

### resolve()

> **resolve**(`route`): `FlagEvaluationContext` \| `undefined`

Resolves the evaluation context for a route.

#### Parameters

##### route

[`Route`](#)

The route being gated.

#### Returns

`FlagEvaluationContext` \| `undefined`

The context, or `undefined` for no targeting (percentage
  rollouts stay closed for untargeted requests).
