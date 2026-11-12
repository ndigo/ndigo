[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-auto-configuration](../README.md) / NodeAutoConfiguration

# Class: NodeAutoConfiguration

Auto-configuration for Node.js-based applications.
Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.

Register this configuration class with your `ApplicationContext` alongside
NodeEnvironment to enable full server-side request handling.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new NodeAutoConfiguration**(): `NodeAutoConfiguration`

#### Returns

`NodeAutoConfiguration`

#### Inherited from

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

The owning application context (container-injected, AD-82 wiring).

## Methods

### argumentResolvers()

> **argumentResolvers**(): `HandlerMethodArgumentResolver`[]

Creates the Node.js argument resolvers used for request binding.

#### Returns

`HandlerMethodArgumentResolver`[]

The Node.js argument resolvers.

***

### argumentValueConverterRegistry()

> **argumentValueConverterRegistry**(): `Record`\<`string`, [`ArgumentValueConverter`](../../index/type-aliases/ArgumentValueConverter.md)\>

Exposes the shared argument-value converter registry.

#### Returns

`Record`\<`string`, [`ArgumentValueConverter`](../../index/type-aliases/ArgumentValueConverter.md)\>

The Node.js argument-value converter registry.

***

### cacheManager()

> **cacheManager**(): `CacheManager`

The shared named-cache manager for `@cached` methods (AD-24):
`@cached` resolves the manager off the method's `this.cacheManager`
(constructor or aware-injection) — zero wiring for Node apps, mirror
of the scheduler entries above.

#### Returns

`CacheManager`

The cache manager.

***

### conversionService()

> **conversionService**(): `ConversionService`

The shared conversion service (AD-38): leaf conversions (string ↔
typed) and schema-driven DTO projection (`convert(value, schema)`)
in one entry — zero wiring for Node apps, mirror of the cache manager
entries above. Apps with custom converter registries override the entry
with their own `createConversionService`.

#### Returns

`ConversionService`

The conversion service.

***

### corsOptions()

> **corsOptions**(): [`CORSInterceptorOptions`](../../cors-interceptor/interfaces/CORSInterceptorOptions.md)

CORS policy bound to the `cors.*` environment namespace, read once at
registration time. Fail-closed by default (empty `allowedOrigins`): no
cross-origin request is permitted until an app sets `cors.allowedOrigins`,
so the always-registered [CORSInterceptor](../../cors-interceptor/classes/CORSInterceptor.md) blocks by default and
apps opt in explicitly. Mirrors how `flagEvaluator()`/`rateLimiter()` bind
their namespaces from the application environment.

#### Returns

[`CORSInterceptorOptions`](../../cors-interceptor/interfaces/CORSInterceptorOptions.md)

options for the auto-registered [CORSInterceptor](../../cors-interceptor/classes/CORSInterceptor.md).

***

### dispatcher()

> **dispatcher**(): [`NodeDispatcher`](../../node-dispatcher/classes/NodeDispatcher.md)

Creates the Node dispatcher used for server-side request dispatch and rendering.

#### Returns

[`NodeDispatcher`](../../node-dispatcher/classes/NodeDispatcher.md)

The Node dispatcher.

***

### errorResolvers()

> **errorResolvers**(): ([`NodeLastResortErrorResolver`](../../last-resort-error-resolver/classes/NodeLastResortErrorResolver.md) \| [`NodeParameterBindingErrorResolver`](../../parameter-binding-error-resolver/classes/NodeParameterBindingErrorResolver.md) \| `MetadataErrorResolver`)[]

Creates the default Node error-resolver chain: request-binding failures
(missing params, failed conversions, Zod validation) map to 400, then
user-configured `@errorMapping` handlers win.

#### Returns

([`NodeLastResortErrorResolver`](../../last-resort-error-resolver/classes/NodeLastResortErrorResolver.md) \| [`NodeParameterBindingErrorResolver`](../../parameter-binding-error-resolver/classes/NodeParameterBindingErrorResolver.md) \| `MetadataErrorResolver`)[]

The error resolvers.

***

### featureGateInterceptor()

> **featureGateInterceptor**(): [`FeatureGateInterceptor`](../../feature-gate-interceptor/classes/FeatureGateInterceptor.md)

The feature-gate interceptor — **one instance**, registered as an
entry so the aware processor injects the application context
(`HTTPServer` precedent): the interceptor resolves the
`FLAG_EVALUATOR`/`FLAG_CONTEXT_RESOLVER` entries per check, and the
mapping holds that same injected instance.

#### Returns

[`FeatureGateInterceptor`](../../feature-gate-interceptor/classes/FeatureGateInterceptor.md)

The shared [FeatureGateInterceptor](../../feature-gate-interceptor/classes/FeatureGateInterceptor.md).

***

### flagContextResolver()

> **flagContextResolver**(): [`FlagEvaluationContextResolver`](../../flag-context-resolver/interfaces/FlagEvaluationContextResolver.md)

The default flag targeting-context resolver (AD-87 companion): the
session-bag principal when a session/identity interceptor ran first
(targeting key = principal id, roles as attributes), else the AD-37
client address. Apps override this entry for tenant/attribute
targeting.

#### Returns

[`FlagEvaluationContextResolver`](../../flag-context-resolver/interfaces/FlagEvaluationContextResolver.md)

The principal-first, address-fallback resolver.

***

