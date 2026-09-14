/**
 * @module blue-router
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { FeatureMetricRecorder } from '@blue/core';

export type { FeatureMetricRecorder } from '@blue/core';
import { Route } from './route';
import { PartitionRouter } from './partition-router';

/**
 * Defines the policy for how features are activated within the `FeatureRoutingRegistry`.
 * - `'tracked'`: Allows multiple features to be active, tracking each one.
 * - `'exclusive'`: Only one feature can be active at a time; activating a new feature deactivates the previous one.
 * @since 1.0.0
 */
export type FeatureActivationPolicy = 'tracked' | 'exclusive';

/**
 * Options for configuring the `FeatureRoutingRegistry`.
 * @since 1.0.0
 */
export interface FeatureRoutingRegistryOptions {
    activationPolicy?: FeatureActivationPolicy;
    metricRecorder?: FeatureMetricRecorder;
}

/**
 * Defines the structure for registering a feature with the `FeatureRoutingRegistry`.
 * @since 1.0.0
 */
export interface FeatureRouteRegistration {
    name: string;
    prefix: string;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onRoute: (route: Route) => void;
}

/**
 * Manages the registration and activation of features based on routing.
 * It allows features to be mounted at specific URL prefixes and provides policies for feature activation.
 * @since 1.0.0
 */
export class FeatureRoutingRegistry {
    #activationPolicy: FeatureActivationPolicy;
    #activeFeatureName?: string;
    #featureMap: Map<string, FeatureRouteRegistration>;
    #metricRecorder?: FeatureMetricRecorder;
    #partitionRouter: PartitionRouter;

    /**
     * Gets the name of the currently active feature.
     * @returns The name of the active feature, or `undefined` if no feature is active.
     * @since 1.0.0
     */
    get activeFeatureName(): string | undefined {
        return this.#activeFeatureName;
    }

    /**
     * Gets the underlying `PartitionRouter` instance used by the registry.
     * @returns The `PartitionRouter` instance.
     * @since 1.0.0
     */
    get partitionRouter(): PartitionRouter {
        return this.#partitionRouter;
    }

    /**
     * Creates an instance of `FeatureRoutingRegistry`.
     * @param partitionRouter - The `PartitionRouter` instance to use for routing. Defaults to a new `PartitionRouter`.
     * @param options - Configuration options for the registry.
     * @since 1.0.0
     */
    constructor(partitionRouter: PartitionRouter = new PartitionRouter(), options: FeatureRoutingRegistryOptions = {}) {
        this.#activationPolicy = options.activationPolicy ?? 'tracked';
        this.#activeFeatureName = undefined;
        this.#featureMap = new Map();
        this.#metricRecorder = options.metricRecorder;
        this.#partitionRouter = partitionRouter;
    }

    /**
     * Registers a new feature with the routing registry.
     * Each feature is associated with a unique name and a URL prefix.
     * @param feature - The `FeatureRouteRegistration` object containing feature details and callbacks.
     * @returns The current `FeatureRoutingRegistry` instance for chaining.
     * @throws {TypeError} If a feature with the same name is already registered.
     * @since 1.0.0
     */
    registerFeature(feature: FeatureRouteRegistration): this {
        if (this.#featureMap.has(feature.name)) {
            throw new TypeError(`Feature '${feature.name}' is already registered`);
        }

        this.#featureMap.set(feature.name, feature);
        this.#recordCounter(feature.name, 'registeredCount');
        this.#partitionRouter.mount(feature.prefix, (route) => {
            this.#activate(feature.name);
            this.#recordCounter(feature.name, 'routeHandledCount');
            feature.onRoute(route);
        });

        return this;
    }

    /**
     * Explicitly sets a feature as active by its name.
     * This will trigger the activation policy (e.g., deactivating other features if policy is 'exclusive').
     * @param name - The name of the feature to activate.
     * @returns The current `FeatureRoutingRegistry` instance for chaining.
     * @throws {TypeError} If the specified feature name is not registered.
     * @since 1.0.0
     */
    setActiveFeature(name: string): this {
        if (!this.#featureMap.has(name)) {
            throw new TypeError(`Feature '${name}' is not registered`);
        }

        this.#activate(name);

        return this;
    }

    /**
     * Removes a feature registration: deactivates it if active and unmounts
     * its route prefix so future navigation no longer matches.
     *
     * @param name - The registered feature name.
     * @returns `true` if a registration was removed.
     * @since 1.0.0
     */
    unregister(name: string): boolean {
        const feature = this.#featureMap.get(name);

        if (!feature) {
            return false;
        }

        if (this.#activeFeatureName === name) {
            this.#deactivate(name);
            this.#activeFeatureName = undefined;
        }

        this.#featureMap.delete(name);
        this.#partitionRouter.unmount(feature.prefix);
        this.#recordCounter(name, 'unregisteredCount');

        return true;
    }

    /**
     * Navigates the underlying `PartitionRouter` to the given path.
     * If the navigation is not handled by any registered route, the currently active feature (if any) will be deactivated.
     * @param path - The path to navigate to.
     * @returns `true` if the navigation was handled by a registered route, `false` otherwise.
     * @since 1.0.0
     */
    navigate(path: string): boolean {
        const handled = this.#partitionRouter.navigate(path);

        if (!handled) {
            this.#deactivate(this.#activeFeatureName);
            this.#activeFeatureName = undefined;
        }

        return handled;
    }

    /**
     * Refreshes the routing by calling `refresh` on the underlying `PartitionRouter`.
     * This can re-evaluate the current URL against registered routes.
     * @since 1.0.0
     */
    refresh(): void {
        this.#partitionRouter.refresh();
    }

    #activate(name: string): void {
        if (this.#activeFeatureName === name) {
            return;
        }

        if (this.#activationPolicy === 'exclusive') {
            this.#deactivateAllExcept(name);
        } else {
            this.#deactivate(this.#activeFeatureName);
        }

        this.#activeFeatureName = name;
        this.#recordCounter(name, 'activateCount');
        this.#metricRecorder?.setGauge?.(name, `${name}.isActive`, 1);
        this.#featureMap.get(name)?.onActivate?.();
    }

    #deactivateAllExcept(name: string): void {
        for (const [featureName, feature] of this.#featureMap) {
            if (featureName !== name) {
                feature.onDeactivate?.();
            }
        }
    }

    #deactivate(name?: string): void {
        if (!name) {
            return;
        }

        this.#recordCounter(name, 'deactivateCount');
        this.#metricRecorder?.setGauge?.(name, `${name}.isActive`, 0);
        this.#featureMap.get(name)?.onDeactivate?.();
    }

    #recordCounter(feature: string, metricName: string): void {
        this.#metricRecorder?.incrementCounter(feature, `${feature}.${metricName}`);
    }
}
