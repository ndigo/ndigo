/**
 * @module blue-resilience
 * @since 1.0.0
 * @author Jeff Rose
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
     * Delay of the first retry attempt, in milliseconds.
     */
    initialMs: number;
    /**
     * Per-attempt growth factor; defaults to `2`.
     */
    factor?: number;
    /**
     * Upper bound for any delay; growth is capped at this value.
     */
    maxMs?: number;
}

/**
 * Exponential growth: `initialMs * factor^(attempt - 1)`, capped at `maxMs`
 * when provided.
 *
 * @param options - The growth configuration.
 */
export function exponentialBackoff(options: ExponentialBackoffOptions): BackoffPolicy {
    const factor = options.factor ?? 2;

    return {
        delay: (attempt: number) => {
            const raw = options.initialMs * Math.pow(factor, attempt - 1);
            return options.maxMs === undefined ? raw : Math.min(raw, options.maxMs);
        },
    };
}
