/**
 * @author Jeff Rose
 */

import type { ReadableModel, Unsubscribe } from './model';

/**
 * A read-only model wrapping a fixed value that never changes.
 * Subscribers receive the value immediately upon subscription and
 * are never notified again.
 *
 * @typeParam T - The type of the wrapped value.
 */
export class StaticModel<T> implements ReadableModel<T> {
    #value: T;

    get [Symbol.toStringTag](): string {
        return 'StaticModel';
    }

    /**
     * Creates a new static model.
     *
     * @param value - The immutable value to wrap.
     */
    constructor(value: T) {
        this.#value = value;
    }

    /**
     * Returns the wrapped value.
     */
    get(): T {
        return this.#value;
    }

    /**
     * Calls the listener immediately with the current value and returns a
     * no-op unsubscribe function. Because the value never changes, the
     * listener is never called again.
     *
     * @param listener - Callback invoked once with the current value.
     * @returns A no-op unsubscribe function.
     */
    subscribe(listener: (value: T) => void): Unsubscribe {
        listener(this.#value);
        return () => {};
    }
}
