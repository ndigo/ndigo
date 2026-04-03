/**
 * @author Jeff Rose
 */

import type { Disposable, ModelOptions, ReadableModel, Unsubscribe } from './model';
import { PropertyModel } from './property-model';

/**
 * A model that wraps a source and provides child models automatically
 * bound to properties of the source value. Each child is identified by
 * a string key that corresponds to a property path on the source.
 *
 * Inspired by Apache Wicket's CompoundPropertyModel pattern where
 * child components inherit their model binding from a parent.
 *
 * @typeParam T - The type of the source model's value (typically an object).
 */
export class CompoundModel<T> implements ReadableModel<T>, Disposable {
    #source: ReadableModel<T>;
    #children: Map<string, PropertyModel<T, any>> = new Map();

    get [Symbol.toStringTag](): string {
        return 'CompoundModel';
    }

    /**
     * Creates a compound model wrapping the given source.
     *
     * @param source - The source model providing the root value.
     */
    constructor(source: ReadableModel<T>) {
        this.#source = source;
    }

    /**
     * Returns the full source value.
     */
    get(): T {
        return this.#source.get();
    }

    /**
     * Subscribes to changes in the full source value.
     *
     * @param listener - Callback invoked with the source value.
     * @returns A function that removes the subscription.
     */
    subscribe(listener: (value: T) => void): Unsubscribe {
        return this.#source.subscribe(listener);
    }

    /**
     * Returns a child model bound to the given property path. Child models
     * are cached — requesting the same path twice returns the same instance.
     *
     * @typeParam R - The type of the property at the given path.
     * @param path - A dot-separated property path (e.g., `'name'` or `'address.city'`).
     * @param options - Optional configuration for the child model.
     * @returns A `PropertyModel` bound to the given path.
     */
    getChildModel<R>(path: string, options?: ModelOptions<R>): PropertyModel<T, R> {
        let child = this.#children.get(path) as PropertyModel<T, R> | undefined;
        if (!child) {
            child = new PropertyModel<T, R>(this.#source, path, options);
            this.#children.set(path, child as PropertyModel<T, any>);
        }
        return child;
    }

    /**
     * Releases all cached child models and their subscriptions.
     */
    dispose(): void {
        for (const child of this.#children.values()) {
            child.dispose();
        }
        this.#children.clear();
    }
}
