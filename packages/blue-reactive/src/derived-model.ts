/**
 * @author Jeff Rose
 */

import type { Disposable, ModelOptions, ReadableModel, Unsubscribe } from './model';
import { SubscriptionManager, defaultEquals, UNINITIALIZED } from './_util';

/**
 * A read-only model whose value is computed from one or more source models.
 *
 * When unobserved (no active subscribers), the derived value is computed
 * lazily on each call to {@link DerivedModel.get | get}. When observed,
 * the value is eagerly maintained and subscribers are notified of changes.
 *
 * @typeParam T - The type of the derived value.
 */
export class DerivedModel<T> implements ReadableModel<T>, Disposable {
    #sources: ReadableModel<any>[];
    #deriveFn: (...values: any[]) => T;
    #equals: (a: T, b: T) => boolean;
    #subs: SubscriptionManager<T>;
    #value: T | typeof UNINITIALIZED = UNINITIALIZED;
    #sourceValues: any[];
    #unsubs: Unsubscribe[] = [];
    #initialized = false;

    get [Symbol.toStringTag](): string {
        return 'DerivedModel';
    }

    /**
     * Creates a derived model.
     *
     * @param sources - The source models whose values feed the derivation function.
     * @param deriveFn - A pure function that computes the derived value from source values.
     * @param options - Optional configuration including a custom equality function.
     */
    constructor(sources: ReadableModel<any>[], deriveFn: (...values: any[]) => T, options?: ModelOptions<T>) {
        this.#sources = sources;
        this.#deriveFn = deriveFn;
        this.#equals = options?.equals ?? defaultEquals;
        this.#subs = new SubscriptionManager<T>();
        this.#sourceValues = new Array(sources.length);
    }

    /**
     * Returns the current derived value. If unobserved, the value is
     * recomputed from the current source values.
     */
    get(): T {
        if (this.#subs.size === 0) {
            const values = this.#sources.map((source) => source.get());
            return this.#deriveFn(...values);
        }

        if (this.#value === UNINITIALIZED) {
            this.#recompute();
        }

        return this.#value as T;
    }

    /**
     * Subscribes to changes in the derived value. The listener is called
     * immediately with the current computed value. While at least one
     * subscriber is active the model eagerly maintains its value.
     *
     * @param listener - Callback invoked with the derived value.
     * @returns A function that removes the subscription.
     */
    subscribe(listener: (value: T) => void): Unsubscribe {
        const wasEmpty = this.#subs.size === 0;
        const unsub = this.#subs.add(listener);

        if (wasEmpty) {
            this.#activate();
        }

        listener(this.#value as T);

        return () => {
            unsub();
            if (this.#subs.size === 0) {
                this.#deactivate();
            }
        };
    }

    /**
     * Releases all subscribers and source subscriptions.
     */
    dispose(): void {
        this.#deactivate();
        this.#subs.dispose();
    }

    #activate(): void {
        if (this.#initialized) {
            return;
        }

        this.#initialized = true;

        let initializing = true;
        this.#unsubs = this.#sources.map((source, index) =>
            source.subscribe((value) => {
                this.#sourceValues[index] = value;
                if (!initializing) {
                    this.#recompute();
                }
            })
        );
        initializing = false;

        this.#recompute();
    }

    #deactivate(): void {
        if (!this.#initialized) {
            return;
        }

        this.#initialized = false;
        for (const unsub of this.#unsubs) {
            unsub();
        }
        this.#unsubs = [];
        this.#value = UNINITIALIZED;
    }

    #recompute(): void {
        const next = this.#deriveFn(...this.#sourceValues);
        if (this.#value !== UNINITIALIZED && this.#equals(this.#value as T, next)) {
            return;
        }

        this.#value = next;
        this.#subs.notify(next);
    }
}
