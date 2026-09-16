/**
 * A minimal async iterable built from push + complete events.
 *
 * Bridges event-driven transports to `for await` consumers without
 * buffering the whole stream: pushed values are queued; consumers await the
 * next slot. `complete()` ends the stream after the remaining queue has
 * drained.
 *
 * The queue is bounded by `maxQueue` (default unlimited): `push` past the
 * cap drops the incoming frame and fires `onOverflow` once — the inbound
 * flood guard for server sessions (which close the peer with `1009`) and
 * the opt-in watermark for the client's `messages` stream. The consumer's
 * iterator is unaffected (it keeps draining what was queued); the overflow
 * handler owns the policy (close the peer, drop silently, signal).
 *
 * Single-consumer by design: one `iterable()` at a time; ordering is
 * strictly FIFO.
 * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 * @internal
 */
export class AsyncReader<T> {
    readonly #queue: T[] = [];
    readonly #waiter: Array<() => void> = [];
    #completed = false;
    readonly #maxQueue: number;
    readonly #onOverflow: () => void;
    #overflowed = false;

    /**
     * @param maxQueue - Maximum queued values before overflow handling.
     * @param onOverflow - Invoked once when a push hits a full queue.
     */
    constructor(maxQueue: number = Number.POSITIVE_INFINITY, onOverflow: () => void = () => undefined) {
        this.#maxQueue = maxQueue;
        this.#onOverflow = onOverflow;
    }

    /** Queue a value for the consumer. Drops (and overflows) past `maxQueue`. */
    push(value: T): void {
        if (this.#completed || this.#overflowed) {
            return;
        }
        if (this.#queue.length >= this.#maxQueue) {
            this.#overflowed = true;
            this.#onOverflow();
            return;
        }
        const waiter = this.#waiter.shift();
        if (waiter) {
            waiter();
        }
        this.#queue.push(value);
    }

    /** End the stream after the remaining queue drains. Idempotent. */
    complete(): void {
        this.#completed = true;
        while (this.#waiter.length > 0) {
            const waiter = this.#waiter.shift();
            if (waiter) {
                waiter();
            }
        }
    }

    /** Consume the stream: FIFO values, then completion. */
    async *iterable(): AsyncGenerator<T> {
        while (true) {
            while (this.#queue.length > 0) {
                yield this.#queue.shift() as T;
            }
            if (this.#completed) {
                return;
            }
            // eslint-disable-next-line no-await-in-loop -- consumer-pull iterator: each iteration awaits a fresh "next value available" signal; parallelizing is impossible (single stream, ordering required).
            await new Promise<void>((resolve) => this.#waiter.push(resolve));
        }
    }
}