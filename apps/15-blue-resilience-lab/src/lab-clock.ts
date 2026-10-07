/**
 * The lab's clock: real time plus a control-plane offset, so breaker reset
 * windows can be driven deterministically instead of by sleeping.
 * @module blue-resilience-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
/**
 * A monotonic-enough time source for `CircuitBreakerInterceptor({ now })`.
 *
 * `now()` is `Date.now()` plus an accumulated offset, so a lab is fully
 * deterministic in tests (`POST /lab/clock {"advanceMs":2000}` moves every
 * breaker window) while behaving exactly like wall time when nothing advances
 * it.
 */
export class LabClock {
    #offsetMs = 0;

    /** Milliseconds added on top of the wall clock. */
    get offsetMs(): number {
        return this.#offsetMs;
    }

    /**
     * @returns The current lab time in milliseconds.
     */
    now(): number {
        return Date.now() + this.#offsetMs;
    }

    /**
     * Advances the clock by `advanceMs`.
     *
     * @param advanceMs - A positive, finite number of milliseconds.
     * @returns The new offset.
     * @throws {TypeError} When `advanceMs` is not a positive finite number.
     */
    advance(advanceMs: number): number {
        if (!Number.isFinite(advanceMs) || advanceMs <= 0) {
            throw new TypeError(`clock advanceMs must be a positive finite number — got ${String(advanceMs)}`);
        }
        this.#offsetMs += advanceMs;
        return this.#offsetMs;
    }

    /**
     * Drops the offset, returning the clock to wall time.
     */
    reset(): void {
        this.#offsetMs = 0;
    }
}
