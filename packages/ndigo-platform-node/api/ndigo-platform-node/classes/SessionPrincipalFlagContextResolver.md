[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / SessionPrincipalFlagContextResolver

# Class: SessionPrincipalFlagContextResolver

The platform default (`FLAG_CONTEXT_RESOLVER`): the **session principal**
when one is present, otherwise [ClientAddressFlagContextResolver](ClientAddressFlagContextResolver.md).

The principal is read from `NodeRequest.session['principal']` — the bag
a session/identity interceptor fills before dispatch — so it is visible
only when that interceptor runs **before** the feature gate. Pipelines
that restore sessions after the platform's gate simply keep address
targeting; apps that want principal targeting move their session
interceptor ahead of the gate or register their own resolver.

Targeting key = `principal.id`: a stable identity is a better rollout
bucket than the network address. Attributes carry the principal's roles
for provider targeting.

## Implements

- [`FlagEvaluationContextResolver`](../interfaces/FlagEvaluationContextResolver.md)

## Constructors

### Constructor

> **new SessionPrincipalFlagContextResolver**(`fallback?`): `SessionPrincipalFlagContextResolver`

#### Parameters

##### fallback?

[`FlagEvaluationContextResolver`](../interfaces/FlagEvaluationContextResolver.md) = `...`

The resolver used when no principal is available
  (default: [ClientAddressFlagContextResolver](ClientAddressFlagContextResolver.md)).

#### Returns

`SessionPrincipalFlagContextResolver`

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
