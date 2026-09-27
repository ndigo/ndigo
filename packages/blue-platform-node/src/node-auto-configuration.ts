/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry } from '@blue/context';
import { conditionalOnNode } from '@blue/core';
import { MemoryCacheManager } from '@blue/cache';
import type { CacheManager } from '@blue/cache';
import { AcceptHeaderLanguageResolver, RadixMetadataHandlerMapping, MetadataErrorResolver } from '@blue/dispatcher';
import { ScheduleRegistry, TaskScheduler } from '@blue/scheduler';
import { IslandViewResolver } from '@blue/view';
import { NodeDispatcher } from './node-dispatcher';
import { HTTPServer } from './http-server';
import { NodeSocketSessionRegistry, resolveSocketRegistryOptions } from './node-socket-session-registry';
import { SecurityHeadersInterceptor } from './security-headers-interceptor';
import { NodeParameterBindingErrorResolver } from './parameter-binding-error-resolver';
import { NodeLastResortErrorResolver } from './last-resort-error-resolver';
import { argumentValueConverters } from './_resolver-util';
import { NodeQueryValueMethodArgumentResolver } from './query-argument-resolver';
import { NodePathValueMethodArgumentResolver } from './path-argument-resolver';
import { NodeHeaderValueMethodArgumentResolver } from './header-argument-resolver';
import { NodeBodyValueMethodArgumentResolver } from './body-argument-resolver';
import { NodeDataBindingMethodArgumentResolver } from './data-binding-argument-resolver';
import { NodeRequestPartMethodArgumentResolver } from './request-part-argument-resolver';
import { NodeMultipartFileMethodArgumentResolver } from './multipart-file-argument-resolver';
import { NodeCookieValueMethodArgumentResolver } from './cookie-argument-resolver';
import { NodeRequestSessionValueMethodArgumentResolver } from './request-session-argument-resolver';
import { FixedWindowRateLimiter } from './rate-limit';
import type { RateLimiter } from './rate-limit';
import { RateLimitInterceptor } from './rate-limit-interceptor';

/**
 * Auto-configuration for Node.js-based applications.
 * Provisions Node.js argument resolvers, a dispatcher, and an HTTP server.
 *
 * Register this configuration class with your `ApplicationContext` alongside
 * NodeEnvironment to enable full server-side request handling.
 */
@conditionalOnNode
@configuration
export class NodeAutoConfiguration {
    /**
     * Exposes the shared argument-value converter registry.
     *
     * @returns The Node.js argument-value converter registry.
     */
    @entry
    argumentValueConverterRegistry() {
        return argumentValueConverters;
    }

    /**
     * Creates the Node.js argument resolvers used for request binding.
     *
     * @returns The Node.js argument resolvers.
     */
    @entry
    argumentResolvers() {
        return [
            new NodeQueryValueMethodArgumentResolver(),
            new NodePathValueMethodArgumentResolver(),
            new NodeHeaderValueMethodArgumentResolver(),
            new NodeBodyValueMethodArgumentResolver(),
            new NodeDataBindingMethodArgumentResolver(),
            new NodeRequestPartMethodArgumentResolver(),
            new NodeMultipartFileMethodArgumentResolver(),
            new NodeCookieValueMethodArgumentResolver(),
            new NodeRequestSessionValueMethodArgumentResolver(),
        ];
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
    @entry
    handlerMapping() {
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.unshift(new SecurityHeadersInterceptor());
        mapping.interceptors.push(new RateLimitInterceptor(this.rateLimiter()));
        return mapping;
    }

    /**
     * The shared in-memory rate limiter (SEC-6). Apps needing a
     * distributed backend provide their own {@link RateLimiter}
     * implementation; the bean is the default.
     *
     * @returns The default fixed-window rate limiter.
     */
    @entry
    rateLimiter(): RateLimiter {
        return new FixedWindowRateLimiter();
    }

    /**
     * Creates the Node dispatcher used for server-side request dispatch and rendering.
     *
     * @returns The Node dispatcher.
     */
    @entry
    dispatcher() {
        return new NodeDispatcher();
    }

    /**
     * Resolves the request language from the `Accept-Language` header.
     *
     * @returns The accept-header language resolver.
     */
    @entry
    languageResolver() {
        return new AcceptHeaderLanguageResolver('en-US');
    }

    /**
     * The shared task scheduler for `@scheduled` methods (AD-20). The
     * registry bean discovers and starts scheduled tasks on refresh.
     *
     * @returns The task scheduler.
     */
    @entry
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
    @entry
    scheduleRegistry() {
        return new ScheduleRegistry();
    }

    /**
     * The shared named-cache manager for `@cached` methods (AD-24):
     * `@cached` resolves the manager off the method's `this.cacheManager`
     * (constructor or aware-injection) — zero wiring for Node apps, mirror
     * of the scheduler beans above.
     *
     * @returns The cache manager.
     */
    @entry
    cacheManager(): CacheManager {
        return new MemoryCacheManager();
    }

    /**
     * Tracks open WebSocket sessions — broadcast, rooms, heartbeat (AD-21).
     *
     * The HTTP server resolves this bean when it starts, so broadcasts from
     * any service reach the adapter's live sessions. Heartbeat defaults to
     * on; tune via `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS` /
     * `BLUE_SOCKET_IDLE_TIMEOUT_MS` (heartbeat `0` disables it).
     *
     * @returns The socket session registry.
     */
    @entry
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
    @entry
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
    @entry
    httpServer(): HTTPServer {
        return new HTTPServer();
    }

    /**
     * Provides the default view resolver for server-side rendering:
     * island markers (server-rendered pairs of the client web components).
     *
     * @returns The island view resolver.
     */
    @entry
    viewResolver() {
        return new IslandViewResolver();
    }
}
