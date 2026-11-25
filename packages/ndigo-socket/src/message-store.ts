/**
 * The `/queue` message store contract (D11 hardening, direction).
 *
 * The broker's durable store-and-forward substrate: an ordered, replayable
 * log of messages per destination. The interface is deliberately backend-
 * agnostic — the shipped `InMemoryQueueMessageStore` is the default, and a
 * libsql adapter (persistence) or Redis adapter (cross-node + durability,
 * post-1.0) implement the same surface. The broker's `/queue` backlog and
 * message history read and write through this contract; nothing in the
 * broker may depend on a backend's internals.
 *
 * All methods are async: durable backends are inherently non-blocking, so
 * the contract requires `Promise` returns from every backend, including the
 * in-memory one (whose methods resolve synchronously). Ordering guarantee:
 * `append` calls are applied in call order per destination, and `replay`
 * returns messages in append order (ascending `seq`).
 *
 * Retention is lossy by design: every bound drops the oldest messages. The
 * per-destination `seq` is a monotonic watermark, not a dense counter —
 * **gaps are expected** wherever messages (or whole destinations) were
 * evicted, and a destination dropped whole restarts at 1. Callers resume
 * with `afterSeq`; they must not assume `seq <= replay.length`.
 *
 * A durable backend holds resources (a connection, a file handle) that
 * outlive the data: the owner releases them through the optional
 * {@link QueueMessageStore.dispose}.
 *
 * At-least-once semantics: `messageId` is the broker-issued dedupe key;
 * replay can redeliver (the broker's D9 ack tracking already tolerates
 * redelivery).
 */
import { RingBuffer } from '@ndigo/core';
import type { STOMPBody } from './stomp-frame';

/**
 * Body size as transmitted: UTF-8 octets for text, raw length for bytes.
 * Shared by the store's byte budget and the broker's transaction budget.
 *
 * @param body - The message body.
 * @returns The transmitted octet count.
 *
 * @example
 * ```ts
 * materialOctets();
 * ```
 */
export function materialOctets(body: STOMPBody): number {
    return typeof body === 'string' ? new TextEncoder().encode(body).length : body.length;
}

/**
 * Serialized header size as transmitted: for every entry, the UTF-8 octets
 * of its name and value plus the `:` separator and the line's EOL. Shared by
 * the broker's header cap and any budget that opts to charge
 * headers alongside the body.
 *
 * @param headers - The frame's headers.
 * @returns The transmitted header octet count.
 *
 * @example
 * ```ts
 * headerOctets();
 * ```
 */
export function headerOctets(headers: Readonly<Record<string, string>>): number {
    let total = 0;
    for (const [name, value] of Object.entries(headers)) {
        total += materialOctets(name) + materialOctets(value) + 2; // ':' + EOL
    }
    return total;
}

import type {
    StoredQueueMessage,
    QueueStoreRetention,
    QueueMessageStore,
    InMemoryQueueStoreOptions,
    InMemoryQueueStoreStats,
} from './message-store-types';

// Re-export moved contracts for backward compat.
export * from './message-store-types';

/**
 * In-memory queue message store.
 *
 * @example
 * ```ts
 * const store = new InMemoryQueueMessageStore();
 * ```
 */