### flagEvaluator()

> **flagEvaluator**(): `FlagEvaluator`

The default flag evaluator (AD-82): reads `feature.*` properties
from the application environment, **live on every evaluation** — an
`environment.refresh()` (AD-29) flips flags without a redeploy.
Apps needing vendor flagging (flagd / OFREP / LaunchDarkly via the
`@ndigo/flags-openfeature` bridge) provide their own `FlagEvaluator`
entry; this is the zero-config default. The gate resolves the entry
per check (AD-87), so an override reaches `@whenFeature` routes too.

#### Returns

`FlagEvaluator`

The property-backed flag evaluator.

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

> **httpServer**(): [`HTTPServer`](../../http-server/classes/HTTPServer.md)

Creates the managed HTTP server used for server-side request handling.

The server resolves the [NodeDispatcher](../../node-dispatcher/classes/NodeDispatcher.md) from the application
context when it starts, so no dispatcher is passed here. Start it
explicitly after `refresh()`: `await context.getValue('httpServer').start()`.
The context stops it when closed.

#### Returns

[`HTTPServer`](../../http-server/classes/HTTPServer.md)

The managed HTTP server.

***

### jobDriver()

> **jobDriver**(): `InProcessJobDriver`

The default job driver (AD-72): in-process and **not durable** — jobs
vanish with the process. Apps register their own `JobDriver` entry
(`LibSQLJobStore`, `RedisJobDriver`) for work that must survive a
restart; the queue, registry and runner follow whichever driver entry is
registered here.

#### Returns

`InProcessJobDriver`

The default in-process job driver.

***

### jobHandlerRegistry()

> **jobHandlerRegistry**(): `JobHandlerRegistry`

Discovers `@jobHandler` methods on registered entries and holds the
registrations. Scans on refresh (`SmartLifecycle`, phase 0); arms no
timer.

#### Returns

`JobHandlerRegistry`

The job handler registry.

***

### jobQueue()

> **jobQueue**(): `JobQueue`

The producer-facing job queue (AD-72): resolves the `jobDriver` entry
through the injected context at first use.

#### Returns

`JobQueue`

The job queue facade.

***

### jobRunner()

> **jobRunner**(): `JobRunner`

The worker engine (AD-72). It is **not** refresh-started: a pending poll
timer keeps the process alive, so worker processes call `start()` after
boot (the `HTTPServer` precedent); API-only processes leave it stopped.
Pass `autoStart: true` for refresh-driven start.

#### Returns

`JobRunner`

The job runner.

***

### languageResolver()

> **languageResolver**(): `AcceptHeaderLanguageResolver`

Resolves the request language from the `Accept-Language` header.

#### Returns

`AcceptHeaderLanguageResolver`

The accept-header language resolver.

***

### lockDriver()

> **lockDriver**(): [`LockDriver`](#)

The default lock driver (AD-73): in-process and **single-node** — the
process-wide lease table gives `@scheduled({ lock })` tasks exactly
one holder per process. Apps that run multiple nodes register their
own `LockDriver` entry (`RedisLockDriver`) for cross-process
coordination; the task scheduler resolves whichever entry is
registered here.

#### Returns

[`LockDriver`](#)

The default in-process lock driver.

***

### rateLimiter()

> **rateLimiter**(): [`RateLimiter`](#)

The shared in-memory rate limiter (SEC-6). Apps needing a
distributed backend provide their own [RateLimiter](#)
implementation (the `@ndigo/redis/rate-limit` driver is the
shared-store option, AD-79); the entry is the default.

#### Returns

[`RateLimiter`](#)

The default fixed-window rate limiter.

***

### scheduleRegistry()

> **scheduleRegistry**(): `ScheduleRegistry`

Discovers `@scheduled` methods on registered entries and runs them on
the task scheduler. Auto-started on refresh (SmartLifecycle) and torn
down with the context — zero wiring for Node apps (AD-20 D2).

#### Returns

`ScheduleRegistry`

The schedule registry.

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`

***

### socketSessionRegistry()

> **socketSessionRegistry**(): [`NodeSocketSessionRegistry`](../../node-socket-session-registry/classes/NodeSocketSessionRegistry.md)

Tracks open WebSocket sessions — broadcast, rooms, heartbeat (AD-21).

The HTTP server resolves this entry when it starts, so broadcasts from
any service reach the adapter's live sessions. Heartbeat defaults to
on; tune via `NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS` /
`NDIGO_SOCKET_IDLE_TIMEOUT_MS` (heartbeat `0` disables it).

#### Returns

[`NodeSocketSessionRegistry`](../../node-socket-session-registry/classes/NodeSocketSessionRegistry.md)

The socket session registry.

***

### taskScheduler()

> **taskScheduler**(): `TaskScheduler`

The shared task scheduler for `@scheduled` methods (AD-20). The
registry entry discovers and starts scheduled tasks on refresh.

#### Returns

`TaskScheduler`

The task scheduler.

***

### viewResolver()

> **viewResolver**(): `IslandViewResolver`

Provides the default view resolver for server-side rendering:
island markers (server-rendered pairs of the client web components).

The default resolver claims only valid custom-element tag names
(`hyphenated-lowercase`), not every view name — an app that renders
ordinary named views adds its own resolver (e.g. EJS) to the chain.

#### Returns

`IslandViewResolver`

The island view resolver.
