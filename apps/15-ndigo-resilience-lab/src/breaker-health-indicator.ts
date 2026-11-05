/**
 * Breaker health for the management `/health` aggregate: `UP` while every
 * circuit is closed or probing, `DOWN` as soon as one circuit is fully open —
 * the state in which calls are being refused without reaching the upstream.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { HealthIndicator, HealthResult } from '@ndigo/management';
import type { CircuitSnapshot } from './lab-types';

/** The component name the indicator registers under in `/health`. */
export const BREAKER_HEALTH_COMPONENT = 'circuit-breakers';

/**
 * Reports breaker state as a management health indicator.
 */
export class BreakerHealthIndicator implements HealthIndicator {
    readonly name = BREAKER_HEALTH_COMPONENT;
    readonly #snapshots: () => readonly CircuitSnapshot[];

    /**
     * @param snapshots - Reads the lab's current circuit view.
     */
    constructor(snapshots: () => readonly CircuitSnapshot[]) {
        this.#snapshots = snapshots;
    }

    /**
     * @returns `DOWN` while any circuit is open, with every circuit's state as
     * details so a probe can see which dependency tripped.
     */
    check(): HealthResult {
        const circuits = this.#snapshots();
        const open = circuits.filter((circuit) => circuit.state === 'open');
        return {
            status: open.length > 0 ? 'DOWN' : 'UP',
            details: {
                open: open.length,
                halfOpen: circuits.filter((circuit) => circuit.state === 'half-open').length,
                circuits: circuits.map((circuit) => ({
                    method: circuit.method,
                    state: circuit.state,
                    remainingMs: circuit.remainingMs,
                    openCount: circuit.openCount,
                    probeCount: circuit.probeCount,
                })),
            },
        };
    }
}
