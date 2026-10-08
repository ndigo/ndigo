/**
 * The `JobDriver` SPI — the one seam every jobs backend implements.
 *
 * @module blue-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ClaimOptions, JobId, JobRecord, JobRequest } from './job';

/**
 * Storage/transport contract for queued jobs (AD-72 D-2).
 *
 * Semantics every driver must preserve:
 *
 * - **At-least-once.** `attempts` increments at claim time, so a crashed
 *   delivery consumes an attempt and a reclaimed job may execute one final
 *   time when `attempts === maxAttempts`. A driver never loses a job silently.
 * - **Lease-based.** `claim` returns jobs leased for `leaseMs`; expired leases
 *   are reclaimed by the next `claim` call (no sweeper, no leader election).
 * - **JSON payloads.** `enqueue` validates serializability (see
 *   {@link serializeJobPayload}) and stores text, not object graphs.
 * - **Terminal ends.** `complete` and `fail` remove the job from the queue;
 *   `fail` records the error in the caller's telemetry/log, not in storage
 *   (dead-letter inspection is out of scope — AD-72 D-2).
 *
 * Implementations are registered under the `jobDriver` bean; the default is
 * {@link InProcessJobDriver}, which is explicitly non-durable.
 *
 * @since 1.0.0
 */
export interface JobDriver {
    /** Backend discriminator (`'in-process'`, `'libsql'`, `'redis'`). */
    readonly kind: string;

    /**
     * Stores one job and makes it eligible at its resolved `runAt`.
     *
     * @param request - The producer-supplied job request.
     * @returns The stored record.
     */
    enqueue(request: JobRequest): Promise<JobRecord>;

    /**
     * Atomically leases up to `limit` eligible jobs: expired leases are
     * reclaimed first, then ready jobs (in `runAt`, then `createdAt` order)
     * are claimed, `attempts` is incremented, and a lease of `leaseMs` starts.
     *
     * @param options - Claim window.
     * @returns The claimed records (possibly empty).
     */
    claim(options: ClaimOptions): Promise<JobRecord[]>;

    /**
     * Removes a finished job.
     *
     * @param id - The job identifier.
     */
    complete(id: JobId): Promise<void>;

    /**
     * Returns a job to the queue at `runAt` with the failure recorded.
     *
     * @param id - The job identifier.
     * @param runAt - Next eligible time (epoch milliseconds).
     * @param lastError - Message from the failed attempt.
     */
    retry(id: JobId, runAt: number, lastError: string): Promise<void>;

    /**
     * Terminally fails a job, removing it from the queue.
     *
     * @param id - The job identifier.
     * @param lastError - Message from the final failed attempt.
     */
    fail(id: JobId, lastError: string): Promise<void>;

    /**
     * Extends the lease of a running job.
     *
     * **Ordering contract (AD72-M3):** the runner awaits its last in-flight
     * heartbeat before any terminal transition (`complete`/`retry`/`fail`),
     * so a driver never receives a heartbeat for a job it just removed. A
     * driver MUST still tolerate a heartbeat that is a no-op: another worker
     * may have reclaimed the lease (expired) or completed the job before the
     * beat lands — extending only a still-valid lease is the reference
     * behavior (`RedisJobDriver.HEARTBEAT_SCRIPT`), and a check-then-mutate
     * pair MUST be atomic (one script/statement) so a stale beat can never
     * re-lease a job a concurrent claim just moved.
     *
     * @param id - The job identifier.
     * @param leaseMs - New lease duration from now.
     */
    heartbeat(id: JobId, leaseMs: number): Promise<void>;

    /**
     * Number of jobs pending delivery: queued plus leased (running).
     *
     * @returns The pending count.
     */
    size(): Promise<number>;

    /**
     * Releases driver resources (closes owned clients; idempotent). New
     * operations on a closed driver fail loud.
     */
    close(): Promise<void>;
}

/**
 * Structural check for a {@link JobDriver} value.
 *
 * @param value - The value to test.
 * @returns Whether the value behaves like a job driver.
 */
export const likeJobDriver = (value: unknown): value is JobDriver => {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const driver = value as JobDriver; // structural check below
    return (
        typeof driver.enqueue === 'function' &&
        typeof driver.claim === 'function' &&
        typeof driver.complete === 'function' &&
        typeof driver.retry === 'function' &&
        typeof driver.fail === 'function' &&
        typeof driver.heartbeat === 'function' &&
        typeof driver.size === 'function' &&
        typeof driver.close === 'function'
    );
};
