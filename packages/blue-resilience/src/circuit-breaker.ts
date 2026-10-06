/**
 * @module blue-resilience
 * @since 1.0.0
 * @author Jeff Rose
 */
import { methodAnnotation, type MethodDescriptor, type MethodInvocation, type MethodInterceptor } from '@blue/proxy';

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
 */
type CircuitState = 'closed' | 'open';

interface CircuitCell {
    state: CircuitState;
    failures: number;
    openedAt: number;
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
        const cell = byMethod.get(key) ?? { state: 'closed', failures: 0, openedAt: 0 };

        if (cell.state === 'open') {
            const remaining = resetMs - (this.#now() - cell.openedAt);
            if (remaining > 0) {
                throw new CircuitOpenError(invocation.methodName, invocation.entryName, remaining);
            }
            // Probe: the next attempt runs; on failure the circuit re-opens.
            try {
                const result = await next();
                byMethod.set(key, { state: 'closed', failures: 0, openedAt: 0 });
                return result;
            } catch (error) {
                byMethod.set(key, { state: 'open', failures: 0, openedAt: this.#now() });
                throw error;
            }
        }

        try {
            const result = await next();
            byMethod.set(key, { state: 'closed', failures: 0, openedAt: 0 });
            return result;
        } catch (error) {
            const failures = cell.failures + 1;
            if (failures >= threshold) {
                byMethod.set(key, { state: 'open', failures, openedAt: this.#now() });
            } else {
                byMethod.set(key, { state: 'closed', failures, openedAt: 0 });
            }
            throw error;
        }
    }
}
