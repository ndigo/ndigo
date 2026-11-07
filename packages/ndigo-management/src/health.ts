/**
 * Health indicators and the registry that aggregates them for a management.
 */
import type { Enumerable } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';

/**
 * The overall health of a subsystem.
 */
export type HealthState = 'UP' | 'DOWN' | 'UNKNOWN';

/**
 * The marker `/health` reports when an indicator throws and error details
 * are redacted (SEC-5/AD-36): the status stays `DOWN` and the component name
 * is preserved, but the exception text never reaches the wire.
 */
export const HEALTH_ERROR_REDACTED = 'unavailable';

/**
 * Options for {@link HealthRegistry}.
 */
export interface HealthRegistryOptions {
    /**
     * Whether thrown indicator errors are redacted to
     * {@link HEALTH_ERROR_REDACTED}. Default `false` — the registry is a
     * shared API; the `/health` endpoint (AD-36) opts into redaction by
     * default via `ManagementAutoConfigurationOptions.redactHealthErrors`.
     */
    redactHealthErrors?: boolean;
}

/**
 * The health result of a single indicator.
 */
export interface HealthResult {
    /** Overall state. */
    status: HealthState;
    /** Optional details (e.g. aggregated metric counts). */
    details?: Record<string, unknown>;
}

/**
 * A component that reports the health of one subsystem.
 */
export interface HealthIndicator {
    /** The stable name of the subsystem (e.g. `'telemetry'`). */
    readonly name: string;
    /**
     * Checks the subsystem health.
     *
     * @returns A promise resolving to the health result.
     */
    check(): Promise<HealthResult> | HealthResult;
}

/**
 * Collects {@link HealthIndicator} results into a single aggregate status.
 *
 * The aggregate is `UP` when every indicator is `UP`; `DOWN` when any is
 * `DOWN` (or a check throws); otherwise `UNKNOWN`.
 * Indicators can be enumerated by name in registration order without
 * exposing the backing collection. Replacing an indicator keeps its position.
 */
export class HealthRegistry implements Enumerable<string, HealthIndicator> {
    #indicators = new Map<string, HealthIndicator>();
    readonly #redactHealthErrors: boolean;

    /**
     * Creates a registry with the given options.
     *
     * @param options - Registry options (e.g. error redaction).
     */
    constructor(options: HealthRegistryOptions = {}) {
        this.#redactHealthErrors = options.redactHealthErrors ?? false;
    }

    /**
     * Registers (or replaces) an indicator by name.
     *
     * @param indicator - The indicator to register.
     * @returns This registry.
     */
    register(indicator: HealthIndicator): this {
        this.#indicators.set(indicator.name, indicator);
        return this;
    }

    /**
     * Removes an indicator by name.
     *
     * @param name - The indicator name.
     * @returns `true` when an indicator was removed.
     */
    unregister(name: string): boolean {
        return this.#indicators.delete(name);
    }

    /**
     * Returns name/indicator pairs in registration order.
     *
     * @returns An iterator over `[name, indicator]` pairs.
     */
    entries(): IterableIterator<[string, HealthIndicator]> {
        return this.#indicators.entries();
    }

    /**
     * Returns indicator names in registration order.
     *
     * @returns An iterator over the registered names.
     */
    keys(): IterableIterator<string> {
        return this.#indicators.keys();
    }

    /**
     * Returns indicators in registration order.
     *
     * @returns An iterator over the registered indicators.
     */
    values(): IterableIterator<HealthIndicator> {
        return this.#indicators.values();
    }

    /**
     * Visits registrations in order, using `context` as callback `this`.
     *
     * @param callback - Invoked for each `(indicator, name)` pair.
     * @param context - Value bound to `this` inside the callback.
     */
    forEach(callback: (value: HealthIndicator, key: string, list: this) => void, context?: unknown): void {
        this.#indicators.forEach((value, key) => callback.call(context, value, key, this));
    }

    /**
     * The names of all registered indicators.
     */
    get names(): readonly string[] {
        return Object.freeze(Array.from(this.#indicators.keys()));
    }

    /**
     * Runs the registered indicators (or the named subset) and aggregates
     * the results (AD-76 D-6).
     *
     * Unknown names in `names` are skipped; an empty intersection produces
     * `{ status: 'UNKNOWN', components: {} }` — callers decide the 404.
     *
     * @param names - The indicator names to probe; all when omitted.
     * @returns The aggregate health status with per-indicator details.
     */
    async check(names?: readonly string[]): Promise<HealthStatus> {
        const indicators = names
            ? [...this.#indicators].filter(([name]) => names.includes(name))
            : [...this.#indicators];
        const components: Record<string, HealthResult> = {};
        let overall: HealthState = 'UP';

        // Each indicator probe is independent, so run them concurrently and
        // aggregate afterwards — identical status rules, but one round-trip
        // instead of N sequential probes.
        const results = await Promise.all(
            indicators.map(async ([name, indicator]): Promise<{ name: string; result: HealthResult }> => {
                try {
                    const result = await indicator.check();
                    return { name, result };
                } catch (error) {
                    const detail = getErrorMessage(error);
                    return {
                        name,
                        result: {
                            status: 'DOWN',
                            details: {
                                error: this.#redactHealthErrors ? HEALTH_ERROR_REDACTED : detail,
                            },
                        },
                    };
                }
            })
        );

        for (const { name, result } of results) {
            components[name] = result;
            if (result.status === 'DOWN') {
                overall = 'DOWN';
            } else if (result.status === 'UNKNOWN' && overall === 'UP') {
                overall = 'UNKNOWN';
            }
        }

        return {
            status: overall,
            components,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Runs every registered indicator and aggregates the results.
     *
     * @returns The aggregate health status with per-indicator details.
     */
    checkAll(): Promise<HealthStatus> {
        return this.check();
    }
}

/**
 * The aggregated health status served by `/health`.
 */
export interface HealthStatus {
    /** Overall state across all indicators. */
    status: HealthState;
    /** Per-indicator results keyed by indicator name. */
    components: Record<string, HealthResult>;
    /** ISO timestamp of the check. */
    timestamp: string;
}
