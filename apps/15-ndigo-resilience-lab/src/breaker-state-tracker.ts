/**
 * The lab's projection of the `CircuitBreakerInterceptor` state machine.
 *
 * `@ndigo/resilience` keeps circuit cells private, so the lab weaves this
 * interceptor *outside* the breaker (lowest `order` — closest to the caller)
 * and mirrors AD-43 D-5 exactly: one chain pass is one outcome, `failureThreshold`
 * consecutive failures open the circuit, the first call after `resetMs` is a
 * probe, a successful probe closes and a failed probe re-opens with a fresh
 * window. The projection never decides anything — the real breaker's
 * `CircuitOpenError` remains the authority, which is why the tests can assert
 * both the projected state and the fail-fast error class.
 */
import { CircuitOpenError, circuitBreaker } from '@ndigo/resilience';
import type { MethodDescriptor, MethodInterceptor, MethodInvocation } from '@ndigo/proxy';
import { getErrorMessage } from '@ndigo/util';
import type { CircuitSnapshot, CircuitState } from './lab-types';

/** A breaker state transition or outcome the lab counts and reports. */
export type BreakerEventKind = 'success' | 'failure' | 'fail-fast' | 'open' | 'probe' | 'close';

/**
 * One observed breaker outcome.
 */
export interface BreakerEvent {
    /** The advised method name. */
    readonly method: string;
    /** What happened. */
    readonly kind: BreakerEventKind;
    /** The error message, for `failure` events. */
    readonly message?: string;
}

/**
 * Receives breaker events as the interceptor observes them.
 */
export interface BreakerObserver {
    /** Records one event. */
    observe(event: BreakerEvent): void;
}

/**
 * Mirrored circuit state for one advised method.
 */
interface CircuitCell {
    state: CircuitState;
    failures: number;
    openedAt: number;
    openCount: number;
    probeCount: number;
    threshold: number;
    resetMs: number;
}

/**
 * Options for {@link BreakerStateTracker}.
 */
export interface BreakerStateTrackerOptions {
    /** Time source shared with the real breaker (the lab's clock). */
    readonly now: () => number;
    /** Receives every outcome and transition. */
    readonly observer?: BreakerObserver;
}

/** Failure threshold when a method's `@circuitBreaker` omits one. */
const DEFAULT_THRESHOLD = 5;

/** Reset window when a method's `@circuitBreaker` omits one. */
const DEFAULT_RESET_MS = 10_000;

/**
 * Observes the outcome of every `@circuitBreaker`-advised call and keeps the
 * lab's read-only view of the circuit.
 */
export class BreakerStateTracker implements MethodInterceptor {
    /**
     * Outermost position: it must see the final outcome of the whole inner
     * chain (breaker → retry → method), never an individual retry attempt.
     */
    readonly order = -100;

    readonly #cells = new Map<string, CircuitCell>();
    readonly #now: () => number;
    readonly #observer?: BreakerObserver;

    /**
     * @param options - The shared time source and the event observer.
     */
    constructor(options: BreakerStateTrackerOptions) {
        this.#now = options.now;
        this.#observer = options.observer;
    }

    /** Projects only methods carrying the `@circuitBreaker` annotation. */
    matches(method: MethodDescriptor): boolean {
        return method.annotation(circuitBreaker) !== undefined;
    }

    /**
     * Records the call's outcome and returns it unchanged.
     *
     * @param invocation - The intercepted call.
     * @param next - Continues the chain (breaker → retry → method).
     * @returns Whatever the inner chain produced or threw.
     */
    async invoke(invocation: MethodInvocation, next: () => unknown): Promise<unknown> {
        const spec = invocation.annotation(circuitBreaker) ?? {};
        const method = String(invocation.methodName);
        const cell = this.#cell(method, spec.failureThreshold ?? DEFAULT_THRESHOLD, spec.resetMs ?? DEFAULT_RESET_MS);

        let claimedProbe = false;
        if (cell.state === 'open' && this.#now() - cell.openedAt >= cell.resetMs) {
            // Reset window elapsed: the breaker will let exactly one caller
            // through as a probe; project that before the call runs.
            cell.state = 'half-open';
            cell.probeCount += 1;
            claimedProbe = true;
            this.#observer?.observe({ method, kind: 'probe' });
        }

        try {
            const result = await next();
            if (cell.state !== 'closed') {
                cell.state = 'closed';
                cell.failures = 0;
                cell.openedAt = 0;
            }
            this.#observer?.observe({ method, kind: claimedProbe ? 'close' : 'success' });
            return result;
        } catch (error) {
            if (error instanceof CircuitOpenError) {
                // Fail fast: the method never ran, so the streak is untouched.
                this.#observer?.observe({ method, kind: 'fail-fast' });
                throw error;
            }
            this.#observer?.observe({ method, kind: 'failure', message: getErrorMessage(error) });
            if (cell.state === 'half-open') {
                // A failed probe re-opens immediately with a fresh window.
                this.#open(cell, method);
            } else if (!claimedProbe) {
                cell.failures += 1;
                if (cell.failures >= cell.threshold) {
                    this.#open(cell, method);
                }
            }
            throw error;
        }
    }

    /**
     * The lab's read-only view of every circuit it has observed.
     */
    snapshots(): CircuitSnapshot[] {
        const now = this.#now();
        return Array.from(this.#cells, ([method, cell]) => ({
            method,
            state: cell.state,
            failures: cell.failures,
            openedAt: cell.openedAt,
            remainingMs: cell.state === 'open' ? Math.max(0, cell.resetMs - (now - cell.openedAt)) : 0,
            openCount: cell.openCount,
            probeCount: cell.probeCount,
        }));
    }

    #cell(method: string, threshold: number, resetMs: number): CircuitCell {
        let cell = this.#cells.get(method);
        if (cell === undefined) {
            cell = { state: 'closed', failures: 0, openedAt: 0, openCount: 0, probeCount: 0, threshold, resetMs };
            this.#cells.set(method, cell);
        }
        return cell;
    }

    #open(cell: CircuitCell, method: string): void {
        cell.state = 'open';
        cell.failures = 0;
        cell.openedAt = this.#now();
        cell.openCount += 1;
        this.#observer?.observe({ method, kind: 'open' });
    }
}
