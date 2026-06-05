[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / configureStrictBrowserArgumentResolvers

# Function: configureStrictBrowserArgumentResolvers()

> **configureStrictBrowserArgumentResolvers**(`applicationContext`, `options?`): `HandlerMethodArgumentResolver`[]

Defined in: packages/blue-platform-web/src/configure-strict-argument-resolvers.ts:26

Registers browser argument resolvers with strict named converter lookup enabled.

## Parameters

### applicationContext

`ApplicationContext`

The application context to configure.

### options?

[`StrictBrowserArgumentResolverOptions`](../type-aliases/StrictBrowserArgumentResolverOptions.md) = `{}`

Resolver overrides and optional registry registration.

## Returns

`HandlerMethodArgumentResolver`[]

The resolver instances registered with the context.
