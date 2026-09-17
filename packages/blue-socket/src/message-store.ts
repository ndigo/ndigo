/**
 * The `/queue` message store contract (D11 hardening, AD-24 direction).
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
 * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RingBuffer } from '@blue/core';
import type { StompBody } from './stomp-frame';

/**
 * Body size as transmitted: UTF-8 octets for text, raw length for bytes.
 * Shared by the store's byte budget and the broker's transaction budget.
 *
 * @param body - The message body.
 * @returns The transmitted octet count.
 */
export function materialOctets(body: StompBody): number {
    return typeof body === 'string' ? new TextEncoder().encode(body).length : body.length;
}

/** A stored `/queue` message — the durable unit behind the backlog. */
export interface StoredQueueMessage {
    /** Broker-issued id; the dedupe key on replay (at-least-once). */
    readonly messageId: string;
    /** The `/queue/<name>` destination the message belongs to. */
    readonly destination: string;
    /** The message body — text or byte-exact binary (D8). */
    readonly body: StompBody;
    /** Extra headers (e.g. `content-type`), copied at append time. */
    readonly headers: Readonly<Record<string, string>>;
    /**
     * Monotonic sequence — the ordering and gap-detection key, issued by
     * the store. Per-destination and 1-based on the memory backend,
     * globally monotonic on libsql; gaps are expected (see the module
     * docblock), so only monotonicity within a replay window is portable.
     */
    readonly seq: number;
    /** Append timestamp (epoch ms) — the retention (TTL) criterion. */
    readonly storedAt: number;
}

/** What a caller asks the store to retain. */
export interface QueueStoreRetention {
    /** Drop messages this old or older (the boundary is inclusive). */
    readonly ttlMs?: number;
    /** Drop the oldest messages past this many per destination. */
    readonly maxMessages?: number;
}

/**
 * The store contract: append, ordered replay, retention pruning.
 *
 * Every method rejects with a `RangeError` when the destination is not a
 * non-empty string (validated identically by every backend).
 */
export interface QueueMessageStore {
    /**
     * Backend identifier for observability/diagnostics
     * (e.g. `'in-memory'`, `'libsql'`, `'redis'`).
     */
    readonly kind: string;

    /**
     * Persist one message and return it with the store-issued `seq` and
     * `storedAt`. Applied in call order per destination. Rejects when the
     * message cannot be stored (the caller owns fail-closed behavior).
     *
     * @param message - The message without store-issued fields.
     * @returns The stored message.
     */
    append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage>;

    /**
     * Replay a destination's messages, oldest first (ascending `seq`,
     * newest last). `afterSeq` resumes after a gap (crash recovery);
     * `limit` bounds the window to the newest `limit` messages (history
     * length) — absent, `NaN` or `+Infinity` means the whole window, and
     * negative values clamp to `0` (empty).
     *
     * @param destination - The `/queue/<name>` destination.
     * @param options - Replay window.
     * @returns The matching messages, append-ordered.
     */
    replay(destination: string, options?: { afterSeq?: number; limit?: number }): Promise<StoredQueueMessage[]>;

    /**
     * Enforce retention on one destination, dropping the oldest messages
     * past the TTL and/or count bound. The TTL boundary is inclusive: a
     * message whose age is exactly `ttlMs` is expired. Idempotent; safe to
     * call on any cadence.
     *
     * @param destination - The `/queue/<name>` destination.
     * @param retention - The policy to enforce.
     * @returns How many messages were pruned.
     */
    prune(destination: string, retention: QueueStoreRetention): Promise<number>;

    /**
     * Whether a destination exists (has live or retained messages).
     *
     * @param destination - The `/queue/<name>` destination.
     * @returns Whether the destination is known to the store.
     */
    has(destination: string): Promise<boolean>;

    /**
     * Optional teardown: release the backend's resources. The store's
     * lifetime is the broker's, so an owner that shut a broker built with a
     * durable store down SHOULD call this at shutdown. Idempotent.
     *
     * Backends document what a call after disposal does: the libsql backend
     * closes its client and every later operation rejects (`CLIENT_CLOSED`);
     * the in-memory backend only forgets its data and stays usable.
     */
    dispose?(): Promise<void> | void;
}

