[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / configureBrowserArgumentResolvers

# Function: configureBrowserArgumentResolvers()

> **configureBrowserArgumentResolvers**(`applicationContext`, `options?`): `HandlerMethodArgumentResolver`[]

Defined in: packages/blue-platform-web/src/configure-argument-resolvers.ts:38

Registers browser-specific argument resolvers into the application context.

## Parameters

### applicationContext

`ApplicationContext`

The application context to configure.

### options?

[`BrowserArgumentResolverOptions`](../type-aliases/BrowserArgumentResolverOptions.md) = `{}`

Resolver and converter overrides.

## Returns

`HandlerMethodArgumentResolver`[]

The resolver instances registered with the context.
