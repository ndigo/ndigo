/**
 * @author Jeff Rose
 */

import type { Disposable, ModelOptions, ReadableModel, Unsubscribe, WritableModel } from './model';
import { SubscriptionManager, defaultEquals, getByPath, setByPath } from './_util';

/**
 * A model that binds to a property path of a source model.
 * Reading returns the value at the path; writing updates the source
 * at the same path (when the source is writable).
 *
 * @typeParam T - The type of the source model's value.
 * @typeParam R - The type of the property at the bound path.
 */
export class PropertyModel<T, R> implements WritableModel<R>, Disposable {
    #source: ReadableModel<T>;
    #path: string;
    #equals: (a: R, b: R) => boolean;
    #subs: SubscriptionManager<R>;
    #unsub: Unsubscribe | null = null;
    #lastValue: R;
    #active = false;

    get [Symbol.toStringTag](): string {
        return 'PropertyModel';
    }

    /**
     * Creates a property model bound to the given path on the source.
     *
     * @param source - The source model.
     * @param path - A dot-separated property path (e.g., `'address.city'`).
     * @param options - Optional configuration including a custom equality function.
     */
    constructor(source: ReadableModel<T>, path: string, options?: ModelOptions<R>) {
        this.#source = source;
        this.#path = path;
        this.#equals = options?.equals ?? defaultEquals;
        this.#subs = new SubscriptionManager<R>();
        this.#lastValue = getByPath(source.get(), path) as R;
    }

    /**
     * Returns the value at the bound path from the source model.
     */
    get(): R {
        return getByPath(this.#source.get(), this.#path) as R;
    }

    /**
     * Sets the value at the bound path on the source model.
     * The source must be a `WritableModel`; otherwise this is a no-op.
     *
     * @param value - The new value for the bound property.
     */
    set(value: R): void {
        const source = this.#source as WritableModel<T>;
        if (typeof source.set !== 'function') {
            return;
        }

        const current = source.get();
        const updated = setByPath(current, this.#path, value) as T;
        source.set(updated);
    }

    /**
     * Applies an updater function to the current property value and stores the result.
     *
     * @param updater - Function receiving the current value and returning the new value.
     */
    update(updater: (value: R) => R): void {
        this.set(updater(this.get()));
    }

    /**
     * Subscribes to changes in the bound property. The listener is called
     * immediately with the current value.
     *
     * @param listener - Callback invoked with the property value.
     * @returns A function that removes the subscription.
     */
    subscribe(listener: (value: R) => void): Unsubscribe {
        const wasEmpty = this.#subs.size === 0;
        const unsub = this.#subs.add(listener);

        if (wasEmpty) {
            this.#activate();
        }

        listener(this.#lastValue);

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
        if (this.#active) {
            return;
        }

        this.#active = true;
        this.#unsub = this.#source.subscribe((sourceValue) => {
            const next = getByPath(sourceValue, this.#path) as R;
            if (this.#equals(this.#lastValue, next)) {
                return;
            }

            this.#lastValue = next;
            this.#subs.notify(next);
        });
    }

    #deactivate(): void {
        if (!this.#active) {
            return;
        }

        this.#active = false;
        if (this.#unsub) {
            this.#unsub();
            this.#unsub = null;
        }
    }
}
