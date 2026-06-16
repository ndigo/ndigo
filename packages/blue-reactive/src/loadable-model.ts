/**
 * @author Jeff Rose
 */

import { IllegalStateError } from '@blue/core';
import type { Disposable, ReadableModel, Unsubscribe } from './model.js';
import { SubscriptionManager } from './_util.js';

/**
 * Status of a loadable model.
 */
export type LoadableStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * A model that lazily loads its value from an asynchronous source.
 * The value is cached after loading and can be detached to release
 * the cached data, reverting to idle state.
 *
 * @typeParam T - The type of the loaded value.
 */
export class LoadableModel<T> implements ReadableModel<T | undefined>, Disposable {
    #loadFn: () => Promise<T>;
    #value: T | undefined = undefined;
    #status: LoadableStatus = 'idle';
    #error: Error | null = null;
    #subs: SubscriptionManager<T | undefined>;
    #statusSubs: SubscriptionManager<LoadableStatus>;
    #disposed = false;

    get [Symbol.toStringTag](): string {
        return 'LoadableModel';
    }

    /**
     * The current loading status.
     */
    get status(): LoadableStatus {
        return this.#status;
    }

    /**
     * The error from the most recent failed load, or `null` if no error.
     */
    get error(): Error | null {
        return this.#error;
    }

    /**
     * Creates a loadable model with the given async load function.
     *
     * @param loadFn - An async function that produces the value.
     */
    constructor(loadFn: () => Promise<T>) {
        this.#loadFn = loadFn;
        this.#subs = new SubscriptionManager<T | undefined>();
        this.#statusSubs = new SubscriptionManager<LoadableStatus>();
    }

    /**
     * Returns the cached value, or `undefined` if not yet loaded.
     * Triggers a load if the model is idle.
     */
    get(): T | undefined {
        if (this.#status === 'idle') {
            this.load();
        }
        return this.#value;
    }

    /**
     * Subscribes to value changes. The listener is called immediately
     * with the current value (which may be `undefined` if not yet loaded).
     *
     * @param listener - Callback invoked with the value.
     * @returns A function that removes the subscription.
     */
    subscribe(listener: (value: T | undefined) => void): Unsubscribe {
        const unsub = this.#subs.add(listener);
        listener(this.#value);
        if (this.#status === 'idle') {
            this.load();
        }
        return unsub;
    }

    /**
     * Subscribes to status changes. The listener is called immediately
     * with the current status.
     *
     * @param listener - Callback invoked with the status.
     * @returns A function that removes the subscription.
     */
    subscribeStatus(listener: (status: LoadableStatus) => void): Unsubscribe {
        const unsub = this.#statusSubs.add(listener);
        listener(this.#status);
        return unsub;
    }

    /**
     * Triggers a load (or reload). If the model is already loading,
     * this is a no-op.
     */
    load(): void {
        if (this.#disposed || this.#status === 'loading') {
            return;
        }

        this.#setStatus('loading');
        this.#loadFn().then(
            (value) => {
                if (this.#disposed) {
                    return;
                }

                this.#value = value;
                this.#error = null;
                this.#setStatus('loaded');
                this.#subs.notify(value);
            },
            (err) => {
                if (this.#disposed) {
                    return;
                }

                this.#error = err instanceof Error ? err : new IllegalStateError(String(err));
                this.#setStatus('error');
            }
        );
    }

    /**
     * Alias for {@link LoadableModel.load | load}. Triggers a fresh load,
     * discarding any cached value.
     */
    reload(): void {
        this.detach();
        this.load();
    }

    /**
     * Releases the cached value and reverts to idle state.
     * The next call to `get()` or `subscribe()` will trigger a fresh load.
     */
    detach(): void {
        this.#value = undefined;
        this.#error = null;
        this.#setStatus('idle');
        this.#subs.notify(undefined);
    }

    /**
     * Disposes the model, releasing all subscribers and preventing
     * future loads or notifications.
     */
    dispose(): void {
        this.#disposed = true;
        this.#subs.dispose();
        this.#statusSubs.dispose();
    }

    #setStatus(status: LoadableStatus): void {
        this.#status = status;
        this.#statusSubs.notify(status);
    }
}
