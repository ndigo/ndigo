[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / ClientAddressFlagContextResolver

# Class: ClientAddressFlagContextResolver

The client-address resolver: targeting key = the `NodeRequest`'s
`remoteAddress` — the AD-37 trusted-proxy-resolved client IP, the same
key the rate limiter uses. An absent address yields no context.

## Implements

- [`FlagEvaluationContextResolver`](../interfaces/FlagEvaluationContextResolver.md)

## Constructors

### Constructor

> **new ClientAddressFlagContextResolver**(): `ClientAddressFlagContextResolver`

#### Returns

`ClientAddressFlagContextResolver`

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

#### Implementation of

[`FlagEvaluationContextResolver`](../interfaces/FlagEvaluationContextResolver.md).[`resolve`](../interfaces/FlagEvaluationContextResolver.md#resolve)
