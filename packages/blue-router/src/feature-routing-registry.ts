/**
 * @author Jeff Rose
 */

import type { FeatureMetricRecorder } from '@blue/core';

export type { FeatureMetricRecorder } from '@blue/core';
import { Route } from './route';
import { SiteRouter } from './site-router';

export type FeatureActivationPolicy = 'tracked' | 'exclusive';

export interface FeatureRoutingRegistryOptions {
    activationPolicy?: FeatureActivationPolicy;
    metricRecorder?: FeatureMetricRecorder;
}

export interface FeatureRouteRegistration {
    name: string;
    prefix: string;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onRoute: (route: Route) => void;
}

export class FeatureRoutingRegistry {
    #activationPolicy: FeatureActivationPolicy;
    #activeFeatureName?: string;
    #featureMap: Map<string, FeatureRouteRegistration>;
    #metricRecorder?: FeatureMetricRecorder;
    #siteRouter: SiteRouter;

    get activeFeatureName(): string | undefined {
        return this.#activeFeatureName;
    }

    get siteRouter(): SiteRouter {
        return this.#siteRouter;
    }

    constructor(siteRouter: SiteRouter = new SiteRouter(), options: FeatureRoutingRegistryOptions = {}) {
        this.#activationPolicy = options.activationPolicy ?? 'tracked';
        this.#activeFeatureName = undefined;
        this.#featureMap = new Map();
        this.#metricRecorder = options.metricRecorder;
        this.#siteRouter = siteRouter;
    }

    registerFeature(feature: FeatureRouteRegistration): this {
        if (this.#featureMap.has(feature.name)) {
            throw new TypeError(`Feature '${feature.name}' is already registered`);
        }

        this.#featureMap.set(feature.name, feature);
        this.#recordCounter(feature.name, 'registeredCount');
        this.#siteRouter.mount(feature.prefix, (route) => {
            this.#activate(feature.name);
            this.#recordCounter(feature.name, 'routeHandledCount');
            feature.onRoute(route);
        });

        return this;
    }

    setActiveFeature(name: string): this {
        if (!this.#featureMap.has(name)) {
            throw new TypeError(`Feature '${name}' is not registered`);
        }

        this.#activate(name);

        return this;
    }

    navigate(path: string): boolean {
        const handled = this.#siteRouter.navigate(path);

        if (!handled) {
            this.#deactivate(this.#activeFeatureName);
            this.#activeFeatureName = undefined;
        }

        return handled;
    }

    refresh(): void {
        this.#siteRouter.refresh();
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
