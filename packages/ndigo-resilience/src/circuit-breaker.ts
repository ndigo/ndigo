/**
 */
import { methodAnnotation, type MethodDescriptor, type MethodInvocation, type MethodInterceptor } from '@ndigo/proxy';

/**
 * `@circuitBreaker` annotation key: methods carrying a
 * {@link CircuitBreakerSpec} are protected by a registered
 * {@link CircuitBreakerInterceptor}.
 *
 * The advice is async: through a woven proxy a `@circuitBreaker`-advised
 * **sync** method returns a Promise even though its declared type is not
 * (the annotation is invisible to the type system). Prefer advising
 * Promise-returning methods.
 */
export const circuitBreaker = methodAnnotation<CircuitBreakerSpec>('circuitBreaker');

/**
 * Circuit-breaking policy for one method (AD-43 D-5): after
 * `failureThreshold` consecutive failures the circuit opens and calls fail
 * fast; once `resetMs` has elapsed a single probe attempt runs the call —
 * success closes the circuit, failure re-opens it with a fresh window.
 */
export interface CircuitBreakerSpec {
    /**
     * Consecutive failures that open the circuit. Defaults to `5`. Must be
     * a positive integer — invalid values fail loudly at weave time.
     */
    failureThreshold?: number;
    /**
     * Milliseconds the circuit stays open before the next call becomes a
     * probe. Defaults to `10_000`. Must be a positive finite number —
     * invalid values fail loudly at weave time.
     */
    resetMs?: number;
}

/**
 * Thrown while a circuit is open: the call was not executed.
 */
export class CircuitOpenError extends Error {
    constructor(method: PropertyKey, entryName: string, remainingMs: number) {
        super(`circuit open for '${entryName}.${String(method)}' — failing fast (reset in ${remainingMs} ms)`);
    }
}

/**
 * Per-method circuit state. One `CircuitBreakerInterceptor` instance owns
 * one circuit per (target type, entry, method) cell. Cells are keyed by the
 * target class in a `WeakMap` — never by a string derived from class *name*
 * — so two distinct classes that happen to share a name can never share a
 * circuit.
 *
 * A cell is created once and **mutated in place** for its whole lifetime:
 * replacing it on every outcome discarded concurrent in-flight reads (three
 * parallel failures could all read `failures: 0` and each write back `1`,
 * never reaching the threshold). `generation` is an epoch counter bumped on
 * every state transition; an outcome whose captured generation no longer
 * matches is stale and must not change the circuit (a slow success from a
 * previous epoch must not re-close a circuit that has since opened).
 */
type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitCell {
    state: CircuitState;
    failures: number;
    openedAt: number;
    generation: number;
}

/**
 * Options for {@link CircuitBreakerInterceptor}.
 */
export interface CircuitBreakerInterceptorOptions {
    /**
     * Time source; defaults to `Date.now`. Inject to drive reset windows
     * deterministically in tests.
     */
    now?: () => number;
}

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RESET_MS = 10_000;

/**
 * Rejects invalid {@link CircuitBreakerSpec} values at weave time (and on
 * hand-built chains) instead of letting them silently invert the policy:
 * `failureThreshold: 0` would open the circuit on the first failure,
 * `NaN` would leave it permanently closed, and `resetMs <= 0` would turn
 * every call after opening into a probe.
 */
function validateCircuitBreakerSpec(spec: CircuitBreakerSpec): void {
    const { failureThreshold, resetMs } = spec;
    if (
        failureThreshold !== undefined &&
        (typeof failureThreshold !== 'number' || !Number.isInteger(failureThreshold) || failureThreshold < 1)
    ) {
        throw new TypeError(
            `@circuitBreaker failureThreshold must be a positive integer — got ${String(failureThreshold)}`
        );
    }
    if (resetMs !== undefined && (typeof resetMs !== 'number' || !Number.isFinite(resetMs) || resetMs <= 0)) {
        throw new TypeError(`@circuitBreaker resetMs must be a positive finite number — got ${String(resetMs)}`);
    }
}

/**
 * Around-advice keeping a per-(entry, method) circuit. Awaits `next()` so it
 * observes the final outcome of the inner chain (AD-43 D-5) — when composed
 * outside a retry interceptor, one chain pass counts as one failure, not one
 * per retry attempt.
 */
export class CircuitBreakerInterceptor implements MethodInterceptor {
    #cells = new WeakMap<Function, Map<string, CircuitCell>>();
    #now: () => number;

    constructor(options: CircuitBreakerInterceptorOptions = {}) {
        this.#now = options.now ?? Date.now;
    }

    matches(method: MethodDescriptor): boolean {
        const spec = method.annotation(circuitBreaker);
        if (spec !== undefined) {
            // Fail loud at weave time, not per call.
            validateCircuitBreakerSpec(spec);
            return true;
        }
        return false;
    }

    async invoke(invocation: MethodInvocation, next: () => unknown): Promise<unknown> {
        const spec = invocation.annotation(circuitBreaker);
        if (spec === undefined) {
            // matches() gates the chain; keep hand-built chains safe.
            return next();
        }
        validateCircuitBreakerSpec(spec);

        const threshold = spec.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
        const resetMs = spec.resetMs ?? DEFAULT_RESET_MS;
        // Cells live under the target class (WeakMap), with the
        // (entry, method) pair as the per-class key — see the cell doc.
        let byMethod = this.#cells.get(invocation.targetType);
        if (byMethod === undefined) {
            byMethod = new Map();
            this.#cells.set(invocation.targetType, byMethod);
        }
        const key = `${invocation.entryName}.${String(invocation.methodName)}`;
        let cell = byMethod.get(key);
        if (cell === undefined) {
            cell = { state: 'closed', failures: 0, openedAt: 0, generation: 0 };
            byMethod.set(key, cell);
        }

        if (cell.state === 'open') {
            const remaining = resetMs - (this.#now() - cell.openedAt);
            if (remaining > 0) {
                throw new CircuitOpenError(invocation.methodName, invocation.entryName, remaining);
            }
            // Reset window elapsed: this caller claims the single half-open
            // probe. Any caller arriving while the probe is in flight sees
            // `half-open` and fails fast — exactly one attempt reaches the
            // tail per window.
            cell.state = 'half-open';
            cell.generation += 1;
        } else if (cell.state === 'half-open') {
            throw new CircuitOpenError(invocation.methodName, invocation.entryName, resetMs);
        }

        // Epoch captured after any claim: an outcome whose generation is no
        // longer current belongs to a superseded circuit state (another
        // call opened/closed/probed meanwhile) and must not change it.
        const generation = cell.generation;

        try {
            const result = await next();
            if (cell.generation === generation) {
                // Any success — including a half-open probe — closes the
                // circuit and clears the failure streak.
                cell.state = 'closed';
                cell.failures = 0;
                cell.openedAt = 0;
            }
            return result;
        } catch (error) {
            if (cell.generation === generation) {
                // Read/increment in place at outcome time: a concurrent
                // failure that completed first is already reflected, so
                // parallel failures accumulate instead of overwriting each
                // other with a stale pre-await read.
                cell.failures += 1;
                if (cell.state === 'half-open' || cell.failures >= threshold) {
                    // A failed probe re-opens immediately with a fresh window;
                    // the generation bump discards the other in-flight outcomes
                    // from the pre-open epoch.
                    cell.state = 'open';
                    cell.failures = 0;
                    cell.openedAt = this.#now();
                    cell.generation += 1;
                }
            }
            throw error;
        }
    }
}