/** Options for {@link InMemoryQueueMessageStore}. */
export interface InMemoryQueueStoreOptions {
    /**
     * Retained messages per destination (oldest dropped past the bound).
     * Default `1000` — parity with the broker's `queueBacklog`. `0`
     * disables the count bound.
     */
    maxMessagesPerDestination?: number;
    /**
     * Distinct destinations retained (the oldest destination is evicted
     * whole past the bound). Default `1000`. `0` disables.
     */
    maxDestinations?: number;
    /**
     * Global retained-byte budget across all destinations (oldest messages
     * evicted first). Default `67108864` (64 MiB) — parity with the
     * broker's `maxBacklogBytes`. `0` disables.
     */
    maxBytes?: number;
    /**
     * Injectable clock for deterministic tests (the registry's `now` clock
     * precedent). Defaults to `Date.now`.
     * @internal
     */
    now?: () => number;
}

/** A snapshot of {@link InMemoryQueueMessageStore} retention ({@link InMemoryQueueMessageStore.stats}). */
export interface InMemoryQueueStoreStats {
    /** Distinct destinations currently retaining at least one message. */
    readonly destinations: number;
    /** Retained body octets across every destination. */
    readonly retainedBytes: number;
    /**
     * Per-destination sequence counters held. Bounded by `destinations`:
     * the counter of a dropped destination is dropped with it (SEC-1).
     */
    readonly seqEntries: number;
}

/**
 * The default {@link QueueMessageStore}: bounded in-memory rings, one per
 * destination — the same shape the broker's live backlog uses, so the
 * durable phase can swap the backing without changing delivery semantics.
 *
 * Every bound is a drop-oldest watermark (matches the broker's fail-closed
 * posture): exceeding a bound never throws — it evicts. Eviction is
 * non-destructive to an in-flight `append`: a ring emptied by the count
 * guard stays attached so the pending write lands in it (COR-9), and a
 * ring that a budget drops whole takes its sequence counter with it, so
 * `#seqs` can never outgrow the destination cap (SEC-1).
 */
export class InMemoryQueueMessageStore implements QueueMessageStore {
    readonly kind = 'in-memory';
    readonly #byDestination = new Map<string, RingBuffer<StoredQueueMessage>>();
    readonly #seqs = new Map<string, number>();
    readonly #maxMessagesPerDestination: number | null;
    readonly #maxDestinations: number | null;
    readonly #maxBytes: number | null;
    readonly #now: () => number;
    #bytes = 0;

    /**
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
        // Global byte budget: evict oldest messages anywhere until under.
        while (this.#maxBytes !== null && this.#bytes > this.#maxBytes) {
            const oldestDestination = this.#byDestination.keys().next().value;
            if (oldestDestination === undefined) {
                break;
            }
            const oldestQueue = this.#byDestination.get(oldestDestination) as RingBuffer<StoredQueueMessage>;
            this.#dropOldest(oldestQueue);
            if (oldestQueue.length === 0) {
                // A drained ring leaves the map so the budget loop advances
                // instead of spinning on an empty head.
                this.#release(oldestDestination, oldestQueue);
            }
        }
        return stored;
    }

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
     * (an in-flight `append` keeps it, {@link #release} drops it with the
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
     * destination cap (SEC-1).
     */
    #release(destination: string, queue: RingBuffer<StoredQueueMessage>): void {
        while (queue.length > 0) {
            this.#dropOldest(queue);
        }
        this.#byDestination.delete(destination);
        this.#seqs.delete(destination);
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
        // Reserve at least the count bound; with bounds disabled, reserve
        // the maximum (2^30 — the ring's lazy allocation means no memory
        // cost until written). The exact bounds are enforced by the
        // watermark guards, never by ring-full overwrite.
        const countCap = this.#maxMessagesPerDestination ?? Number.POSITIVE_INFINITY;
        const byteCap = this.#maxBytes ?? Number.POSITIVE_INFINITY;
        return Math.min(countCap, byteCap);
    }

    #assertDestination(destination: string): string {
        if (typeof destination !== 'string' || destination.length === 0) {
            throw new RangeError(`invalid queue destination: ${String(destination)}`);
        }
        return destination;
    }
}
