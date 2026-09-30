[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README-1.md) / NodeAutoConfiguration

# Class: NodeAutoConfiguration

Auto-configuration for Node.js-based applications.
Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.

Register this configuration class with your `ApplicationContext` alongside
NodeEnvironment to enable full server-side request handling.

## Constructors

### Constructor

> **new NodeAutoConfiguration**(): `NodeAutoConfiguration`

#### Returns

`NodeAutoConfiguration`

## Methods

### argumentResolvers()

> **argumentResolvers**(): ([`NodeQueryValueMethodArgumentResolver`](NodeQueryValueMethodArgumentResolver.md) \| [`NodePathValueMethodArgumentResolver`](NodePathValueMethodArgumentResolver.md) \| [`NodeHeaderValueMethodArgumentResolver`](NodeHeaderValueMethodArgumentResolver.md) \| [`NodeBodyValueMethodArgumentResolver`](NodeBodyValueMethodArgumentResolver.md) \| [`NodeDataBindingMethodArgumentResolver`](NodeDataBindingMethodArgumentResolver.md) \| [`NodeRequestPartMethodArgumentResolver`](NodeRequestPartMethodArgumentResolver.md) \| [`NodeMultipartFileMethodArgumentResolver`](#) \| [`NodeCookieValueMethodArgumentResolver`](NodeCookieValueMethodArgumentResolver.md) \| [`NodeRequestSessionValueMethodArgumentResolver`](NodeRequestSessionValueMethodArgumentResolver.md))[]

Creates the Node.js argument resolvers used for request binding.

#### Returns

([`NodeQueryValueMethodArgumentResolver`](NodeQueryValueMethodArgumentResolver.md) \| [`NodePathValueMethodArgumentResolver`](NodePathValueMethodArgumentResolver.md) \| [`NodeHeaderValueMethodArgumentResolver`](NodeHeaderValueMethodArgumentResolver.md) \| [`NodeBodyValueMethodArgumentResolver`](NodeBodyValueMethodArgumentResolver.md) \| [`NodeDataBindingMethodArgumentResolver`](NodeDataBindingMethodArgumentResolver.md) \| [`NodeRequestPartMethodArgumentResolver`](NodeRequestPartMethodArgumentResolver.md) \| [`NodeMultipartFileMethodArgumentResolver`](#) \| [`NodeCookieValueMethodArgumentResolver`](NodeCookieValueMethodArgumentResolver.md) \| [`NodeRequestSessionValueMethodArgumentResolver`](NodeRequestSessionValueMethodArgumentResolver.md))[]

The Node.js argument resolvers.

***

### argumentValueConverterRegistry()

> **argumentValueConverterRegistry**(): `Record`\<`string`, [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)\>

Exposes the shared argument-value converter registry.

#### Returns

`Record`\<`string`, [`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md)\>

The Node.js argument-value converter registry.

***

### cacheManager()

> **cacheManager**(): `CacheManager`

The shared named-cache manager for `@cached` methods (AD-24):
`@cached` resolves the manager off the method's `this.cacheManager`
(constructor or aware-injection) — zero wiring for Node apps, mirror
of the scheduler beans above.

#### Returns

`CacheManager`

The cache manager.

***

### conversionService()

> **conversionService**(): `ConversionService`

The shared conversion service (AD-38): leaf conversions (string ↔
typed) and schema-driven DTO projection (`convert(value, schema)`)
in one bean — zero wiring for Node apps, mirror of the cache manager
beans above. Apps with custom converter registries override the bean
with their own `createConversionService`.

#### Returns

`ConversionService`

The conversion service.

***

### dispatcher()

> **dispatcher**(): [`NodeDispatcher`](NodeDispatcher.md)

Creates the Node dispatcher used for server-side request dispatch and rendering.

#### Returns

[`NodeDispatcher`](NodeDispatcher.md)

The Node dispatcher.

***

### errorResolvers()

> **errorResolvers**(): ([`NodeParameterBindingErrorResolver`](NodeParameterBindingErrorResolver.md) \| `MetadataErrorResolver` \| [`NodeLastResortErrorResolver`](NodeLastResortErrorResolver.md))[]

Creates the default Node error-resolver chain: request-binding failures
(missing params, failed conversions, Zod validation) map to 400, then
user-configured `@errorMapping` handlers win.

#### Returns

([`NodeParameterBindingErrorResolver`](NodeParameterBindingErrorResolver.md) \| `MetadataErrorResolver` \| [`NodeLastResortErrorResolver`](NodeLastResortErrorResolver.md))[]

The error resolvers.

***

### handlerMapping()

> **handlerMapping**(): `RadixMetadataHandlerMapping`

Provides the default handler mapping for Node.js request dispatch.

Security headers and the (metadata-gated) rate-limit interceptor are
default-on; routes declare opt-in budgets with `@rateLimit` (SEC-6,
Wave 3) — routes without metadata are untouched.

#### Returns

`RadixMetadataHandlerMapping`

The default metadata-driven handler mapping.

***

### httpServer()

> **httpServer**(): [`HTTPServer`](HTTPServer.md)

Creates the managed HTTP server used for server-side request handling.

The server resolves the [NodeDispatcher](NodeDispatcher.md) from the application
context when it starts, so no dispatcher is passed here. Start it
explicitly after `refresh()`: `await context.getValue('httpServer').start()`.
The context stops it when closed.

#### Returns

[`HTTPServer`](HTTPServer.md)

The managed HTTP server.

***

### languageResolver()

> **languageResolver**(): `AcceptHeaderLanguageResolver`

Resolves the request language from the `Accept-Language` header.

#### Returns

`AcceptHeaderLanguageResolver`

The accept-header language resolver.

***

### rateLimiter()

> **rateLimiter**(): [`RateLimiter`](../interfaces/RateLimiter.md)

The shared in-memory rate limiter (SEC-6). Apps needing a
distributed backend provide their own [RateLimiter](../interfaces/RateLimiter.md)
implementation; the bean is the default.

#### Returns

[`RateLimiter`](../interfaces/RateLimiter.md)

The default fixed-window rate limiter.

***

### scheduleRegistry()

> **scheduleRegistry**(): `ScheduleRegistry`

Discovers `@scheduled` methods on registered beans and runs them on
the task scheduler. Auto-started on refresh (SmartLifecycle) and torn
down with the context — zero wiring for Node apps (AD-20 D2).

#### Returns

`ScheduleRegistry`

The schedule registry.

***

### socketSessionRegistry()

> **socketSessionRegistry**(): [`NodeSocketSessionRegistry`](NodeSocketSessionRegistry.md)

Tracks open WebSocket sessions — broadcast, rooms, heartbeat (AD-21).

The HTTP server resolves this bean when it starts, so broadcasts from
any service reach the adapter's live sessions. Heartbeat defaults to
on; tune via `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS` /
`BLUE_SOCKET_IDLE_TIMEOUT_MS` (heartbeat `0` disables it).

#### Returns

[`NodeSocketSessionRegistry`](NodeSocketSessionRegistry.md)

The socket session registry.

***

### taskScheduler()

> **taskScheduler**(): `TaskScheduler`

The shared task scheduler for `@scheduled` methods (AD-20). The
registry bean discovers and starts scheduled tasks on refresh.

#### Returns

`TaskScheduler`

The task scheduler.

***

### viewResolver()

> **viewResolver**(): `IslandViewResolver`

Provides the default view resolver for server-side rendering:
island markers (server-rendered pairs of the client web components).

#### Returns

`IslandViewResolver`

The island view resolver.
