/**
 * Host orchestration — the centralized micro frontend host (AD-18).
 * @module ndigo-host
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { FeatureMetricRecorder } from '@ndigo/core';
import { ContextToken, FeatureContextMountManager } from '@ndigo/context';
import type {
    ApplicationContext,
    FeatureContextComposition,
    FeatureRegistrationOptions,
    FeatureUnmountPolicy,
} from '@ndigo/context';
import { FeatureRoutingRegistry } from '@ndigo/router';
import type { FeatureActivationPolicy, PartitionRouter, Route } from '@ndigo/router';

/**
 * Options for registering a feature with a {@link HostManager}.
 *
 * Adds the routing half (`prefix`, optional `onRoute`) to the mount-manager
 * registration contract.
 */
export interface HostRegistrationOptions extends FeatureRegistrationOptions {
    /**
     * URL prefix partition that activates the feature (e.g. `/catalog`).
     */
    prefix: string;
    /**
     * Optional callback invoked with the feature-local route after
     * activation — e.g. `(route) => dispatcher.dispatch(route)`.
     */
    onRoute?: (route: Route) => void;
    /**
     * Optional callback invoked after the feature is unmounted on
     * deactivation.
     */
    onDeactivate?: () => void;
}

/**
 * Options for the {@link HostManager}.
 */
export interface HostManagerOptions {
    /**
     * Records feature mount/activation metrics.
     */
    metricRecorder?: FeatureMetricRecorder;
    /**
     * Feature activation policy; defaults to `'tracked'`.
     */
    activationPolicy?: FeatureActivationPolicy;
    /**
     * Optional callback invoked when a dynamically loaded feature's
     * activation fails — e.g. a rejected loader or dependency-validation
     * failure. Receives the feature name and the rejected error. Only fired
     * for the fire-and-forget lazy activation; the routing registry retains
     * its retry-on-next-activate semantics.
     */
    onActivationError?: (name: string, error: unknown) => void;
}

/**
 * ContextToken for resolving the host orchestrator through the context
 * hierarchy — the same placement pattern as
 * `SHARED_DEPENDENCY_REGISTRY_TOKEN`.
 */
export const HOST_MANAGER_TOKEN = new ContextToken<HostManager>('ndigo:hostManager');

/**
 * Creates, tracks, and tears down feature contexts and their route partitions.
 *
 * One registration call wires both registries:
 *
 * ```ts
 * const host = new HostManager(shellContext, { activationPolicy: 'exclusive' });
 * host.registerFeature({
 *     name: 'catalog',
 *     prefix: '/catalog',
 *     loader: () => import('./features/catalog'),
 *     dependencies: { requires: { router: '^1.0.0' } },
 * });
 * shellContext.setValue(HOST_MANAGER_TOKEN, host);
 * ```
 *
 * Pure delegation: mount/unmount/dependency-validation/metrics behavior is
 * exactly the `FeatureContextMountManager` + `DefaultSharedDependencyRegistry`
 * + `FeatureRoutingRegistry` machinery this class assembles.
 */
export class HostManager {
    #mountManager: FeatureContextMountManager;
    #routingRegistry: FeatureRoutingRegistry;
    #names: Set<string>;
    #metricRecorder?: FeatureMetricRecorder;
    #onActivationError?: (name: string, error: unknown) => void;

