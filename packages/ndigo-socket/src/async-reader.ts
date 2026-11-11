/**
 * A minimal async iterable built from push + complete events.
 *
 * Bridges event-driven transports to `for await` consumers without
 * buffering the whole stream: pushed values are queued; consumers await the
 * next slot. `complete()` ends the stream after the remaining queue has
 * drained.
 *
 * The queue is bounded by `maxQueue` (count) and/or `maxBytes` (cumulative
 * value size, measured by the optional `sizeOf` mapper): while a bound is
 * exceeded, `push` drops the incoming value and fires `onOverflow` once per
 * overflow episode. The overflow state clears as soon as the consumer
 * drains below the bound, so delivery resumes — a watermark, not a
 * permanent latch. The overflow handler owns the policy (close the peer,
 * drop silently, signal); a handler that closes the producer (server path)
 * typically makes `complete()` follow, ending the stream.
 *
 * Single-consumer by design: one `iterable()` at a time; ordering is
 * strictly FIFO.
 * @internal
 */
import { RingBuffer, Deque } from '@ndigo/core';

/**
 * Push-to-pull adapter: producers `push()` inbound values, consumers iterate or
 * `read()` them. Pending values sit in a ring buffer bounded by count and
 * (optionally) bytes; over a bound the newest values are dropped and
 * `onOverflow` fires once per episode, so one slow reader cannot grow the queue
 * without limit.
 */
export class AsyncReader<T> {
    /**
     * Queue of pending values — a head-indexed ring, not an array: the
     * per-message `shift()` compaction an array would pay is O(n) per
     * dequeue on the hottest path in the socket stack (every inbound
     * message of every session and client stream).
     */
    readonly #queue: RingBuffer<T>;
    readonly #waiter: Deque<() => void> = new Deque<() => void>();
    #completed = false;
    readonly #maxQueue: number;
    readonly #maxBytes: number | null;
    readonly #sizeOf: (value: T) => number;
    readonly #onOverflow: () => void;
    /** True while over a bound: pushes are dropped (newest), overflow fires once per episode. */
    #dropping = false;
    #bytes = 0;

    /**
     * @param maxQueue - Maximum queued values before overflow handling.
     * @param onOverflow - Invoked once when a push hits a full queue.
     * @param options - Optional byte budget: with `sizeOf` and `maxBytes`
     *   set, pushes are also dropped past `maxBytes` cumulative bytes.
     */
    constructor(
        maxQueue: number = Number.POSITIVE_INFINITY,
        onOverflow: () => void = () => undefined,
        options: { maxBytes?: number | null; sizeOf?: (value: T) => number } = {}
    ) {
        this.#maxQueue = maxQueue;
        this.#onOverflow = onOverflow;
        this.#maxBytes = options.maxBytes ?? null;
        this.#sizeOf = options.sizeOf ?? ((): number => 1);
        // Power-of-2 capacity ≥ 16 (RingBuffer's floor); the exact bound
        // is enforced by the length guards below, so rounding up never
        // changes drop semantics.
        this.#queue = new RingBuffer<T>(maxQueue);
    }

    /**
     * Queue a value for the consumer. Drops the incoming value when a
     * bound is exceeded; `onOverflow` fires once per overflow episode.
     *
     * @param value - The value to enqueue.
     */
    push(value: T): void {
        if (this.#completed) {
            return;
        }
        const size = this.#sizeOf(value);
        if (this.#queue.length >= this.#maxQueue || (this.#maxBytes !== null && this.#bytes + size > this.#maxBytes)) {
            if (!this.#dropping) {
                this.#dropping = true;
                this.#onOverflow();
            }
            return;
        }
        const waiter = this.#waiter.shift();
        if (waiter) {
            waiter();
        }
        this.#queue.put(value);
        this.#bytes += size;
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

    /**
     * Consume the stream: FIFO values, then completion. Draining below the
     * bound clears any overflow episode, letting pushes resume.
     *
     * @returns An async generator over the queued values.
     */
    async *iterable(): AsyncGenerator<T> {
        while (true) {
            while (this.#queue.length > 0) {
                const value = this.#queue.get() as T;
                this.#bytes = Math.max(0, this.#bytes - this.#sizeOf(value));
                yield value;
            }
            if (
                this.#dropping &&
                this.#queue.length < this.#maxQueue &&
                (this.#maxBytes === null || this.#bytes < this.#maxBytes)
            ) {
                this.#dropping = false;
            }
            if (this.#completed) {
                return;
            }
            // eslint-disable-next-line no-await-in-loop -- consumer-pull iterator: each iteration awaits a fresh "next value available" signal; parallelizing is impossible (single stream, ordering required).
            await new Promise<void>((resolve) => this.#waiter.push(resolve));
        }
    }
}
