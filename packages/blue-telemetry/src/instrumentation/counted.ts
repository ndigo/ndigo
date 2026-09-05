import { metrics } from '@opentelemetry/api';
import { AbstractBlueInstrumentation } from './base';
import { CountedRegistry } from '../metrics/_registry';
import { getCounted } from '../metrics/decorators';
import { getSymbolMetadata } from '@blue/core';

/**
 * An OpenTelemetry instrumentation that automatically wraps methods decorated with `counted`.
 *
 * This instrumentation discovers decorated methods via the `CountedRegistry` and
 * applies the counting logic using the instrumentation's patching mechanism.
 */
export class CountedInstrumentation extends AbstractBlueInstrumentation {
    constructor() {
        super('metrics-counted');
    }

    enable(): void {
        const prototypes = CountedRegistry.getPrototypes();

        for (const prototype of prototypes) {
            const metadata = getSymbolMetadata(prototype);

            for (const key of Object.keys(metadata)) {
                if (key.startsWith('telemetry:counted:')) {
                    const methodName = key.replace('telemetry:counted:', '');
                    const config = getCounted(prototype, methodName);

                    if (config) {
                        this._wrap(prototype, methodName, this._createCountPatch(config));
                    }
                }
            }
        }
    }

    disable(): void {
        const prototypes = CountedRegistry.getPrototypes();

        for (const prototype of prototypes) {
            const metadata = getSymbolMetadata(prototype);

            for (const key of Object.keys(metadata)) {
                if (key.startsWith('telemetry:counted:')) {
                    const methodName = key.replace('telemetry:counted:', '');
                    this._unwrap(prototype, methodName);
                }
            }
        }
    }

    /**
     * Creates a patch function that increments the counter and handles feature aggregation.
     */
    private _createCountPatch(config: any) {
        return (original: (...args: any[]) => any) => {
            const meter = metrics.getMeter('@blue/telemetry');
            const counter = meter.createCounter(config.name);

            return function (this: any, ...args: any[]) {
                // Increment the OTel counter
                counter.add(1, config.attributes);

                // Handle feature aggregation if configured
                if (config.featureAggregator) {
                    const featureKey = config.featureKey ?? 'feature';
                    const feature = config.attributes?.[featureKey];
                    if (typeof feature === 'string') {
                        config.featureAggregator.incrementCounter(feature, config.name);
                    }
                }

                return original.apply(this, args);
            };
        };
    }
}
