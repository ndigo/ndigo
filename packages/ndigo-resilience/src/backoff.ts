/**
 */

/**
 * Computes the delay before a retry attempt. `attempt` is the 1-based retry
 * number (the first retry after the initial failure is attempt 1). Plain
 * function contract — no scheduling machinery (AD-43 D-4).
 */
export interface BackoffPolicy {
    delay(attempt: number): number;
}

/**
 * Constant delay for every retry attempt.
 *
 * @param ms - The fixed delay in milliseconds.
 */
export function fixedBackoff(ms: number): BackoffPolicy {
    return { delay: () => ms };
}

/**
 * Options for {@link exponentialBackoff}.
 */
export interface ExponentialBackoffOptions {
    /**
     * Delay of the first retry attempt, in milliseconds. Must be a finite,
     * non-negative number — invalid values fail loudly at construction.
     */
    initialMs: number;
    /**
     * Per-attempt growth factor; defaults to `2`. Must be a finite, positive
     * number — invalid values fail loudly at construction.
     */
    factor?: number;
    /**
     * Upper bound for any delay; growth is capped at this value. Must be a
     * finite, non-negative number when provided.
     */
    maxMs?: number;
    /**
     * Random jitter fraction, `0`–`1` (default `0` = deterministic). Each
     * delay is multiplied by `1 - jitter + random * 2 * jitter`, i.e. spread
     * uniformly over ±`jitter` around the computed value, then capped at
     * `maxMs`. Jitter de-synchronizes retries from many clients after a
     * shared outage.
     */
    jitter?: number;
}

/**
 * Exponential growth: `initialMs * factor^(attempt - 1)`, capped at `maxMs`
 * when provided, with optional multiplicative jitter.
 *
 * Options are validated at construction: a `NaN`/negative `initialMs`
 * silently disables backoff (`NaN` delays schedule the next attempt on the
 * next tick), which is exactly the misconfiguration this throws on.
 *
 * @param options - The growth configuration.
 * @throws When an option is not a finite, in-range number.
 */
export function exponentialBackoff(options: ExponentialBackoffOptions): BackoffPolicy {
    const { initialMs, maxMs, jitter } = options;
    const factor = options.factor ?? 2;
    if (typeof initialMs !== 'number' || !Number.isFinite(initialMs) || initialMs < 0) {
        throw new TypeError(
            `exponentialBackoff initialMs must be a finite, non-negative number — got ${String(initialMs)}`
        );
    }
    if (typeof factor !== 'number' || !Number.isFinite(factor) || factor <= 0) {
        throw new TypeError(`exponentialBackoff factor must be a finite, positive number — got ${String(factor)}`);
    }
    if (maxMs !== undefined && (typeof maxMs !== 'number' || !Number.isFinite(maxMs) || maxMs < 0)) {
        throw new TypeError(`exponentialBackoff maxMs must be a finite, non-negative number — got ${String(maxMs)}`);
    }
    if (jitter !== undefined && (typeof jitter !== 'number' || !Number.isFinite(jitter) || jitter < 0 || jitter > 1)) {
        throw new TypeError(`exponentialBackoff jitter must be a number in [0, 1] — got ${String(jitter)}`);
    }

    return {
        delay: (attempt: number) => {
            const raw = initialMs * Math.pow(factor, attempt - 1);
            const spread = jitter === undefined || jitter === 0 ? raw : raw * (1 - jitter + Math.random() * 2 * jitter);
            return maxMs === undefined ? spread : Math.min(spread, maxMs);
        },
    };
}
