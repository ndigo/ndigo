/**
 * Core job contracts: requests, stored records, and claim options.
 */

/**
 * Identifier of a queued job (a UUID string).
 */
export type JobId = string;

/**
 * A producer-supplied request to enqueue one job.
 *
 * Either `delayMs` or `runAt` may be given (not both): the two spellings of
 * "do not run before". `payload` must be JSON-serializable — drivers fail
 * loud at enqueue on functions, symbols, bigints, and circular structures.
 */
export interface JobRequest {
    /** Job type, matched against registered `@jobHandler` types. */
    type: string;
    /** JSON-serializable payload handed to the handler. */
    payload?: unknown;
    /** Relative delay before the job is eligible (milliseconds). */
    delayMs?: number;
    /** Absolute earliest run time (epoch milliseconds). */
    runAt?: number;
    /** Attempts allowed before the job is failed terminally; default 3. */
    maxAttempts?: number;
    /** Per-execution timeout handed to the handler as an abort signal. */
    timeoutMs?: number;
}

/**
 * A normalized request as stored by a driver: `runAt` and `maxAttempts`
 * are resolved, and `delayMs` is gone.
 */
export interface ResolvedJobRequest {
    /** Job type, matched against registered `@jobHandler` types. */
    type: string;
    /** JSON-serializable payload handed to the handler. */
    payload: unknown;
    /** Absolute earliest run time (epoch milliseconds). */
    runAt: number;
    /** Attempts allowed before terminal failure. */
    maxAttempts: number;
    /** Per-execution timeout, when configured. */
    timeoutMs?: number;
}

/**
 * A stored job as returned by a driver — the record handed to
 * `JobDriver.claim` callers and into handler execution.
 */
export interface JobRecord {
    /** Unique job id. */
    id: JobId;
    /** Job type, matched against registered `@jobHandler` types. */
    type: string;
    /** JSON-serializable payload handed to the handler. */
    payload: unknown;
    /** Attempts claimed so far (1 while the first execution runs). */
    attempts: number;
    /** Attempts allowed before terminal failure. */
    maxAttempts: number;
    /** Earliest run time (epoch milliseconds). */
    runAt: number;
    /** Enqueue time (epoch milliseconds). */
    createdAt: number;
    /** Per-execution timeout, when configured. */
    timeoutMs?: number;
    /** Error message of the most recent failed attempt, when any. */
    lastError?: string;
}

/**
 * Claim window for `JobDriver.claim`.
 */
export interface ClaimOptions {
    /** Maximum number of jobs to claim in one call. */
    limit: number;
    /** Lease duration in milliseconds; the runner heartbeats within it. */
    leaseMs: number;
}
