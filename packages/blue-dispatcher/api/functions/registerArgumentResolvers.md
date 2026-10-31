[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / registerArgumentResolvers

# Function: registerArgumentResolvers()

> **registerArgumentResolvers**(`applicationContext`, `resolvers`): [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

Registers a collection of argument resolvers into the application context
under the [ARGUMENT\_RESOLVERS](../variables/ARGUMENT_RESOLVERS.md) token and returns them.

Shared by the platform configuration functions
(`configureNodeArgumentResolvers`, `configureBrowserArgumentResolvers`) so
resolver registration behaves identically across platforms.

## Parameters

### applicationContext

`ApplicationContext`

The application context to register into.

### resolvers

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

The argument resolvers to register, in priority order.

## Returns

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)[]

The registered resolvers.
