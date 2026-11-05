[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [configure-argument-resolvers](../README.md) / createBrowserArgumentResolvers

# Function: createBrowserArgumentResolvers()

> **createBrowserArgumentResolvers**(): `HandlerMethodArgumentResolver`[]

Builds the browser argument-resolver list in registration order (first
match wins). Single source of truth shared by
[configureBrowserArgumentResolvers](configureBrowserArgumentResolvers.md) and the auto-configuration entry,
so the two lists can never drift (HG-7).

## Returns

`HandlerMethodArgumentResolver`[]
