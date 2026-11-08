[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [configure-argument-resolvers](../README.md) / createNodeArgumentResolvers

# Function: createNodeArgumentResolvers()

> **createNodeArgumentResolvers**(): `HandlerMethodArgumentResolver`[]

Builds the Node.js argument-resolver list in registration order (first
match wins). Single source of truth shared by
[configureNodeArgumentResolvers](configureNodeArgumentResolvers.md) and the auto-configuration entry, so
the two lists can never drift (HG-7).

## Returns

`HandlerMethodArgumentResolver`[]

The Node argument resolvers, in registration order.
