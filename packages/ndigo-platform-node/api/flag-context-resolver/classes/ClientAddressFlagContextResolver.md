[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [flag-context-resolver](../README.md) / ClientAddressFlagContextResolver

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

Resolves the flag context from the trusted client address.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`FlagEvaluationContext` \| `undefined`

The evaluation context, or `undefined`.

#### Implementation of

[`FlagEvaluationContextResolver`](../interfaces/FlagEvaluationContextResolver.md).[`resolve`](../interfaces/FlagEvaluationContextResolver.md#resolve)
