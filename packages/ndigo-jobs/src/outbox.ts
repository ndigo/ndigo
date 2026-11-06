/**
 * Transactional-outbox contracts: store, publisher, and the jobs publisher.
 */
import { like } from '@ndigo/util/types';
import type { AsyncCloseable } from '@ndigo/factory';

import type { JobId } from './job';
import type { JobQueue } from './job-queue';

/**
 * One recorded side effect awaiting publication.
 *
 * @since 1.0.0
 */
export interface OutboxEntry {
    /** Entry identifier. */
    id: JobId;
    /** Publication type — the job type when published through {@link JobOutboxPublisher}. */
    type: string;
    /** JSON-serializable payload. */
    payload: unknown;
    /** When the producing transaction recorded the entry (epoch milliseconds). */
    occurredAt: number;
}

/**
 * Claim window for {@link OutboxStore.claimPending}.
 *
 * @since 1.0.0
 */
export interface OutboxClaimOptions {
    /** Maximum entries per claim; default 100. */
    limit?: number;
    /** Claim lease in milliseconds; default 60000. */
    leaseMs?: number;
}

/**
 * Durable store for outbox entries (AD-72 D-6).
 *
 * The defining property is **transactional append**: when the backend is
 * transactional (e.g. `LibSQLOutboxStore` sharing the data source's client),
 * `append` called inside `@transactional` joins the caller's transaction —
 * commit publishes, rollback discards. Entry payloads follow the same
 * JSON-serializability contract as job payloads.
 *
 * Publication is at-least-once: a claimed entry becomes claimable again after
 * its lease expires (crashed relay, failed publish), so consumers subscribe
 * idempotently.
 *
 * @since 1.0.0
 */
export interface OutboxStore extends AsyncCloseable {
    /**
     * Records one side effect.
     *
     * @param entry - Type and payload to record.
     * @returns The stored entry (with id and `occurredAt`).
     */
    append(entry: { type: string; payload?: unknown }): Promise<OutboxEntry>;

    /**
     * Leases up to `limit` unpublished entries whose lease is absent or
     * expired, in `occurredAt` order.
     *
     * @param options - Claim window.
     * @returns The claimed entries.
     */
    claimPending(options?: OutboxClaimOptions): Promise<OutboxEntry[]>;

    /**
     * Marks an entry as published (terminal for relaying; may be retained).
     *
     * @param id - The entry identifier.
     */
    markPublished(id: JobId): Promise<void>;

    /**
     * Deletes published entries older than the given age.
     *
     * @param olderThanMs - Age in milliseconds.
     * @returns Number of pruned entries.
     */
    prunePublished(olderThanMs: number): Promise<number>;

    /**
     * Number of unpublished entries.
     *
     * @returns The pending count.
     */
    size(): Promise<number>;

    /**
     * Releases store resources (idempotent).
     */
    close(): Promise<void>;
}

/**
 * Structural check for an {@link OutboxStore} value.
 *
 * @param value - The value to test.
 * @returns Whether the value behaves like an outbox store.
 */
export const likeOutboxStore = (value: unknown): value is OutboxStore =>
    like({
        append: Function,
        claimPending: Function,
        markPublished: Function,
        prunePublished: Function,
        size: Function,
        close: Function,
    })(value);

/**
 * Publishes one outbox entry. Implementations must be idempotent-friendly:
 * a failed publish is retried after the claim lease expires.
 *
 * @since 1.0.0
 */
export interface OutboxPublisher {
    /**
     * Publishes one entry.
     *
     * @param entry - The claimed entry.
     */
    publish(entry: OutboxEntry): Promise<void>;
}

/**
 * The canonical publisher: outbox entries become jobs on a {@link JobQueue}
 * (`type` → job type, `payload` → job payload) — the transactional side
 * effect of `outbox.append(…)` is delivered through the durable queue.
 *
 * @since 1.0.0
 */
export class JobOutboxPublisher implements OutboxPublisher {
    readonly #queue: JobQueue;

    /**
     * @param queue - The queue entries are enqueued on.
     */
    constructor(queue: JobQueue) {
        this.#queue = queue;
    }

    /** @inheritdoc */
    async publish(entry: OutboxEntry): Promise<void> {
        await this.#queue.enqueue({ type: entry.type, payload: entry.payload });
    }
}