    /**
     * Creates the host orchestrator above `parent` (the shell context).
     */
    constructor(parent: ApplicationContext, options: HostManagerOptions = {}) {
        this.#mountManager = new FeatureContextMountManager(parent, {
            metricRecorder: options.metricRecorder,
        });
        this.#routingRegistry = new FeatureRoutingRegistry(undefined, {
            activationPolicy: options.activationPolicy,
            metricRecorder: options.metricRecorder,
        });
        this.#names = new Set();
        this.#metricRecorder = options.metricRecorder;
        this.#onActivationError = options.onActivationError;
    }

    /**
     * Gets the name of the currently active feature.
     */
    get activeFeature(): string | undefined {
        return this.#routingRegistry.activeFeatureName;
    }

    /**
     * Gets the underlying `PartitionRouter` used by the routing registry.
     */
    get partitionRouter(): PartitionRouter {
        return this.#routingRegistry.partitionRouter;
    }

    /**
     * Registers a feature in one call: mount manager + routing registry,
     * with mount-on-activate / unmount-on-deactivate wiring.
     *
     * @throws {TypeError} If a feature with the same name is already registered.
     */
    registerFeature(options: HostRegistrationOptions): this {
        if (this.#names.has(options.name)) {
            throw new TypeError(`Feature '${options.name}' is already registered`);
        }

        const { onDeactivate, onRoute, prefix, ...featureOptions } = options;

        // Register routing first: a duplicate-prefix rejection must not leave
        // an orphaned mount registration behind (PWB-REV-010).
        this.#routingRegistry.registerFeature({
            name: options.name,
            prefix,
            onActivate: () => {
                if (options.loader) {
                    // Fire-and-forget: a failed lazy load must be observed,
                    // not dropped as an unhandled rejection. The routing
                    // registry's active-flag keeps retry-on-next-activate.
                    void this.mountLazy(options.name).catch((error: unknown) => {
                        this.#reportActivationError(options.name, error);
                    });
                    return;
                }
                this.mount(options.name);
            },
            onDeactivate: () => {
                this.unmount(options.name);
                onDeactivate?.();
            },
            onRoute: (route: Route) => {
                onRoute?.(route);
            },
        });

        try {
            this.#mountManager.registerFeature(featureOptions);
        } catch (error) {
            // Roll the routing half back so the two registries stay in sync.
            this.#routingRegistry.unregister(options.name);
            throw error;
        }

        this.#names.add(options.name);

        return this;
    }

    /**
     * Mount a registered feature (static `createContext`/`data` features).
     */
    mount(name: string): FeatureContextComposition {
        return this.#mountManager.mount(name);
    }

    /**
     * Mount a feature loaded dynamically via its registered `loader`.
     */
    mountLazy(name: string): Promise<FeatureContextComposition> {
        return this.#mountManager.mountLazy(name);
    }

    /**
     * Reports a failed lazy activation through the host's metric recorder and
     * the optional {@link HostManagerOptions.onActivationError} handler, so a
     * rejected loader never surfaces as an unhandled rejection. The routing
     * registry retains its retry-on-next-activate semantics.
     */
    #reportActivationError(name: string, error: unknown): void {
        this.#metricRecorder?.incrementCounter(name, `${name}.activationErrorCount`);
        this.#onActivationError?.(name, error);
    }

    /**
     * Unmount a feature, honoring the registration's `unmountPolicy` unless
     * one is given.
     */
    unmount(name: string, policy?: FeatureUnmountPolicy): boolean {
        return this.#mountManager.unmount(name, policy);
    }

    /**
     * Whether a feature is currently mounted.
     */
    isMounted(name: string): boolean {
        return this.#mountManager.isMounted(name);
    }

    /**
     * Get the mounted feature composition, if any.
     */
    getMountedFeature(name: string): FeatureContextComposition | undefined {
        return this.#mountManager.getMountedFeature(name);
    }

    /**
     * Navigate the host's partition router; activates/deactivates features
     * per the activation policy. Returns whether a feature handled the path.
     */
    navigate(path: string): boolean {
        return this.#routingRegistry.navigate(path);
    }

    /**
     * Re-evaluate the current route against all mounted partitions.
     */
    refresh(): void {
        this.#routingRegistry.refresh();
    }

    /**
     * Unmount (close policy) a feature and remove it from both registries,
     * freeing its name for re-registration.
     *
     * @returns `true` if a registration was removed.
     */
    unregister(name: string): boolean {
        if (!this.#names.delete(name)) {
            return false;
        }

        this.unmount(name, 'close');
        this.#routingRegistry.unregister(name);
        this.#mountManager.unregister(name);

        return true;
    }

    /**
     * Unregister every feature and clear the host.
     */
    destroy(): void {
        for (const name of this.#names) {
            this.unregister(name);
        }
    }
}
