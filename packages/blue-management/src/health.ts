/**
 * Health indicators and the registry that aggregates them for a management
 * `/health` endpoint.
 *
 * A `HealthIndicator` reports the health of a single subsystem (e.g. the
 * OTel/telemetry pipeline, the application context, a data source). The
 * {@link HealthRegistry} collects their results into one `HealthStatus`.
 *
 * @module
 * @since 1.0.0
 */

/**
 * The overall health of a subsystem.
 */
export type HealthState = 'UP' | 'DOWN' | 'UNKNOWN';

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
 */
export class HealthRegistry {
    #indicators = new Map<string, HealthIndicator>();

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
     * The names of all registered indicators.
     */
    get names(): readonly string[] {
        return Object.freeze(Array.from(this.#indicators.keys()));
    }

    /**
     * Runs every indicator and aggregates the results.
     *
     * @returns The aggregate health status with per-indicator details.
     */
    async checkAll(): Promise<HealthStatus> {
        const components: Record<string, HealthResult> = {};
        let overall: HealthState = 'UP';

        for (const [name, indicator] of this.#indicators) {
            try {
                const result = await indicator.check();
                components[name] = result;
                if (result.status === 'DOWN') {
                    overall = 'DOWN';
                } else if (result.status === 'UNKNOWN' && overall === 'UP') {
                    overall = 'UNKNOWN';
                }
            } catch (error) {
                components[name] = {
                    status: 'DOWN',
                    details: { error: error instanceof Error ? error.message : String(error) },
                };
                overall = 'DOWN';
            }
        }

        return {
            status: overall,
            components,
            timestamp: new Date().toISOString(),
        };
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
