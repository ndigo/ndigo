/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry, AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { whenNode, Null, createConversionService, type ConversionService } from '@ndigo/core';
import { MemoryCacheManager } from '@ndigo/cache';
import type { CacheManager } from '@ndigo/cache';
import { CACHE_MANAGER } from '@ndigo/cache';
import { CONVERSION_SERVICE } from './context-tokens';
import {
    AcceptHeaderLanguageResolver,
    RadixMetadataHandlerMapping,
    MetadataErrorResolver,
    argumentValueConverters,
    DISPATCHER,
    ARGUMENT_RESOLVERS,
    HANDLER_MAPPING,
} from '@ndigo/dispatcher';
import { ScheduleRegistry, TaskScheduler } from '@ndigo/scheduler';
import { InProcessLockDriver, LOCK_DRIVER, type LockDriver } from '@ndigo/locks';
import {
    InProcessJobDriver,
    JOB_DRIVER,
    JOB_HANDLER_REGISTRY,
    JOB_QUEUE,
    JOB_RUNNER,
    JobHandlerRegistry,
    JobQueue,
    JobRunner,
} from '@ndigo/jobs';
import { IslandViewResolver } from '@ndigo/view';
import { NodeDispatcher } from './node-dispatcher';
import { HTTPServer } from './http-server';
import { readIntEnv } from './read-int-env';
import { NodeSocketSessionRegistry, resolveSocketRegistryOptions } from './node-socket-session-registry';
import { HTTP_SERVER, FLAG_CONTEXT_RESOLVER, SOCKET_SESSION_REGISTRY } from './context-tokens';
import { SecurityHeadersInterceptor } from './security-headers-interceptor';
import { NodeParameterBindingErrorResolver } from './parameter-binding-error-resolver';
import { NodeLastResortErrorResolver } from './last-resort-error-resolver';
import { createNodeArgumentResolvers } from './configure-argument-resolvers';
import { FixedWindowRateLimiter, RATE_LIMITER, type RateLimiter } from '@ndigo/rate-limit';
import { RateLimitInterceptor } from './rate-limit-interceptor';
import { CORSInterceptor, type CORSInterceptorOptions } from './cors-interceptor';
import { FLAG_EVALUATOR, type FlagEvaluator } from '@ndigo/flags';
import { FeatureGateInterceptor } from './feature-gate-interceptor';
import { EnvironmentFlagEvaluator } from './environment-flag-evaluator';
import { SessionPrincipalFlagContextResolver, type FlagEvaluationContextResolver } from './flag-context-resolver';

/**
 * Coerces a configured `server.port` value — a JSON number or numeric string —
 * to an integer port, returning `undefined` when absent or non-numeric so the
 * caller falls back to its own default. Range validation is deferred to
 * {@link HTTPServer}, which fails fast on an out-of-bounds value rather than
 * silently binding the wrong port.
 */
function configuredPort(value: unknown): number | undefined {
    if (value === undefined || value === null) return undefined;
    const port = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(port) ? port : undefined;
}
/**
 * Auto-configuration for Node.js-based applications.
 * Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.
 *
 * Register this configuration class with your `ApplicationContext` alongside
 * NodeEnvironment to enable full server-side request handling.
 */
@whenNode
@configuration
export class NodeAutoConfiguration extends AsApplicationContextAware(Null) {
    /** The owning application context (container-injected, AD-82 wiring). */
    readonly applicationContext!: ApplicationContext;
    /**
     * Exposes the shared argument-value converter registry.
     *
     * @returns The Node.js argument-value converter registry.
     */
    @entry()
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

    /**
     * Creates the Node.js argument resolvers used for request binding.
     *
     * @returns The Node.js argument resolvers.
     */
    @entry(ARGUMENT_RESOLVERS)
    argumentResolvers() {
        return createNodeArgumentResolvers();
    }