export class InMemoryQueueMessageStore implements QueueMessageStore {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "InMemoryQueueMessageStore".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object InMemoryQueueMessageStore]"
     */
    get [Symbol.toStringTag](): string {
        return 'InMemoryQueueMessageStore';
    }

    /** Store identifier (`'in-memory'`). */
    readonly kind = 'in-memory';
    readonly #byDestination = new Map<string, RingBuffer<StoredQueueMessage>>();
    readonly #seqs = new Map<string, number>();
    readonly #maxMessagesPerDestination: number | null;
    readonly #maxDestinations: number | null;
    readonly #maxBytes: number | null;
    readonly #now: () => number;
    #bytes = 0;

    /**
     * Creates a store with the given retention bounds.
     *
     * @param options - Retained-message bounds. Defaults mirror the
     *   broker's backlog caps; `0`/`null` disables a bound.
     */
    constructor(options: InMemoryQueueStoreOptions = {}) {
        const resolve = (value: number | undefined, fallback: number): number | null =>
            value === undefined || value === null ? fallback : value <= 0 ? null : value;
        this.#maxMessagesPerDestination = resolve(options.maxMessagesPerDestination, 1000);
        this.#maxDestinations = resolve(options.maxDestinations, 1000);
        this.#maxBytes = resolve(options.maxBytes, 64 * 1024 * 1024);
        this.#now = options.now ?? Date.now;
    }

    /**
     * Appends one message to its destination's ring, evicting past the bounds.
     *
     * @param message - The message payload (sequence and stored time are assigned here).
     * @returns The stored message with its assigned `seq` and `storedAt`.
     */
    async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage> {
        const destination = this.#assertDestination(message.destination);
        const nextSeq = (this.#seqs.get(destination) ?? 0) + 1;
        this.#evictDestinationsPastCap(destination);
        let queue = this.#byDestination.get(destination);
        if (queue === undefined) {
            queue = new RingBuffer<StoredQueueMessage>(this.#capacityFor());
            this.#byDestination.set(destination, queue);
        }
        // Per-destination count bound (drop-oldest, O(1)). The ring stays
        // attached even when this empties it: the pending `put` below is a
        // write to THIS ring, so detaching it would silently drop the
        // message (COR-9).
        if (this.#maxMessagesPerDestination !== null && queue.length >= this.#maxMessagesPerDestination) {
            this.#dropOldest(queue);
        }
        const stored: StoredQueueMessage = {
            messageId: message.messageId,
            destination,
            body: message.body,
            headers: { ...message.headers },
            seq: nextSeq,
            storedAt: this.#now(),
        };
        queue.put(stored);
        this.#bytes += materialOctets(stored.body);
        this.#seqs.set(destination, nextSeq);
        // Global byte budget: evict the globally oldest message anywhere
        // until under (REV-010) — not the head of the oldest *destination*,
        // which can be a newer message than another destination's head.
        while (this.#maxBytes !== null && this.#bytes > this.#maxBytes) {
            const victim = this.#oldestDestination();
            if (victim === undefined) {
                break;
            }
            const oldestQueue = this.#byDestination.get(victim) as RingBuffer<StoredQueueMessage>;
            this.#dropOldest(oldestQueue);
            if (oldestQueue.length === 0) {
                // A drained ring leaves the map so the budget loop advances
                // instead of spinning on an empty head.
                this.#release(victim, oldestQueue);
            }
        }
        return stored;
    }

    /**
     * Replays retained messages after a sequence cursor.
     *
     * @param destination - The destination to replay.
     * @param options - Sequence cursor and result limit.
     * @returns The retained messages in sequence order.
     */
    async replay(
        destination: string,
        options: { afterSeq?: number; limit?: number } = {}
    ): Promise<StoredQueueMessage[]> {
        const name = this.#assertDestination(destination);
        const queue = this.#byDestination.get(name);
        if (queue === undefined || queue.length === 0) {
            return [];
        }
        const afterSeq = Math.max(0, Math.floor(options.afterSeq ?? 0));
        // Non-finite limits (`NaN`, `+Infinity`) are unbounded; negative
        // values clamp to `0`. The libsql backend mirrors this exactly.
        const limit = options.limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(options.limit));
        const replayed: StoredQueueMessage[] = [];
        for (const stored of queue) {
            if (stored.seq > afterSeq) {
                replayed.push(stored);
            }
        }
        // `limit` counts the NEWEST messages: keep the tail of the
        // ascending replay.
        if (Number.isFinite(limit) && replayed.length > limit) {
            replayed.splice(0, replayed.length - limit);
        }
        return replayed;
    }

    /**
     * Applies a retention policy to one destination.
     *
     * @param destination - The destination to prune.
     * @param retention - TTL and count bounds.
     * @returns The number of pruned messages.
     */
    async prune(destination: string, retention: QueueStoreRetention): Promise<number> {
        const name = this.#assertDestination(destination);
        const queue = this.#byDestination.get(name);
        if (queue === undefined) {
            return 0;
        }
        const now = this.#now();
        let pruned = 0;
        // TTL first (oldest-first scan), then the count bound. The boundary
        // is inclusive: age === ttlMs is expired (the libsql backend's
        // `stored_at <= cutoff` matches).
        if (retention.ttlMs !== undefined) {
            while (queue.length > 0 && now - (queue.peek()?.storedAt ?? now) >= retention.ttlMs) {
                this.#dropOldest(queue);
                pruned += 1;
            }
        }
        if (retention.maxMessages !== undefined) {
            while (queue.length > retention.maxMessages) {
                this.#dropOldest(queue);
                pruned += 1;
            }
        }
        if (queue.length === 0) {
            this.#release(name, queue);
        }
        return pruned;
    }

    /**
     * Whether a destination currently retains messages.
     *
     * @param destination - The destination to check.
     * @returns `true` when the destination has a retained ring.
     */
    async has(destination: string): Promise<boolean> {
        return this.#byDestination.has(this.#assertDestination(destination));
    }

    /** Retained-destination, byte and sequence-counter totals (observability). */
    get stats(): InMemoryQueueStoreStats {
        return {
            destinations: this.#byDestination.size,
            retainedBytes: this.#bytes,
            seqEntries: this.#seqs.size,
        };
    }

    /**
     * Forget every retained message and destination — the shutdown path.
     * The store stays usable afterwards: the next `append` starts a fresh
     * ring (and `seq` at 1). Idempotent.
     */
    dispose(): void {
        this.#byDestination.clear();
        this.#seqs.clear();
        this.#bytes = 0;
    }

    /**
     * Drop the oldest message and charge its bytes back. Deliberately does
     * NOT detach an emptied ring from `#byDestination` — the caller decides
     * (an in-flight `append` keeps it, `release` drops it with the
     * destination).
     */
    #dropOldest(queue: RingBuffer<StoredQueueMessage>): void {
        const evicted = queue.get();
        if (evicted !== undefined) {
            this.#bytes -= materialOctets(evicted.body);
        }
    }

    /**
     * Forget a destination whole: drain the ring, then drop the destination
     * and its sequence counter together, so `#seqs` cannot outgrow the
     * destination cap.
     */
    #release(destination: string, queue: RingBuffer<StoredQueueMessage>): void {
        while (queue.length > 0) {
            this.#dropOldest(queue);
        }
        this.#byDestination.delete(destination);
        this.#seqs.delete(destination);
    }

    /**
     * The destination whose head message is the globally oldest by
     * `storedAt` (ties resolve to the earliest-inserted destination, so
     * selection is deterministic). Scans destinations — bounded by
     * `maxDestinations` — because the per-destination rings hold no global
     * ordering. Returns `undefined` when every ring is empty.
     */
    #oldestDestination(): string | undefined {
        let victim: string | undefined;
        let oldestAt = Number.POSITIVE_INFINITY;
        for (const [destination, queue] of this.#byDestination) {
            const head = queue.peek();
            if (head !== undefined && head.storedAt < oldestAt) {
                oldestAt = head.storedAt;
                victim = destination;
            }
        }
        return victim;
    }

    #evictDestinationsPastCap(newDestination: string): void {
        if (this.#maxDestinations === null || this.#byDestination.has(newDestination)) {
            return;
        }
        while (this.#byDestination.size >= this.#maxDestinations) {
            const oldest = this.#byDestination.keys().next().value;
            if (oldest === undefined) {
                break;
            }
            this.#release(oldest, this.#byDestination.get(oldest) as RingBuffer<StoredQueueMessage>);
        }
    }

    #capacityFor(): number {
        // The ring must be large enough that the watermark guards — not a
        // full-ring overwrite — decide eviction: `countCap` slots for the
        // count guard, and `byteCap` slots for the byte guard's worst case
        // (the ring can hold at most `byteCap` ≥1-octet messages before the
        // budget is exceeded). A disabled count bound leaves the byte bound
        // as the only cap; with both disabled the ring reserves the maximum
        // (2^30 — allocation is lazy, so no memory cost until written).
        const countCap = this.#maxMessagesPerDestination;
        const byteCap = this.#maxBytes;
        if (countCap === null) {
            return byteCap ?? Number.POSITIVE_INFINITY;
        }
        return byteCap === null ? countCap : Math.max(countCap, byteCap);
    }

    #assertDestination(destination: string): string {
        if (typeof destination !== 'string' || destination.length === 0) {
            throw new RangeError(`invalid queue destination: ${String(destination)}`);
        }
        return destination;
    }
}
