/**
 * @author Jeff Rose
 */

import type { FeatureMetricRecorder } from '@blue/core';

/**
 * Records feature mount metrics.
 */
export type { FeatureMetricRecorder } from '@blue/core';
import { ApplicationContext } from './context';
import type { SharedDependencyRegistry, DependencyValidationResult } from './shared-dependency-registry';
import { ContextToken } from '@blue/factory';
import { ContextEventGateway, ContextEventGatewayOptions, ContextEventRelay } from './event-gateway';
import {
    createFeatureContext,
    FeatureContextComposition,
    FeatureContextOptions,
    FeatureUnmountPolicy,
    unmountFeatureContext,
} from './context-hierarchy';

/**
 * Options used to register a feature for mounting.
 */
/**
 * A module loaded lazily by a feature's `loader`.
 */
export interface LazyFeatureModule {
    /**
     * Creates a feature context instance from the lazy-loaded module.
     *
     * @param parent - The shell or owning parent context.
     * @returns A fully configured feature context.
     */
    createContext(parent: ApplicationContext): ApplicationContext;
}

/**
 * Options used to register a feature for mounting.
 */
export interface FeatureRegistrationOptions extends FeatureContextOptions {
    unmountPolicy?: FeatureUnmountPolicy;
    /**
     * Declare dependencies this feature requires from the shell.
     * Validated at mount time against the SharedDependencyRegistry.
     */
    dependencies?: {
        /** Required dependencies — mount fails if missing or version-mismatched. */
        requires?: Record<string, string>;
        /** Optional dependencies — mount warns if missing. */
        optional?: Record<string, string>;
    };
    /**
     * Async loader for dynamically code-split feature modules.
     * Resolves to a module exporting `createContext(parent)`.
     * Use with {@link mountLazy} — mount must be awaited.
     *
     * @example
     * ```ts
     * manager.registerFeature({
     *   name: 'checkout',
     *   loader: () => import('./checkout/checkout-module'),
     * });
     * await manager.mountLazy('checkout');
     * ```
     */
    loader?: () => Promise<LazyFeatureModule>;
}

/**
 * Options for the feature context mount manager.
 */
export interface FeatureContextMountManagerOptions {
    metricRecorder?: FeatureMetricRecorder;
}

interface FeatureRegistrationState {
    composition?: FeatureContextComposition;
    options: FeatureRegistrationOptions;
    unmountPolicy: FeatureUnmountPolicy;
    /** Resolves when the async loader has completed and the composition is ready. */
    loadPromise?: Promise<FeatureContextComposition>;
    /** Non-null when the last load attempt failed. */
    loadError?: Error;
}

const hasActiveGateway = (gateway?: ContextEventGateway): boolean => {
    return !!gateway && !gateway.destroyed;
};

const createGateway = (
    context: ApplicationContext,
    relayTarget: ApplicationContext,
    relays: ContextEventRelay[] = [],
    gatewayOptions?: ContextEventGatewayOptions
): ContextEventGateway | undefined => {
    if (!relays.length) {
        return undefined;
    }

    return new ContextEventGateway(context, relayTarget, relays, gatewayOptions);
};

/**
 * Creates, tracks, and tears down mounted feature contexts.
 */
export class FeatureContextMountManager {
    #metricRecorder?: FeatureMetricRecorder;
    #parent: ApplicationContext;
    #registrations: Map<string, FeatureRegistrationState>;

    constructor(parent: ApplicationContext, options: FeatureContextMountManagerOptions = {}) {
        this.#metricRecorder = options.metricRecorder;
        this.#parent = parent;
        this.#registrations = new Map();
    }

