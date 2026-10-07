/**
 * Shared shapes for the resilience lab: upstream modes, breaker snapshots and
 * the machine-readable `/lab/state` document.
 * @module blue-resilience-lab
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * The behaviours the controllable upstream can be put into.
 *
 * - `ok` — every call succeeds.
 * - `error` — every call fails with the configured status.
 * - `fail` — the first `count` consecutive calls fail, then the upstream recovers.
 * - `pattern` — outcomes cycle through a `F`/`S` pattern (`"FFS"` → fail, fail, succeed, repeat).
 * - `delay` — every call succeeds after `delayMs` of latency.
 */
export type UpstreamModeName = 'ok' | 'error' | 'fail' | 'pattern' | 'delay';

/**
 * A normalized upstream behaviour setting.
 */
export interface UpstreamMode {
    /** The behaviour family. */
    readonly mode: UpstreamModeName;
    /** HTTP status used for a failing call (400–599). */
    readonly status: number;
    /** `fail`: how many consecutive calls fail before recovering. */
    readonly count: number;
    /** `pattern`: the `F`/`S` outcome cycle. */
    readonly pattern: string;
    /** `delay`: latency in milliseconds applied before responding. */
    readonly delayMs: number;
}

/**
 * An un-normalized setting as accepted from the control plane (query string or
 * JSON body fields), so numbers may arrive as strings.
 */
export interface UpstreamModeInput {
    /** Behaviour family name. */
    readonly mode?: unknown;
    /** Failure status for `error`/`fail`/`pattern` modes. */
    readonly status?: unknown;
    /** `fail` mode: consecutive failure budget. */
    readonly count?: unknown;
    /** `pattern` mode: `F`/`S` cycle. */
    readonly pattern?: unknown;
    /** `delay` mode: latency in milliseconds. */
    readonly delayMs?: unknown;
}

/**
 * One upstream response as produced by the simulator.
 */
export interface UpstreamOutcome {
    /** Whether the simulated upstream succeeded. */
    readonly ok: boolean;
    /** The HTTP status the upstream responds with. */
    readonly status: number;
    /** The JSON body the upstream responds with. */
    readonly body: Record<string, unknown>;
}

/**
 * The circuit states the `@blue/resilience` breaker can be in.
 */
export type CircuitState = 'closed' | 'open' | 'half-open';

/**
 * The lab's projection of one method's circuit, mirroring the state machine
 * `CircuitBreakerInterceptor` documents (AD-43 D-5).
 */
export interface CircuitSnapshot {
    /** The advised method name. */
    readonly method: string;
    /** Current circuit state. */
    readonly state: CircuitState;
    /** Consecutive failures accumulated while closed. */
    readonly failures: number;
    /** Reset-window start (lab clock milliseconds); `0` while closed. */
    readonly openedAt: number;
    /** Milliseconds left before the next call may probe; `0` unless open. */
    readonly remainingMs: number;
    /** How many times the circuit has opened. */
    readonly openCount: number;
    /** How many probe calls have been claimed. */
    readonly probeCount: number;
}

/**
 * Which consumer path a recorded call came from.
 */
export type ConsumerPath = 'resilient' | 'direct';

/**
 * The outcome of one consumer path invocation, as recorded by the lab.
 */
export interface ConsumerCallResult {
    /** Whether the call returned a value. */
    readonly ok: boolean;
    /** Upstream requests consumed by this invocation (retries included). */
    readonly attempts: number;
    /** The error surfaced when the call failed. */
    readonly error?: { readonly name: string; readonly message: string };
}

/**
 * Per-consumer-path counters and the last surfaced error.
 */
export interface ConsumerPathStats {
    /** Chain passes (policy-advised calls for `resilient`, raw calls for `direct`). */
    readonly calls: number;
    /** Chain passes that returned a value. */
    readonly successes: number;
    /** Chain passes that threw. */
    readonly failures: number;
    /** Failures that never reached the upstream because the circuit was open. */
    readonly failFast: number;
    /** Upstream requests consumed by this path (retries included). */
    readonly upstreamAttempts: number;
    /** The last error surfaced on this path, or `null`. */
    readonly lastError: { name: string; message: string } | null;
}

/**
 * The `/lab/state` document: deterministic, machine-readable lab state.
 */
export interface LabSnapshot {
    /** The lab's clock (real time plus any advanced offset). */
    readonly clock: { now: number; offsetMs: number; iso: string };
    /** Upstream simulator state. */
    readonly upstream: {
        mode: UpstreamMode;
        calls: number;
        failures: number;
        successes: number;
        lastStatus: number | null;
        remainingFailureBudget: number;
        patternIndex: number;
    };
    /** Consumer paths, keyed by route. */
    readonly consumer: { resilient: ConsumerPathStats; direct: ConsumerPathStats };
    /** Circuit state per advised method. */
    readonly circuits: readonly CircuitSnapshot[];
    /** The policies the consumer client is woven with. */
    readonly config: {
        service: string;
        upstreamOrigin: string;
        retryAttempts: number;
        retryBackoff: string;
        failureThreshold: number;
        resetMs: number;
    };
    /** Telemetry counters, the same numbers `/metrics` serves. */
    readonly counters: Readonly<Record<string, number>>;
}
