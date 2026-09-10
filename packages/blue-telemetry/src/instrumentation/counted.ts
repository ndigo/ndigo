import { metrics } from '@opentelemetry/api';
import { AbstractBaseInstrumentation } from './base';
import { CountedRegistry } from '../metrics/_registry';
import { getCounted } from '../metrics/decorators';
import type { CountedMethodConfig } from '../metrics/decorators';
import { getSymbolMetadata } from '@blue/core';

/**
 * An OpenTelemetry instrumentation that automatically wraps methods decorated with `counted`.
 *
 * This instrumentation discovers decorated methods via the `CountedRegistry` and
 * applies the counting logic using the instrumentation's patching mechanism.
 */
export class CountedInstrumentation extends AbstractBaseInstrumentation {
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
                        // The registry holds prototypes of counted-decorated
                        // classes; the instrumented method slot exists by
                        // construction, so widen to shimmer's wrap contract.
                        this._wrap(
                            prototype as { [method: string]: (this: unknown, ...args: unknown[]) => unknown },
                            methodName,
                            this._createCountPatch(config)
                        );
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
                    this._unwrap(prototype as { [method: string]: unknown }, methodName);
                }
            }
        }
    }

    /**
     * Creates a patch function that increments the counter and handles feature aggregation.
     */
    private _createCountPatch(config: CountedMethodConfig) {
        return <This, Args extends unknown[], Return>(
            original: (this: This, ...args: Args) => Return
        ): ((this: This, ...args: Args) => Return) => {
            const meter = metrics.getMeter('@blue/telemetry');
            const counter = meter.createCounter(config.name);

            return function (this: This, ...args: Args): Return {
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
