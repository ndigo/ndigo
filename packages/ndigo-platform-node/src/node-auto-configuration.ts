/**
 * Auto-configuration for the Node platform.
 */
import { configuration, entry } from '@ndigo/context';
import { whenNode, createConversionService, type ConversionService } from '@ndigo/core';
import { CACHE_MANAGER, MemoryCacheManager, type CacheManager } from '@ndigo/cache';
import { DISPATCHER, AcceptHeaderLanguageResolver, AttributeThemeResolver } from '@ndigo/dispatcher';
import { ScheduleRegistry, TaskScheduler } from '@ndigo/scheduler';
import { InProcessLockDriver, LOCK_DRIVER, type LockDriver } from '@ndigo/locks';
import { HTTP, HTTP_CLIENT } from '@ndigo/http';
import {
    JOB_DRIVER,
    JOB_HANDLER_REGISTRY,
    JOB_QUEUE,
    JOB_RUNNER,
    InProcessJobDriver,
    JobHandlerRegistry,
    JobQueue,
    JobRunner,
} from '@ndigo/jobs';
import { IslandViewResolver } from '@ndigo/view';
import { NodeDispatcher } from './node-dispatcher.js';
import { ResponseViewTargeter } from './response-view-targeter.js';
import { HTTPServer } from './http-server.js';
import { readIntEnv } from './read-int-env.js';
import { NodeSocketSessionRegistry, resolveSocketRegistryOptions } from './node-socket-session-registry.js';
import { CONVERSION_SERVICE, HTTP_SERVER, SOCKET_SESSION_REGISTRY } from './context-tokens.js';
import { NodeAutoConfigurationBase } from './_node-auto-configuration-base.js';
import { configuredPort } from './_configured-port.js';

/**
 * Auto-configuration for Node.js-based applications.
 * Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.
 *
 * Register this configuration class with your `ApplicationContext` alongside
 * NodeEnvironment to enable full server-side request handling.
 */
@whenNode
@configuration
export class NodeAutoConfiguration extends NodeAutoConfigurationBase {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NodeAutoConfiguration".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NodeAutoConfiguration]"
     */
    get [Symbol.toStringTag](): string {
        return 'NodeAutoConfiguration';
    }

    /**
     * Creates the Node dispatcher used for server-side request dispatch and rendering.
     *
     * @returns The Node dispatcher.
     */
    @entry(DISPATCHER)
    dispatcher() {
        return new NodeDispatcher();
    }

    /**
     * Resolves the request language from the `Accept-Language` header.
     *
     * @returns The accept-header language resolver.
     */
    @entry()
    languageResolver() {
        return new AcceptHeaderLanguageResolver('en-US');
    }

    /**
     * Resolves the request theme from the `theme` cookie stamped on the route
     * by the HTTP adapter. Server rendering has no system-preference input, so
     * an absent or invalid cookie selects the Ndigo default.
     *
     * Can be overridden by registering a custom `configuration` with a
     * themeResolver entry.
     *
     * @returns The attribute-backed theme resolver.
     */
    @entry()
    themeResolver() {
        return new AttributeThemeResolver('ndigo-dark');
    }

    /**
     * The shared task scheduler for `@scheduled` methods. The
     * registry entry discovers and starts scheduled tasks on refresh.
     *
     * @returns The task scheduler.
     */
    @entry()
    taskScheduler() {
        return new TaskScheduler();
    }

    /**
     * Discovers `@scheduled` methods on registered entries and runs them on
     * the task scheduler. Auto-started on refresh (ManagedLifecycle) and torn
     * down with the context — zero wiring for Node apps.
     *
     * @returns The schedule registry.
     */
    @entry()
    scheduleRegistry() {
        return new ScheduleRegistry();
    }

    /**
     * The default job driver: in-process and **not durable** — jobs
     * vanish with the process. Apps register their own `JobDriver` entry
     * (`LibSQLJobStore`, `RedisJobDriver`) for work that must survive a
     * restart; the queue, registry and runner follow whichever driver entry is
     * registered here.
     *
     * @returns The default in-process job driver.
     */
    @entry(JOB_DRIVER)
    jobDriver() {
        return new InProcessJobDriver();
    }

    /**
     * The producer-facing job queue: resolves the `jobDriver` entry
     * through the injected context at first use.
     *
     * @returns The job queue facade.
     */
    @entry(JOB_QUEUE)
    jobQueue() {
        return new JobQueue();
    }

