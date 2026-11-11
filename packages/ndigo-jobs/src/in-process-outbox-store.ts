/**
 * The in-process reference outbox store (development and tests).
 */
import { FrameworkError, chainComparisons, compareBy, numberComparator, stringComparator } from '@ndigo/core';
import { randomUUID } from 'node:crypto';
import type { JobId } from './job';
import type { OutboxClaimOptions, OutboxEntry, OutboxStore } from './outbox';
import { parseJobPayload, serializeJobPayload } from './request';

/**
 * A stored entry plus its relay state. `leaseExpiresAt` is set while a relay
 * claim is outstanding; `publishedAt` once publication succeeded.
 */
interface StoredOutboxEntry {
    entry: OutboxEntry;
    leaseExpiresAt?: number;
    publishedAt?: number;
}

/**
 * Options for {@link InProcessOutboxStore}.
 */
export interface InProcessOutboxStoreOptions {
    /** Clock override for deterministic tests; defaults to `Date.now`. */
    clock?: () => number;
    /** Id factory override; defaults to `crypto.randomUUID`. */
    idFactory?: () => string;
}

const DEFAULT_CLAIM_LIMIT = 100;
const DEFAULT_LEASE_MS = 60_000;

/**
 * Map-backed {@link OutboxStore} with the full claim/lease semantics but **no
 * transaction to join**: `append` succeeds unconditionally, so it is a test
 * double and development default, not a correctness guarantee (AD-72 D-6).
 * Entries vanish with the process.
 */
export class InProcessOutboxStore implements OutboxStore {
    readonly #entries = new Map<JobId, StoredOutboxEntry>();
    readonly #clock: () => number;
    readonly #idFactory: () => string;
    #closed = false;

    /**
     * Creates a store with optional clock/id overrides.
     *
     * @param options - Clock/id overrides for deterministic tests.
     */
    constructor(options: InProcessOutboxStoreOptions = {}) {
        this.#clock = options.clock ?? Date.now;
        this.#idFactory = options.idFactory ?? randomUUID;
    }

    /**
     * Records one side effect.
     *
     * @param input - Type and payload to record.
     * @returns The stored entry (with id and `occurredAt`).
     */
    async append(input: { type: string; payload?: unknown }): Promise<OutboxEntry> {
        this.#assertOpen();
        if (
            input === null ||
            typeof input !== 'object' ||
            typeof input.type !== 'string' ||
            input.type.trim().length === 0
        ) {
            throw new TypeError(`outbox append: 'type' must be a non-empty string, got ${JSON.stringify(input?.type)}`);
        }
        const entry: OutboxEntry = {
            id: this.#idFactory(),
            type: input.type,
            payload: parseJobPayload(serializeJobPayload(input.payload)),
            occurredAt: this.#clock(),
        };
        this.#entries.set(entry.id, { entry });
        return structuredClone(entry);
    }

    /**
     * Leases up to `limit` unpublished entries whose lease is absent or
     * expired, in `occurredAt` order.
     *
     * @param options - Claim window.
     * @returns The claimed entries.
     */
    async claimPending(options: OutboxClaimOptions = {}): Promise<OutboxEntry[]> {
        this.#assertOpen();
        const limit = options.limit ?? DEFAULT_CLAIM_LIMIT;
        const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
        if (!Number.isSafeInteger(limit) || limit < 1) {
            throw new TypeError(`outbox claim: limit must be a positive integer, got ${String(options.limit)}`);
        }
        if (!Number.isFinite(leaseMs) || leaseMs <= 0) {
            throw new TypeError(`outbox claim: leaseMs must be a positive number, got ${String(options.leaseMs)}`);
        }

        const now = this.#clock();
        const claimable = [...this.#entries.values()]
            .filter(
                (stored) =>
                    stored.publishedAt === undefined &&
                    (stored.leaseExpiresAt === undefined || stored.leaseExpiresAt <= now)
            )
            .sort(
                chainComparisons(
                    compareBy((stored) => stored.entry.occurredAt, numberComparator.compare),
                    compareBy((stored) => stored.entry.id, stringComparator.compare)
                )
            )
            .slice(0, limit);

        const claimed: OutboxEntry[] = [];
        for (const stored of claimable) {
            stored.leaseExpiresAt = now + leaseMs;
            claimed.push(structuredClone(stored.entry));
        }
        return claimed;
    }

    /**
     * Marks an entry as published.
     *
     * @param id - The entry identifier.
     * @returns A promise that resolves once the entry is marked.
     */
    async markPublished(id: JobId): Promise<void> {
        this.#assertOpen();
        const stored = this.#entries.get(id);
        if (stored !== undefined) {
            stored.publishedAt = this.#clock();
        }
    }

    /**
     * Deletes published entries older than the given age.
     *
     * @param olderThanMs - Age in milliseconds.
     * @returns Number of pruned entries.
     */
    async prunePublished(olderThanMs: number): Promise<number> {
        this.#assertOpen();
        const cutoff = this.#clock() - olderThanMs;
        let pruned = 0;
        for (const [id, stored] of this.#entries) {
            if (stored.publishedAt !== undefined && stored.publishedAt <= cutoff) {
                this.#entries.delete(id);
                pruned += 1;
            }
        }
        return pruned;
    }

    /**
     * Number of unpublished entries.
     *
     * @returns The pending count.
     */
    async size(): Promise<number> {
        this.#assertOpen();
        let pending = 0;
        for (const stored of this.#entries.values()) {
            if (stored.publishedAt === undefined) {
                pending += 1;
            }
        }
        return pending;
    }

    /**
     * Releases the store's in-memory entries; idempotent.
     *
     * @returns A promise that resolves once the store is closed.
     */
    async close(): Promise<void> {
        this.#closed = true;
        this.#entries.clear();
    }

    #assertOpen(): void {
        if (this.#closed) {
            throw new FrameworkError('InProcessOutboxStore is closed — a closed store accepts no operations');
        }
    }
}
