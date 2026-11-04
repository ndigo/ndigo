/**
 * Backend health for the management `/health` aggregate: `UP` while the
 * configured backend is serving, `DOWN` once a Redis-backed process has been
 * closed (or when its connection was never established) — memory mode is `UP`
 * for the life of the process, because a local backend is not a degraded
 * dependency.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { HealthIndicator, HealthResult } from '@ndigo/management';
import type { FanoutBackend } from './fanout-backend';

/** The component name this indicator registers under in `/health`. */
export const BACKEND_HEALTH_COMPONENT = 'redis-fanout-backend';

/**
 * Reports which backend this process is serving from, and whether it is up.
 */
export class BackendHealthIndicator implements HealthIndicator {
    readonly name = BACKEND_HEALTH_COMPONENT;
    readonly #backend: FanoutBackend;

    /**
     * @param backend - The backend to report on.
     */
    constructor(backend: FanoutBackend) {
        this.#backend = backend;
    }

    /**
     * @returns `UP` while the backend is serving; the mode, instance id, and
     *   namespace ride along as details so a boot probe can tell the two modes
     *   apart in one request.
     */
    check(): HealthResult {
        const status = this.#backend.status();
        return { status: status.connected ? 'UP' : 'DOWN', details: { ...status } };
    }
}
