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
 *
 * @since 1.0.0
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
 *
 * @since 1.0.0
 */
export class InProcessJobDriver implements JobDriver {
    readonly kind = 'in-process';
    readonly #jobs = new Map<JobId, StoredJob>();
    readonly #clock: () => number;
    readonly #idFactory: () => string;
    #closed = false;

    /**
     * @param options - Clock/id overrides for deterministic tests.
     */
    constructor(options: InProcessJobDriverOptions = {}) {
        this.#clock = options.clock ?? Date.now;
        this.#idFactory = options.idFactory ?? randomUUID;
    }

    /** @inheritdoc */
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

    /** @inheritdoc */
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

    /** @inheritdoc */
    async complete(id: JobId): Promise<void> {
        this.#assertOpen();
        this.#jobs.delete(id);
    }

    /** @inheritdoc */
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

    /** @inheritdoc */
    async fail(id: JobId, lastError: string): Promise<void> {
        this.#assertOpen();
        void lastError; // terminal errors surface through telemetry/logs, not storage (AD-72 D-2)
        this.#jobs.delete(id);
    }

    /** @inheritdoc */
    async heartbeat(id: JobId, leaseMs: number): Promise<void> {
        this.#assertOpen();
        const stored = this.#jobs.get(id);
        if (stored !== undefined && stored.state === 'running') {
            stored.leaseExpiresAt = this.#clock() + leaseMs;
        }
    }

    /** @inheritdoc */
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

    /** @inheritdoc */
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
