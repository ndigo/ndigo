/**
 * The in-process reference driver: full contract semantics, no durability.
 */
import { FrameworkError } from '@ndigo/core';
import type { ClaimOptions, JobId, JobRecord, JobRequest } from './job';
import type { JobDriver } from './job-driver';
import { parseJobPayload, resolveJobRequest, serializeJobPayload } from './request';
import { randomUUID } from 'node:crypto';

/**
 * A stored job plus its delivery state. `leaseExpiresAt` is set only while
 * `state === 'running'`.
 */
interface StoredJob {
    record: JobRecord;
    state: 'queued' | 'running';
    leaseExpiresAt?: number;
}

/**
 * Options for {@link InProcessJobDriver}.
 */
export interface InProcessJobDriverOptions {
    /** Clock override for deterministic tests; defaults to `Date.now`. */
    clock?: () => number;
    /** Id factory override; defaults to `crypto.randomUUID`. */
    idFactory?: () => string;
}

/**
 * Map-backed {@link JobDriver} with the full contract semantics — `runAt`
 * ordering, attempts-at-claim, lease expiry reclaimed inside `claim`, and
 * terminal `complete`/`fail`.
 *
 * **Not durable**: jobs vanish with the process. It is the zero-wiring default
 * for development and tests; register a durable driver (`LibSQLJobStore`,
 * `RedisJobDriver`) for work that must survive a restart (AD-72 D-1).
 *
 * Payloads round-trip through JSON like every driver, so handlers see the
 * same shape they would after a restart.
 */
export class InProcessJobDriver implements JobDriver {
    /** Backend identifier (`'in-process'`). */
    readonly kind = 'in-process';
    readonly #jobs = new Map<JobId, StoredJob>();
    readonly #clock: () => number;
    readonly #idFactory: () => string;
    #closed = false;

    /**
     * Creates a driver with optional clock/id overrides.
     *
     * @param options - Clock/id overrides for deterministic tests.
     */
    constructor(options: InProcessJobDriverOptions = {}) {
        this.#clock = options.clock ?? Date.now;
        this.#idFactory = options.idFactory ?? randomUUID;
    }

    /**
     * Stores one job and makes it eligible at its resolved `runAt`.
     *
     * @param request - The producer-supplied job request.
     * @returns The stored record.
     */
    async enqueue(request: JobRequest): Promise<JobRecord> {
        this.#assertOpen();
        const now = this.#clock();
        const resolved = resolveJobRequest(request, now);
        const record: JobRecord = {
            id: this.#idFactory(),
            type: resolved.type,
            payload: parseJobPayload(serializeJobPayload(resolved.payload)),
            attempts: 0,
            maxAttempts: resolved.maxAttempts,
            runAt: resolved.runAt,
            createdAt: now,
            ...(resolved.timeoutMs !== undefined ? { timeoutMs: resolved.timeoutMs } : {}),
        };
        this.#jobs.set(record.id, { record, state: 'queued' });
        return structuredClone(record);
    }

    /**
     * Atomically leases up to `limit` eligible jobs, reclaiming expired leases
     * first.
     *
     * @param options - Claim window.
     * @returns The claimed records (possibly empty).
     */
    async claim(options: ClaimOptions): Promise<JobRecord[]> {
        this.#assertOpen();
        assertClaimOptions(options);
        const now = this.#clock();

        for (const stored of this.#jobs.values()) {
            if (stored.state === 'running' && stored.leaseExpiresAt !== undefined && stored.leaseExpiresAt <= now) {
                stored.state = 'queued';
                stored.leaseExpiresAt = undefined;
            }
        }

        const ready = [...this.#jobs.values()]
            .filter((stored) => stored.state === 'queued' && stored.record.runAt <= now)
            .sort(
                (left, right) =>
                    left.record.runAt - right.record.runAt || left.record.createdAt - right.record.createdAt
            );

        const claimed: JobRecord[] = [];
        for (const stored of ready.slice(0, options.limit)) {
            stored.record.attempts += 1;
            stored.state = 'running';
            stored.leaseExpiresAt = now + options.leaseMs;
            claimed.push(structuredClone(stored.record));
        }
        return claimed;
    }

    /**
     * Removes a finished job.
     *
     * @param id - The job identifier.
     * @returns A promise that resolves once the job is removed.
     */
    async complete(id: JobId): Promise<void> {
        this.#assertOpen();
        this.#jobs.delete(id);
    }

    /**
     * Returns a job to the queue at `runAt` with the failure recorded.
     *
     * @param id - The job identifier.
     * @param runAt - Next eligible time (epoch milliseconds).
     * @param lastError - Message from the failed attempt.
     * @returns A promise that resolves once the job is requeued.
     */
    async retry(id: JobId, runAt: number, lastError: string): Promise<void> {
        this.#assertOpen();
        const stored = this.#jobs.get(id);
        if (stored === undefined) {
            return;
        }
        stored.state = 'queued';
        stored.leaseExpiresAt = undefined;
        stored.record.runAt = runAt;
        stored.record.lastError = lastError;
    }

    /**
     * Terminally fails a job, removing it from the queue.
     *
     * @param id - The job identifier.
     * @param lastError - Message from the final failed attempt.
     * @returns A promise that resolves once the job is removed.
     */
    async fail(id: JobId, lastError: string): Promise<void> {
        this.#assertOpen();
        void lastError; // terminal errors surface through telemetry/logs, not storage (AD-72 D-2)
        this.#jobs.delete(id);
    }

    /**
     * Extends the lease of a running job; a no-op when the lease is no longer
     * valid.
     *
     * @param id - The job identifier.
     * @param leaseMs - New lease duration from now.
     * @returns A promise that resolves once the lease is extended.
     */
    async heartbeat(id: JobId, leaseMs: number): Promise<void> {
        this.#assertOpen();
        const stored = this.#jobs.get(id);
        if (stored !== undefined && stored.state === 'running') {
            stored.leaseExpiresAt = this.#clock() + leaseMs;
        }
    }

    /**
     * Number of jobs pending delivery: queued plus leased (running).
     *
     * @returns The pending count.
     */
    async size(): Promise<number> {
        this.#assertOpen();
        let pending = 0;
        for (const stored of this.#jobs.values()) {
            if (stored.state === 'queued' || stored.state === 'running') {
                pending += 1;
            }
        }
        return pending;
    }

    /**
     * Releases the driver's in-memory jobs; idempotent.
     *
     * @returns A promise that resolves once the driver is closed.
     */
    async close(): Promise<void> {
        this.#closed = true;
        this.#jobs.clear();
    }

    #assertOpen(): void {
        if (this.#closed) {
            throw new FrameworkError('InProcessJobDriver is closed — a closed driver accepts no operations');
        }
    }
}

/**
 * Validates a claim window (positive integer limit, positive finite lease).
 *
 * @param options - The claim options to validate.
 */
function assertClaimOptions(options: ClaimOptions): void {
    if (!Number.isSafeInteger(options.limit) || options.limit < 1) {
        throw new TypeError(`claim: limit must be a positive integer, got ${String(options.limit)}`);
    }
    if (!Number.isFinite(options.leaseMs) || options.leaseMs <= 0) {
        throw new TypeError(`claim: leaseMs must be a positive number, got ${String(options.leaseMs)}`);
    }
}
