/**
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry } from '@blue/context';
import { type RouteHandlerInterceptor, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { FeatureMetricAggregator } from '@blue/telemetry';
import { HealthRegistry } from './health';
import { MetricsController } from './metrics-controller';
import { HealthController } from './health-controller';
import { TelemetryHealthIndicator } from './telemetry-health-indicator';

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
 * The endpoints are **open by default** — on an untrusted network, pass a
 * guard to `ManagementAutoConfiguration(options)` (e.g. the auth-server's
 * `AuthRouteGuard` or any `RouteHandlerInterceptor`) so `/metrics` and
 * `/health` require authentication, and/or firewall the management routes at
 * the network boundary.
 *
 * @since 1.0.0
 */
@configuration
export class ManagementAutoConfiguration {
    readonly #accessGuard: RouteHandlerInterceptor | undefined;
    readonly #metricAggregator = new FeatureMetricAggregator();

    constructor(options: ManagementAutoConfigurationOptions = {}) {
        // Scoped to management paths: the guard rides the shared platform
        // mapping (no per-route interceptors), so it must never deny (or
        // rewrite) non-management routes.
        this.#accessGuard = options.accessGuard ? scopedToManagementPaths(options.accessGuard) : undefined;
    }

    /**
     * The shared feature-metric aggregator backing `/metrics`.
     *
     * @returns The shared aggregator.
     */
    @entry
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
    @entry
    healthRegistry(): HealthRegistry {
        const registry = new HealthRegistry();
        registry.register(new TelemetryHealthIndicator(this.#metricAggregator));
        return registry;
    }

    /**
     * Serves `/metrics` (the guard from options applies at the dispatch
     * level, see {@link ManagementAutoConfiguration.handlerMappings}).
     *
     * @returns The metrics controller.
     */
    @entry
    metricsController(): MetricsController {
        return new MetricsController();
    }

    /**
     * Serves `/health`.
     *
     * @returns The health controller.
     */
    @entry
    healthController(): HealthController {
        return new HealthController();
    }

    /**
     * The metadata handler mapping(s), with the configured access guard
     * pushed onto the interceptor chain when present. Declared as the
     * `handlerMappings` collection (the resolution the strategy checks
     * first), so it is immune to registration-order clobbering by
     * `NodeAutoConfiguration.handlerMapping`; controllers still register
     * through it via handler detection. Without a guard the mapping behaves
     * like the platform default.
     *
     * @returns The metadata mapping (guard-attached when configured).
     */
    @entry
    handlerMappings(): RadixMetadataHandlerMapping[] {
        const mapping = new RadixMetadataHandlerMapping();
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
     * guard or is denied before the handler runs; when omitted the endpoints
     * are **open to any caller** (default posture — documented in the
     * package README).
     */
    accessGuard?: RouteHandlerInterceptor;
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
        async preHandle(route) {
            if (!MANAGEMENT_PATHS.some((path) => route.path === path || route.path.startsWith(`${path}/`))) {
                return true;
            }
            return guard.preHandle(route, undefined);
        },
        async postHandle(route, _handler, modelAndView) {
            await guard.postHandle?.(route, undefined, modelAndView);
        },
        async completeHandle(route, _handler, error) {
            await guard.completeHandle?.(route, undefined, error);
        },
    };
}