    /**
     * Provides the default handler mapping for Node.js request dispatch.
     *
     * Security headers and the (metadata-gated) rate-limit interceptor are
     * default-on; routes declare opt-in budgets with `@rateLimit` (SEC-6,
     * Wave 3) — routes without metadata are untouched.
     *
     * @returns The default metadata-driven handler mapping.
     */
    @entry(HANDLER_MAPPING)
    handlerMapping() {
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.unshift(new SecurityHeadersInterceptor());
        // Feature gate before rate limiting: a disabled feature is not a
        // traffic event worth charging a budget against (AD-82 D-5).
        mapping.interceptors.push(this.featureGateInterceptor());
        mapping.interceptors.push(new RateLimitInterceptor(this.rateLimiter()));
        // CORS runs last (after feature/rate-limit) and is fail-closed by
        // default: no origin is permitted until an app sets `cors.allowedOrigins`,
        // so registering it globally is inert for unconfigured apps. This closes
        // the example-apps trap where CORSInterceptor existed but was wired nowhere.
        mapping.interceptors.push(new CORSInterceptor(this.corsOptions()));
        return mapping;
    }

    /**
     * CORS policy bound to the `cors.*` environment namespace, read once at
     * registration time. Fail-closed by default (empty `allowedOrigins`): no
     * cross-origin request is permitted until an app sets `cors.allowedOrigins`,
     * so the always-registered {@link CORSInterceptor} blocks by default and
     * apps opt in explicitly. Mirrors how `flagEvaluator()`/`rateLimiter()` bind
     * their namespaces from the application environment.
     *
     * @returns options for the auto-registered {@link CORSInterceptor}.
     */
    corsOptions(): CORSInterceptorOptions {
        const raw = this.applicationContext?.environment?.getProperty('cors');
        if (!raw || typeof raw !== 'object') return {};
        const cfg = raw as Record<string, unknown>;
        const options: CORSInterceptorOptions = {};
        if (Array.isArray(cfg.allowedOrigins)) {
            options.allowedOrigins = cfg.allowedOrigins.map(String);
        }
        if (typeof cfg.allowCredentials === 'boolean') {
            options.allowCredentials = cfg.allowCredentials;
        }
        if (Array.isArray(cfg.allowedMethods)) {
            options.allowedMethods = cfg.allowedMethods.map(String);
        }
        if (Array.isArray(cfg.allowedHeaders)) {
            options.allowedHeaders = cfg.allowedHeaders.map(String);
        }
        if (Array.isArray(cfg.exposedHeaders)) {
            options.exposedHeaders = cfg.exposedHeaders.map(String);
        }
        if (typeof cfg.maxAgeSeconds === 'number') {
            options.maxAgeSeconds = cfg.maxAgeSeconds;
        }
        return options;
    }

    /**
     * The shared in-memory rate limiter (SEC-6). Apps needing a
     * distributed backend provide their own {@link RateLimiter}
     * implementation (the `@ndigo/redis/rate-limit` driver is the
     * shared-store option, AD-79); the bean is the default.
     *
     * @returns The default fixed-window rate limiter.
     */
    @entry(RATE_LIMITER)
    rateLimiter(): RateLimiter {
        return new FixedWindowRateLimiter();
    }

    /**
     * The default flag evaluator (AD-82): reads `feature.*` properties
     * from the application environment, **live on every evaluation** — an
     * `environment.refresh()` (AD-29) flips flags without a redeploy.
     * Apps needing vendor flagging (flagd / OFREP / LaunchDarkly via the
     * `@ndigo/flags-openfeature` bridge) provide their own `FlagEvaluator`
     * bean; this is the zero-config default. The gate resolves the bean
     * per check (AD-87), so an override reaches `@whenFeature` routes too.
     *
     * @returns The property-backed flag evaluator.
     */
    @entry(FLAG_EVALUATOR)
    flagEvaluator(): FlagEvaluator {
        return new EnvironmentFlagEvaluator();
    }

    /**
     * The default flag targeting-context resolver (AD-87 companion): the
     * session-bag principal when a session/identity interceptor ran first
     * (targeting key = principal id, roles as attributes), else the AD-37
     * client address. Apps override this bean for tenant/attribute
     * targeting.
     *
     * @returns The principal-first, address-fallback resolver.
     */
    @entry(FLAG_CONTEXT_RESOLVER)
    flagContextResolver(): FlagEvaluationContextResolver {
        return new SessionPrincipalFlagContextResolver();
    }

