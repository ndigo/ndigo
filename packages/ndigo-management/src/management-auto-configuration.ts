/**
 * Auto-configuration for management endpoints.
 *
 * Registers:
 * - a shared {@link FeatureMetricAggregator} entry (consumed by any feature
 *   using `counted` / `FeatureMetricAggregator`); the same aggregator also
 *   becomes the **fallback** metric snapshot source (REV-003), so `/metrics`
 *   serves feature metrics even without a telemetry pull reader — a
 *   registered reader (prometheus exporter) always wins over the fallback
 * - a {@link HealthRegistry} with the {@link TelemetryHealthIndicator} wired
 * - the `/metrics`, `/health`, `/loggers`, `/env` and `/configprops`
 *   controllers — the last three only when the exposure model (AD-76 D-2)
 *   includes them, so nothing new is served without operator action
 *
 * Register alongside `NodeAutoConfiguration` in a Node application:
 *
 * ```ts
 * const app = new ApplicationBuilder([NodeAutoConfiguration, ManagementAutoConfiguration]);
 * ```
 *
 * The endpoints are **open by default** — on an untrusted network, pass an
 * *unconditional* guard (a token-presence / token-adapter
 * `RouteHandlerInterceptor`; metadata-driven guards like the auth-server's
 * `AuthRouteGuard` cannot protect these handlers, which carry no
 * `@authenticated`/`@authorized` metadata) to
 * `ManagementAutoConfiguration(options)` so the exposed management routes
 * require authentication, and/or firewall the management routes at the
 * network boundary.
 */
