/**
 * Health indicators and the registry that aggregates them for a management.
 * * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
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
 */
export class HealthRegistry {
    #indicators = new Map<string, HealthIndicator>();
    readonly #redactHealthErrors: boolean;

    /**
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

        // Each indicator probe is independent, so run them concurrently and
        // aggregate afterwards — identical status rules, but one round-trip
        // instead of N sequential probes.
        const results = await Promise.all(
            [...this.#indicators].map(async ([name, indicator]): Promise<{ name: string; result: HealthResult }> => {
                try {
                    const result = await indicator.check();
                    return { name, result };
                } catch (error) {
                    const detail = error instanceof Error ? error.message : String(error);
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
