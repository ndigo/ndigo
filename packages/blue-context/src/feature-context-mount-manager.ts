/**
 * @author Jeff Rose
 */

import type { FeatureMetricRecorder } from '@blue/core';

export type { FeatureMetricRecorder } from '@blue/core';
import { ApplicationContext } from './context';
import { ContextEventGateway, ContextEventGatewayOptions, ContextEventRelay } from './event-gateway';
import {
    createFeatureContext,
    FeatureContextComposition,
    FeatureContextOptions,
    FeatureUnmountPolicy,
    unmountFeatureContext,
} from './context-hierarchy';

export interface FeatureRegistrationOptions extends FeatureContextOptions {
    unmountPolicy?: FeatureUnmountPolicy;
}

export interface FeatureContextMountManagerOptions {
    metricRecorder?: FeatureMetricRecorder;
}

interface FeatureRegistrationState {
    composition?: FeatureContextComposition;
    options: FeatureRegistrationOptions;
    unmountPolicy: FeatureUnmountPolicy;
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

    remount(name: string, policy?: FeatureUnmountPolicy): FeatureContextComposition {
        this.unmount(name, policy);
        return this.mount(name);
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

    #recordCounter(feature: string, metricName: string): void {
        this.#metricRecorder?.incrementCounter(feature, `${feature}.${metricName}`);
    }
}