import { configuration, entry, AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { type RouteHandlerInterceptor, RadixMetadataHandlerMapping } from '@ndigo/dispatcher';
import { SecurityHeadersInterceptor } from '@ndigo/platform-node';
import {
    FeatureMetricAggregator,
    FeatureMetricAggregatorProvider,
    setFallbackMetricSnapshotProvider,
} from '@ndigo/telemetry';
import { HealthRegistry } from './health';
import { MetricsController } from './metrics-controller';
import { HealthController } from './health-controller';
import { TelemetryHealthIndicator } from './telemetry-health-indicator';
import { HEALTH_REGISTRY } from './health-registry-tokens';
import { METRIC_AGGREGATOR } from './metric-aggregator-tokens';
import { LoggersController } from './loggers-controller';
import { EnvironmentController } from './environment-controller';
import { ConfigurationPropertiesController } from './configuration-properties-controller';
import { endpointPath, MANAGEMENT_ENDPOINT_IDS } from './management-properties';

/**
 * Auto-configuration for management endpoints (AD-76).
 */
@configuration
export class ManagementAutoConfiguration extends AsApplicationContextAware(Null) {
    /** The application context injected by the aware mixin. */
    readonly applicationContext!: ApplicationContext;
    readonly #accessGuard: RouteHandlerInterceptor | undefined;
    readonly #redactHealthErrors: boolean;
    readonly #exposure: { include?: string[]; exclude?: string[] } | undefined;
    readonly #configurationClasses: Array<new () => unknown>;
    readonly #metricAggregator = new FeatureMetricAggregator();

    constructor(options: ManagementAutoConfigurationOptions = {}) {
        super(); // AsApplicationContextAware mixin base (Null)
        // REV-003: this configuration's aggregator doubles as the process's
        // fallback metric snapshot source — eager (constructor, not the
        // entry resolution), so `/metrics` never dead-ends before the
        // aggregator bean is first requested. A telemetry pull reader
        // registered via `configureTelemetry` (current slot) wins over it.
        setFallbackMetricSnapshotProvider(new FeatureMetricAggregatorProvider(this.#metricAggregator));
        // Scoped to the management paths (computed at refresh — the guard
        // rides the shared platform mapping (no per-route interceptors),
        // so it must never deny (or rewrite) non-management routes.
        this.#accessGuard = options.accessGuard;
        this.#redactHealthErrors = options.redactHealthErrors ?? true;
        this.#exposure = options.exposure;
        // (The controller beans are constructed per entry call below — the
        // container processes the values it receives and dispatches the
        // processed beans, so the mapping never holds raw instances.)
        this.#configurationClasses = options.configurationClasses ?? [];
    }

    /**
     * The shared feature-metric aggregator backing `/metrics`.
     *
     * @returns The shared aggregator.
     */
    @entry(METRIC_AGGREGATOR)
    metricAggregator(): FeatureMetricAggregator {
        return this.#metricAggregator;
    }

    /**
     * The health registry, pre-wired with the telemetry indicator (which
     * reads the shared aggregator at check time). Registered once at context
     * refresh — never mutated per request.
     *
     * @returns The registry.
     */
    @entry(HEALTH_REGISTRY)
    healthRegistry(): HealthRegistry {
        const registry = new HealthRegistry({ redactHealthErrors: this.#redactHealthErrors });
        registry.register(new TelemetryHealthIndicator(this.#metricAggregator));
        return registry;
    }

    /**
     * Serves `/metrics` (the guard from options applies at the dispatch
     * level, see {@link ManagementAutoConfiguration.handlerMappings}).
     *
     * @returns The metrics controller.
     */
    @entry()
    metricsController(): MetricsController {
        return new MetricsController();
    }

    /**
     * Serves `/health`.
     *
     * @returns The health controller.
     */
    @entry()
    healthController(): HealthController {
        return new HealthController();
    }

    /**
     * The `/loggers` controller bean (AD-76 D-8): decorator-registered, so
     * handler detection dispatches the context-processed instance.
     *
     * @returns The loggers controller.
     */
    @entry()
    loggersController(): LoggersController {
        return new LoggersController(this.#exposure);
    }

    /**
     * The `/env` controller bean (AD-76 D-8).
     *
     * @returns The environment controller.
     */
    @entry()
    environmentController(): EnvironmentController {
        return new EnvironmentController(this.#exposure);
    }

    /**
     * The `/configprops` controller bean (AD-76 D-8).
     *
     * @returns The configuration-properties controller.
     */
    @entry()
    configurationPropertiesController(): ConfigurationPropertiesController {
        return new ConfigurationPropertiesController(this.#configurationClasses, this.#exposure);
    }

    /**
     * The metadata handler mapping(s): the default security-header set is
     * prepended (same instance shape as the platform mapping — the served
     * management routes otherwise bypass the interceptor attached to the
     * *platform* mapping), the management-path guard pushed onto the
     * interceptor chain when present, and the controllers detected through
     * it like every other decorator-driven handler (AD-76 D-8: detection
     * registers the *processed* bean, so the handlers run with their
     * context wired). Declared as the `handlerMappings` collection (the
     * resolution the strategy checks first), so it is immune to
     * registration-order clobbering by `NodeAutoConfiguration.handlerMapping`.
     *
     * Exposure is enforced **per request** inside the controllers (AD-76
     * D-2): a disabled endpoint answers 404, and its path is covered by the
     * guard like every other management route — same wire behavior as not
     * registering it.
     *
     * @returns The metadata mapping (security headers default-on, guard-attached when configured).
     */
    @entry()
    handlerMappings(): RadixMetadataHandlerMapping[] {
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.unshift(new SecurityHeadersInterceptor());
        if (this.#accessGuard) {
            const paths = MANAGEMENT_ENDPOINT_IDS.map((id) => endpointPath(id)).filter(
                (path): path is string => path !== undefined
            );
            mapping.interceptors.push(scopedToManagementPaths(this.#accessGuard, Object.freeze(paths)));
        }
        return [mapping];
    }
}

/**
 * Options for {@link ManagementAutoConfiguration}.
 */
export interface ManagementAutoConfigurationOptions {
    /**
     * Optional access guard for the exposed management endpoints. When set,
     * every request to those routes must pass the guard or is denied before
     * the handler runs; when omitted the endpoints are **open to any
     * caller** (default posture — documented in the package README).
     *
     * **Recommendation:** the management handlers carry no
     * `@authenticated`/`@authorized` metadata, so a metadata-driven guard
     * (e.g. the auth-server's `AuthRouteGuard`, which derives every
     * requirement from handler metadata) would always permit these
     * endpoints. Use an **unconditional** guard that checks the request
     * itself — a token-presence or token-adapter guard.
     */
    accessGuard?: RouteHandlerInterceptor;
    /**
     * Whether thrown health-indicator errors are redacted on `/health`
     * (AD-36 D-1). Default `true`: the status stays `DOWN` and the component
     * name is preserved, but the exception text is replaced with
     * {@link health.HEALTH_ERROR_REDACTED | HEALTH_ERROR_REDACTED} so indicator internals never reach the
     * wire. Set `false` to expose the raw error messages (only sensible
     * behind the `accessGuard`).
     */
    redactHealthErrors?: boolean;
    /**
     * Endpoint exposure override (AD-76 D-2/D-5): wins over any
     * `management.endpoints.exposure` section. `include` lists the endpoint
     * ids to serve (`'*'` = all), `exclude` withholds; the default is
     * `["health", "metrics"]`.
     */
    exposure?: { include?: string[]; exclude?: string[] };
    /**
     * The `@configurationProperties` classes `/configprops` enumerates
     * (declared keys + conversion types only — values are never read,
     * AD-76 D-3). The same explicit list `@ndigo/inspect` takes.
     */
    configurationClasses?: Array<new () => unknown>;
}

/**
 * Wraps a user-provided guard so it only intercepts the exposed management
 * routes, leaving every other route on the shared mapping untouched. Without
 * this, the guard would apply repository-wide (the platform's shared mapping
 * cannot carry per-route interceptors). The path set is computed from the
 * exposure at refresh, so a disabled endpoint is neither served nor guarded.
 */
function scopedToManagementPaths(guard: RouteHandlerInterceptor, paths: readonly string[]): RouteHandlerInterceptor {
    const covers = (path: string): boolean => {
        for (const prefix of paths) {
            if (path === prefix || path.startsWith(`${prefix}/`)) return true;
        }
        return false;
    };
    return {
        async preHandle(route, handler) {
            if (!covers(route.path)) {
                return true;
            }
            return guard.preHandle(route, handler);
        },
        async postHandle(route, handler, modelAndView) {
            if (!covers(route.path)) {
                return;
            }
            await guard.postHandle?.(route, handler, modelAndView);
        },
        async completeHandle(route, handler, error) {
            if (!covers(route.path)) {
                return;
            }
            await guard.completeHandle?.(route, handler, error);
        },
    };
}
