/**
 * @author Jeff Rose
 */

import type { Disposable, ModelOptions, Unsubscribe, WritableModel } from './model';
import { SubscriptionManager, defaultEquals } from './_util';
import { isBatching, scheduleBatchFlush } from './batch';

/**
 * A writable reactive value container. Subscribers are notified whenever
 * the value changes according to the configured equality function.
 *
 * @typeParam T - The type of the held value.
 */
export class MutableModel<T> implements WritableModel<T>, Disposable {
    #value: T;
    #equals: (a: T, b: T) => boolean;
    #subs: SubscriptionManager<T>;
    #pendingValue: T;
    #hasPending = false;

    get [Symbol.toStringTag](): string {
        return 'MutableModel';
    }

    /**
     * Creates a writable model with an initial value.
     *
     * @param value - The initial value.
     * @param options - Optional configuration including a custom equality function.
     */
    constructor(value: T, options?: ModelOptions<T>) {
        this.#value = value;
        this.#pendingValue = value;
        this.#equals = options?.equals ?? defaultEquals;
        this.#subs = new SubscriptionManager<T>();
    }

    /**
     * Returns the current value.
     */
    get(): T {
        return this.#value;
    }

    /**
     * Replaces the current value. If a batch is active, notification
     * is deferred until the batch completes.
     *
     * @param value - The new value.
     */
    set(value: T): void {
        if (isBatching()) {
            this.#pendingValue = value;
            if (!this.#hasPending) {
                this.#hasPending = true;
                scheduleBatchFlush(() => this.#flush());
            }
            return;
        }

        if (this.#equals(this.#value, value)) {
            return;
        }

        this.#value = value;
        this.#subs.notify(value);
    }

    /**
     * Applies an updater function to the current value and stores the result.
     *
     * @param updater - Function that receives the current value and returns the new value.
     */
    update(updater: (value: T) => T): void {
        this.set(updater(this.#value));
    }

    /**
     * Subscribes to value changes. The listener is called immediately
     * with the current value.
     *
     * @param listener - Callback invoked with the new value on each change.
     * @returns A function that removes the subscription.
     */
    subscribe(listener: (value: T) => void): Unsubscribe {
        const unsub = this.#subs.add(listener);
        listener(this.#value);
        return unsub;
    }

    /**
     * Releases all subscribers and prevents future notifications.
     */
    dispose(): void {
        this.#subs.dispose();
    }

    #flush(): void {
        this.#hasPending = false;
        const pending = this.#pendingValue;

        if (this.#equals(this.#value, pending)) {
            return;
        }

        this.#value = pending;
        this.#subs.notify(pending);
    }
}
