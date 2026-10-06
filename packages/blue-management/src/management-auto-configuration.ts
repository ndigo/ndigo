/**
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry } from '@blue/context';
import { type RouteHandlerInterceptor, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { SecurityHeadersInterceptor } from '@blue/platform-node';
import { FeatureMetricAggregator } from '@blue/telemetry';
import { HealthRegistry } from './health';
import { MetricsController } from './metrics-controller';
import { HealthController } from './health-controller';
import { TelemetryHealthIndicator } from './telemetry-health-indicator';
import { HEALTH_REGISTRY } from './health-registry-tokens';
import { METRIC_AGGREGATOR } from './metric-aggregator-tokens';

/**
 * Auto-configuration for management endpoints.
 *
 * Registers:
 * - a shared {@link FeatureMetricAggregator} entry (read by `/metrics` and by
 *   any feature using `counted`)
 * - a {@link HealthRegistry} with the {@link TelemetryHealthIndicator} wired
 * - the `/metrics` and `/health` controllers
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
 * `ManagementAutoConfiguration(options)` so `/metrics` and `/health`
 * require authentication, and/or firewall the management routes at the
 * network boundary.
 *
 * @since 1.0.0
 */
@configuration
export class ManagementAutoConfiguration {
    readonly #accessGuard: RouteHandlerInterceptor | undefined;
    readonly #redactHealthErrors: boolean;
    readonly #metricAggregator = new FeatureMetricAggregator();

    constructor(options: ManagementAutoConfigurationOptions = {}) {
        // Scoped to management paths: the guard rides the shared platform
        // mapping (no per-route interceptors), so it must never deny (or
        // rewrite) non-management routes.
        this.#accessGuard = options.accessGuard ? scopedToManagementPaths(options.accessGuard) : undefined;
        this.#redactHealthErrors = options.redactHealthErrors ?? true;
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
     * The metadata handler mapping(s): the default security-header set is
     * prepended (same instance shape as the platform mapping — `/health` and
     * `/metrics` otherwise bypass the interceptor attached to the *platform*
     * mapping), then the configured access guard pushed onto the interceptor
     * chain when present. Declared as the `handlerMappings` collection (the
     * resolution the strategy checks first), so it is immune to
     * registration-order clobbering by `NodeAutoConfiguration.handlerMapping`;
     * controllers still register through it via handler detection. Without a
     * guard the mapping behaves like the platform default plus headers.
     *
     * @returns The metadata mapping (security headers default-on, guard-attached when configured).
     */
    @entry()
    handlerMappings(): RadixMetadataHandlerMapping[] {
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.unshift(new SecurityHeadersInterceptor());
        if (this.#accessGuard) {
            mapping.interceptors.push(this.#accessGuard);
        }
        return [mapping];
    }
}

/**
 * Options for {@link ManagementAutoConfiguration}.
 */
export interface ManagementAutoConfigurationOptions {
    /**
     * Optional access guard for the management endpoints (`/metrics`,
     * `/health`). When set, every request to these routes must pass the
     * guard or is denied before the handler runs; when omitted the
     * endpoints are **open to any caller** (default posture — documented
     * in the package README).
     *
     * **Recommendation:** the health/metrics handlers carry no
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
     * {@link HEALTH_ERROR_REDACTED} so indicator internals never reach the
     * wire. Set `false` to expose the raw error messages (only sensible
     * behind the `accessGuard`).
     */
    redactHealthErrors?: boolean;
}

/** The management route prefixes the access guard protects. */
const MANAGEMENT_PATHS = ['/health', '/metrics'];

/**
 * Wraps a user-provided guard so it only intercepts the management routes,
 * leaving every other route on the shared mapping untouched. Without this,
 * the guard would apply repository-wide (the platform's shared mapping
 * cannot carry per-route interceptors).
 */
function scopedToManagementPaths(guard: RouteHandlerInterceptor): RouteHandlerInterceptor {
    return {
        async preHandle(route, handler) {
            if (!MANAGEMENT_PATHS.some((path) => route.path === path || route.path.startsWith(`${path}/`))) {
                return true;
            }
            return guard.preHandle(route, handler);
        },
        async postHandle(route, handler, modelAndView) {
            if (!MANAGEMENT_PATHS.some((path) => route.path === path || route.path.startsWith(`${path}/`))) {
                return;
            }
            await guard.postHandle?.(route, handler, modelAndView);
        },
        async completeHandle(route, handler, error) {
            if (!MANAGEMENT_PATHS.some((path) => route.path === path || route.path.startsWith(`${path}/`))) {
                return;
            }
            await guard.completeHandle?.(route, handler, error);
        },
    };
}