    /**
     * Discovers `@jobHandler` methods on registered entries and holds the
     * registrations. Scans on refresh (`ManagedLifecycle`, phase 0); arms no
     * timer.
     *
     * @returns The job handler registry.
     */
    @entry(JOB_HANDLER_REGISTRY)
    jobHandlerRegistry() {
        return new JobHandlerRegistry();
    }

    /**
     * The worker engine. It is **not** refresh-started: a pending poll
     * timer keeps the process alive, so worker processes call `start()` after
     * boot (the `HTTPServer` precedent); API-only processes leave it stopped.
     * Pass `autoStart: true` for refresh-driven start.
     *
     * @returns The job runner.
     */
    @entry(JOB_RUNNER)
    jobRunner() {
        return new JobRunner();
    }

    /**
     * The default lock driver: in-process and **single-node** — the
     * process-wide lease table gives `@scheduled({ lock })` tasks exactly
     * one holder per process. Apps that run multiple nodes register their
     * own `LockDriver` entry (`RedisLockDriver`) for cross-process
     * coordination; the task scheduler resolves whichever entry is
     * registered here.
     *
     * @returns The default in-process lock driver.
     */
    @entry(LOCK_DRIVER)
    lockDriver(): LockDriver {
        return new InProcessLockDriver();
    }

    /**
     * The shared named-cache manager for `@cached` methods. `CachedInterceptor`
     * resolves it off the advised instance's `this.cacheManager` (constructor
     * or aware-injection), so a Node app provisions the store here and only
     * has to register the rule — mirror of the scheduler entries above.
     *
     * @returns The cache manager.
     */
    @entry(CACHE_MANAGER)
    cacheManager(): CacheManager {
        return new MemoryCacheManager();
    }

    /**
     * The shared conversion service: leaf conversions (string ↔
     * typed) and schema-driven DTO projection (`convert(value, schema)`)
     * in one entry — zero wiring for Node apps, mirror of the cache manager
     * entries above. Apps with custom converter registries override the entry
     * with their own `createConversionService`.
     *
     * @returns The conversion service.
     */
    @entry(CONVERSION_SERVICE)
    conversionService(): ConversionService {
        return createConversionService();
    }

    /**
     * The shared HTTP client for outbound calls.
     *
     * @returns The HTTP client.
     */
    @entry(HTTP_CLIENT)
    httpClient(): HTTP {
        return HTTP.create();
    }

    /**
     * Tracks open WebSocket sessions — broadcast, rooms, heartbeat.
     *
     * The HTTP server resolves this entry when it starts, so broadcasts from
     * any service reach the adapter's live sessions. Heartbeat defaults to
     * on; tune via `NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS` /
     * `NDIGO_SOCKET_IDLE_TIMEOUT_MS` (heartbeat `0` disables it).
     *
     * @returns The socket session registry.
     */
    @entry(SOCKET_SESSION_REGISTRY)
    socketSessionRegistry() {
        return new NodeSocketSessionRegistry(resolveSocketRegistryOptions());
    }

    /**
     * Creates the managed HTTP server used for server-side request handling.
     *
     * The server resolves the {@link NodeDispatcher} from the application
     * context when it starts, so no dispatcher is passed here. Start it
     * explicitly after `refresh()`: `await context.getValue('httpServer').start()`.
     * The context stops it when closed.
     *
     * @returns The managed HTTP server.
     */
    @entry(HTTP_SERVER)
    httpServer(): HTTPServer {
        const port =
            readIntEnv(process.env, 'PORT', { allowZero: true }) ??
            configuredPort(this.applicationContext?.environment?.getProperty('server.port'));
        return new HTTPServer(null, { port });
    }

    /**
     * Provides the default view resolver for server-side rendering:
     * island markers (server-rendered pairs of the client web components).
     *
     * The default resolver claims only valid custom-element tag names
     * (`hyphenated-lowercase`), not every view name — an app that renders
     * ordinary named views adds its own resolver (e.g. EJS) to the chain.
     *
     * @returns The island view resolver.
     */
    @entry()
    viewResolver() {
        return new IslandViewResolver();
    }

    /**
     * The Node render destination: one HTTP response target per render pass.
     *
     * Registered as the platform's default chain entry so the shared
     * dispatcher pipeline writes exactly where the pre-targeter dispatcher
     * wrote. A result that supplies its own target still wins.
     *
     * @returns The response view targeter.
     */
    @entry('viewTargeter')
    viewTargeter() {
        return new ResponseViewTargeter();
    }
}