    /**
     * The feature-gate interceptor — **one instance**, registered as an
     * entry so the aware processor injects the application context
     * (`HTTPServer` precedent): the interceptor resolves the
     * `FLAG_EVALUATOR`/`FLAG_CONTEXT_RESOLVER` beans per check, and the
     * mapping holds that same injected instance.
     *
     * @returns The shared {@link FeatureGateInterceptor}.
     */
    @entry()
    featureGateInterceptor(): FeatureGateInterceptor {
        return (this.#featureGateInterceptorInstance ??= new FeatureGateInterceptor());
    }
    #featureGateInterceptorInstance: FeatureGateInterceptor | null = null;

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
     * The shared task scheduler for `@scheduled` methods (AD-20). The
     * registry bean discovers and starts scheduled tasks on refresh.
     *
     * @returns The task scheduler.
     */
    @entry()
    taskScheduler() {
        return new TaskScheduler();
    }

    /**
     * Discovers `@scheduled` methods on registered beans and runs them on
     * the task scheduler. Auto-started on refresh (SmartLifecycle) and torn
     * down with the context — zero wiring for Node apps (AD-20 D2).
     *
     * @returns The schedule registry.
     */
    @entry()
    scheduleRegistry() {
        return new ScheduleRegistry();
    }

    /**
     * The default job driver (AD-72): in-process and **not durable** — jobs
     * vanish with the process. Apps register their own `JobDriver` bean
     * (`LibSQLJobStore`, `RedisJobDriver`) for work that must survive a
     * restart; the queue, registry and runner follow whichever driver bean is
     * registered here.
     *
     * @returns The default in-process job driver.
     */
    @entry(JOB_DRIVER)
    jobDriver() {
        return new InProcessJobDriver();
    }

    /**
     * The producer-facing job queue (AD-72): resolves the `jobDriver` bean
     * through the injected context at first use.
     *
     * @returns The job queue facade.
     */
    @entry(JOB_QUEUE)
    jobQueue() {
        return new JobQueue();
    }

    /**
     * Discovers `@jobHandler` methods on registered beans and holds the
     * registrations. Scans on refresh (`SmartLifecycle`, phase 0); arms no
     * timer.
     *
     * @returns The job handler registry.
     */
    @entry(JOB_HANDLER_REGISTRY)
    jobHandlerRegistry() {
        return new JobHandlerRegistry();
    }

    /**
     * The worker engine (AD-72). It is **not** refresh-started: a pending poll
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
     * The default lock driver (AD-73): in-process and **single-node** — the
     * process-wide lease table gives `@scheduled({ lock })` tasks exactly
     * one holder per process. Apps that run multiple nodes register their
     * own `LockDriver` bean (`RedisLockDriver`) for cross-process
     * coordination; the task scheduler resolves whichever bean is
     * registered here.
     *
     * @returns The default in-process lock driver.
     */
    @entry(LOCK_DRIVER)
    lockDriver(): LockDriver {
        return new InProcessLockDriver();
    }

    /**
     * The shared named-cache manager for `@cached` methods (AD-24):
     * `@cached` resolves the manager off the method's `this.cacheManager`
     * (constructor or aware-injection) — zero wiring for Node apps, mirror
     * of the scheduler beans above.
     *
     * @returns The cache manager.
     */
    @entry(CACHE_MANAGER)
    cacheManager(): CacheManager {
        return new MemoryCacheManager();
    }

    /**
     * The shared conversion service (AD-38): leaf conversions (string ↔
     * typed) and schema-driven DTO projection (`convert(value, schema)`)
     * in one bean — zero wiring for Node apps, mirror of the cache manager
     * beans above. Apps with custom converter registries override the bean
     * with their own `createConversionService`.
     *
     * @returns The conversion service.
     */
    @entry(CONVERSION_SERVICE)
    conversionService(): ConversionService {
        return createConversionService();
    }

    /**
     * Tracks open WebSocket sessions — broadcast, rooms, heartbeat (AD-21).
     *
     * The HTTP server resolves this bean when it starts, so broadcasts from
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
     * Creates the default Node error-resolver chain: request-binding failures
     * (missing params, failed conversions, Zod validation) map to 400, then
     * user-configured `@errorMapping` handlers win.
     *
     * @returns The error resolvers.
     */
    @entry()
    errorResolvers() {
        return [
            new NodeParameterBindingErrorResolver(),
            new MetadataErrorResolver(),
            new NodeLastResortErrorResolver(),
        ];
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
}