    registerFeature(options: FeatureRegistrationOptions): this {
        const { unmountPolicy = 'preserve', ...featureOptions } = options;

        this.#registrations.set(options.name, {
            options: featureOptions,
            unmountPolicy,
        });

        this.#recordCounter(options.name, 'registeredCount');

        return this;
    }

    mount(name: string): FeatureContextComposition {
        const registration = this.#requireRegistration(name);
        this.#recordCounter(name, 'mountAttemptCount');

        // Validate feature dependencies if declared
        if (registration.options.dependencies) {
            this.#validateDependencies(name, registration.options.dependencies);
        }

        if (registration.composition && this.isMounted(name)) {
            this.#metricRecorder?.setGauge?.(name, `${name}.isMounted`, 1);
            return registration.composition;
        }

        if (registration.composition && !registration.composition.context.destroyed) {
            const { gatewayOptions, relayTarget = this.#parent, relays = [] } = registration.options;
            registration.composition.gateway = createGateway(
                registration.composition.context,
                relayTarget,
                relays,
                gatewayOptions
            );

            this.#recordCounter(name, 'mountCount');
            this.#metricRecorder?.setGauge?.(name, `${name}.isMounted`, 1);

            return registration.composition;
        }

        const composition = this.#createComposition(registration.options);
        registration.composition = composition;

        this.#recordCounter(name, 'mountCount');
        this.#metricRecorder?.setGauge?.(name, `${name}.isMounted`, 1);

        return composition;
    }

    /**
     * Mount a feature whose context is loaded dynamically via its registered `loader`.
     *
     * For features registered with a static `createContext`, use {@link mount} instead.
     *
     * If the feature has already been loaded and mounted, returns the existing composition.
     * If a load is already in progress, awaits that same promise (deduplication).
     * Failed loads are retried on the next call — the error state is cleared.
     *
     * @param name - The registered feature name.
     * @returns A promise resolving to the feature context composition.
     * @throws {TypeError} If the feature has no `loader` registered.
     * @throws {Error} If the loader rejects or `createContext` throws.
     */
    async mountLazy(name: string): Promise<FeatureContextComposition> {
        const registration = this.#requireRegistration(name);

        // Already mounted — return existing composition
        if (registration.composition && this.isMounted(name)) {
            return registration.composition;
        }

        // Load already in progress — deduplicate
        if (registration.loadPromise) {
            return registration.loadPromise;
        }

        // Validate dependencies before loading
        if (registration.options.dependencies) {
            this.#validateDependencies(name, registration.options.dependencies);
        }

        const loader = registration.options.loader;
        if (!loader) {
            throw new TypeError(`Feature '${name}' has no 'loader'. Use mount() for static features.`);
        }

        this.#recordCounter(name, 'mountAttemptCount');

        // Clear previous error and start loading
        registration.loadError = undefined;
        const loadPromise = this.#executeLoad(name, registration, loader);
        registration.loadPromise = loadPromise;

        try {
            return await loadPromise;
        } catch (err) {
            registration.loadError = err instanceof Error ? err : new Error(String(err));
            registration.loadPromise = undefined;
            throw registration.loadError;
        }
    }

    /**
     * Unmount and re-mount a feature, re-executing its loader.
     * Useful for retrying after a failed load.
     */
    async remountLazy(name: string, policy?: FeatureUnmountPolicy): Promise<FeatureContextComposition> {
        this.unmount(name, policy ?? 'close');
        return this.mountLazy(name);
    }

    unmount(name: string, policy?: FeatureUnmountPolicy): boolean {
        const registration = this.#registrations.get(name);

        if (!registration?.composition) {
            return false;
        }

        const activePolicy = policy ?? registration.unmountPolicy;
        unmountFeatureContext(registration.composition, activePolicy);

        if (activePolicy === 'close') {
            registration.composition = undefined;
        }

        this.#recordCounter(name, 'unmountCount');
        this.#metricRecorder?.setGauge?.(name, `${name}.isMounted`, 0);

        return true;
    }

    hasRegistration(name: string): boolean {
        return this.#registrations.has(name);
    }

    isMounted(name: string): boolean {
        const registration = this.#registrations.get(name);

        if (!registration?.composition) {
            return false;
        }

        const { context, gateway } = registration.composition;
        const { relays = [] } = registration.options;

        if (context.destroyed) {
            return false;
        }

        if (!relays.length) {
            return true;
        }

        return hasActiveGateway(gateway);
    }

    getMountedFeature(name: string): FeatureContextComposition | undefined {
        return this.isMounted(name) ? this.#registrations.get(name)?.composition : undefined;
    }

    destroy(): void {
        for (const [name] of this.#registrations) {
            this.unmount(name, 'close');
        }

        this.#registrations.clear();
    }

    #requireRegistration(name: string): FeatureRegistrationState {
        const registration = this.#registrations.get(name);

        if (!registration) {
            throw new TypeError(`Feature '${name}' is not registered`);
        }

        return registration;
    }

    #createComposition(options: FeatureRegistrationOptions): FeatureContextComposition {
        return createFeatureContext(this.#parent, options);
    }

    /**
     * Execute the async loader and wire up the resulting feature composition.
     * Deduplication and error handling are managed by the caller (mountLazy).
     */
    async #executeLoad(
        name: string,
        registration: FeatureRegistrationState,
        loader: () => Promise<LazyFeatureModule>
    ): Promise<FeatureContextComposition> {
        const module = await loader();
        const context = module.createContext(this.#parent);
        const { gatewayOptions, relayTarget = this.#parent, relays = [] } = registration.options;

        const composition: FeatureContextComposition = {
            context,
            gateway: createGateway(context, relayTarget, relays, gatewayOptions),
        };

        registration.composition = composition;
        registration.loadPromise = undefined;

        this.#recordCounter(name, 'mountCount');
        this.#metricRecorder?.setGauge?.(name, `${name}.isMounted`, 1);

        return composition;
    }

    /**
     * Resolve the SharedDependencyRegistry from the parent context chain.
     * Returns undefined when no registry is registered (validation skipped).
     */
    #resolveRegistry(): SharedDependencyRegistry | undefined {
        try {
            return this.#parent.hasValue(SHARED_DEPENDENCY_REGISTRY_TOKEN)
                ? this.#parent.getValue(SHARED_DEPENDENCY_REGISTRY_TOKEN)
                : undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Validate a feature's dependency manifest against the SharedDependencyRegistry.
     */
    #validateDependencies(
        featureName: string,
        deps: { requires?: Record<string, string>; optional?: Record<string, string> }
    ): void {
        const registry = this.#resolveRegistry();

        if (!registry) {
            // No registry declared — skip validation
            return;
        }

        const result: DependencyValidationResult = registry.validate(deps.requires ?? {}, deps.optional ?? {});

        result.warnings.forEach((w) => console.warn(`[${featureName}] ${w}`));

        if (!result.valid) {
            const messages: string[] = [];

            if (result.missing.length > 0) {
                messages.push(`Missing required dependencies: ${result.missing.join(', ')}`);
            }

            if (result.versionMismatches.length > 0) {
                messages.push(
                    result.versionMismatches
                        .map((m) => `'${m.name}' requires ${m.required}, found ${m.found}`)
                        .join(', ')
                );
            }

            throw new TypeError(`Feature '${featureName}' has unmet dependencies: ${messages.join('; ')}`);
        }
    }

    #recordCounter(feature: string, metricName: string): void {
        this.#metricRecorder?.incrementCounter(feature, `${feature}.${metricName}`);
    }
}

/**
 * ContextToken for resolving the SharedDependencyRegistry through the context hierarchy.
 */
export const SHARED_DEPENDENCY_REGISTRY_TOKEN = new ContextToken<SharedDependencyRegistry>(
    'blue:sharedDependencyRegistry'
);
