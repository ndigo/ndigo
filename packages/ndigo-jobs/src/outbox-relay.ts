/**
 * `OutboxRelay` — publishes claimed outbox entries and marks them done.
 */
import { FrameworkError } from '@ndigo/core';
import type { AsyncCloseable } from '@ndigo/factory';
import { getErrorMessage } from '@ndigo/util';
import { getLogger, type Logger } from '@ndigo/log';
import {
    likeOutboxStore,
    type OutboxClaimOptions,
    type OutboxEntry,
    type OutboxPublisher,
    type OutboxStore,
} from './outbox';

/**
 * Options for {@link OutboxRelay}.
 */
export interface OutboxRelayOptions {
    /** The store entries are claimed from. */
    store: OutboxStore;
    /** The publisher each claim is handed to. */
    publisher: OutboxPublisher;
    /** Entries per claim; default 100. */
    batchSize?: number;
    /** Claim lease; a crashed publish is retried after it expires; default 60000. */
    leaseMs?: number;
    /** Delay between empty polls; default 1000. */
    pollIntervalMs?: number;
    /** When set, published entries older than this are pruned each pass. */
    retainPublishedMs?: number;
    /** Logger override; default `getLogger('@ndigo/jobs')`. */
    logger?: Logger;
}

/**
 * The relay half of the transactional outbox (AD-72 D-6): polls
 * {@link OutboxStore.claimPending}, publishes through an
 * {@link OutboxPublisher}, then `markPublished`. A failed publish leaves the
 * entry claimed — the lease expiry re-surfaces it — so delivery is
 * at-least-once and consumers must be idempotent.
 *
 * Lifecycle: `SmartLifecycle`, phase 10, auto-start when registered as a
 * entry; `close()` stops and awaits the pass in flight. Direct construction is
 * the standalone/test path.
 */
export class OutboxRelay implements AsyncCloseable {
    /** SmartLifecycle phase: after the store/queue wiring. */
    readonly phase = 10;
    /** Whether the relay auto-starts with the context. */
    readonly isAutoStartup = true;
    readonly #store: OutboxStore;
    readonly #publisher: OutboxPublisher;
    readonly #batchSize: number;
    readonly #leaseMs: number;
    readonly #pollIntervalMs: number;
    readonly #retainPublishedMs: number | undefined;
    readonly #logger: Logger;
    #started = false;
    #closed = false;
    #ticking: Promise<number> | null = null;
    #timer: NodeJS.Timeout | null = null;

    /**
     * Creates a relay over the given store and publisher.
     *
     * @param options - Store, publisher, and relay tuning.
     */
    constructor(options: OutboxRelayOptions) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('OutboxRelay: options are required');
        }
        if (!likeOutboxStore(options.store)) {
            throw new FrameworkError('OutboxRelay: the provided store is not an OutboxStore');
        }
        if (options.publisher === null || typeof options.publisher?.publish !== 'function') {
            throw new FrameworkError('OutboxRelay: the provided publisher does not implement publish()');
        }
        this.#store = options.store;
        this.#publisher = options.publisher;
        this.#batchSize = assertPositiveInteger(options.batchSize ?? 100, 'batchSize');
        this.#leaseMs = assertPositiveInteger(options.leaseMs ?? 60_000, 'leaseMs');
        this.#pollIntervalMs = assertPositiveInteger(options.pollIntervalMs ?? 1000, 'pollIntervalMs');
        if (options.retainPublishedMs !== undefined) {
            assertPositiveInteger(options.retainPublishedMs, 'retainPublishedMs');
        }
        this.#retainPublishedMs = options.retainPublishedMs;
        this.#logger = options.logger ?? getLogger('@ndigo/jobs');
    }

    /**
     * Whether the poll loop is running.
     */
    get isRunning(): boolean {
        return this.#started;
    }

    /**
     * SmartLifecycle start: arms the poll loop (idempotent).
     */
    start(): void {
        if (this.#started || this.#closed) {
            return;
        }
        this.#started = true;
        this.#scheduleNext(0);
    }

    /**
     * SmartLifecycle stop: stops polling; the pass in flight completes.
     */
    stop(): void {
        this.#started = false;
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }

    /**
     * Container teardown: stops and awaits the pass in flight.
     *
     * @returns A promise that resolves once the relay is closed.
     */
    async close(): Promise<void> {
        this.#closed = true;
        this.stop();
        await this.#ticking?.catch(() => undefined);
    }

    /**
     * One relay pass: claims a batch, publishes each entry, marks published
     * entries, optionally prunes retained history. Single-flight.
     *
     * @returns Number of entries published in this pass.
     */
    async tick(): Promise<number> {
        if (this.#closed) {
            throw new FrameworkError('OutboxRelay is closed — a closed relay publishes nothing');
        }
        if (this.#ticking !== null) {
            return this.#ticking;
        }
        this.#ticking = this.#tickInternal().finally(() => {
            this.#ticking = null;
        });
        return this.#ticking;
    }

    async #tickInternal(): Promise<number> {
        const claim: OutboxClaimOptions = { limit: this.#batchSize, leaseMs: this.#leaseMs };
        const entries = await this.#store.claimPending(claim);
        let published = 0;
        for (const entry of entries) {
            // Sequential by design: one entry's publish completes (and is
            // marked) before the next begins, bounding in-flight publishes.
            // eslint-disable-next-line no-await-in-loop -- bounded sequential publishes
            if (await this.#publishEntry(entry)) {
                published += 1;
            }
        }
        if (this.#retainPublishedMs !== undefined) {
            const pruned = await this.#store.prunePublished(this.#retainPublishedMs);
            if (pruned > 0) {
                this.#logger.debug(`[jobs] outbox pruned ${pruned} published entry(ies)`);
            }
        }
        return published;
    }

    /**
     * Publishes one entry and marks it done; a failure leaves the claim in
     * place (the lease expiry re-surfaces the entry).
     *
     * @param entry - The claimed entry.
     * @returns Whether the entry was published.
     */
    async #publishEntry(entry: OutboxEntry): Promise<boolean> {
        try {
            await this.#publisher.publish(entry);
            await this.#store.markPublished(entry.id);
            return true;
        } catch (error) {
            this.#logger.warn(
                `[jobs] outbox entry ${entry.id} ('${entry.type}') failed to publish: ${getErrorMessage(error)} — ` +
                    'the claim lease re-surfaces it'
            );
            return false;
        }
    }

    #scheduleNext(delayMs: number): void {
        if (!this.#started || this.#closed || this.#timer !== null) {
            return;
        }
        this.#timer = setTimeout(() => {
            this.#timer = null;
            void this.#runCycle();
        }, delayMs);
    }

    async #runCycle(): Promise<void> {
        let published = 0;
        try {
            published = await this.tick();
        } catch (error) {
            this.#logger.error(`[jobs] outbox relay cycle failed: ${getErrorMessage(error)}`);
        }
        this.#scheduleNext(published > 0 ? 0 : this.#pollIntervalMs);
    }
}

/**
 * Validates a positive-integer option.
 *
 * @param value - The value to check.
 * @param label - Option name for the error message.
 * @returns The value.
 */
function assertPositiveInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new TypeError(`OutboxRelay: ${label} must be a positive integer, got ${String(value)}`);
    }
    return value;
}
