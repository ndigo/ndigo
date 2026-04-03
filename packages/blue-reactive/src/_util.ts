/**
 * @author Jeff Rose
 */

import type { EqualsFn, Unsubscribe } from './model';

/**
 * Default equality function using `Object.is`.
 */
export const defaultEquals: EqualsFn<any> = Object.is;

/**
 * Sentinel value indicating that no value has been set yet.
 * Used to differentiate "uninitialized" from "set to undefined".
 */
export const UNINITIALIZED: unique symbol = Symbol('UNINITIALIZED');

/**
 * Manages a set of subscriber functions with add/remove/notify operations.
 *
 * @typeParam T - The type of value passed to subscribers.
 */
export class SubscriptionManager<T> {
    #listeners: Set<(value: T) => void> = new Set();
    #disposed = false;

    /**
     * The current number of active subscribers.
     */
    get size(): number {
        return this.#listeners.size;
    }

    /**
     * Whether this manager has been disposed.
     */
    get disposed(): boolean {
        return this.#disposed;
    }

    /**
     * Adds a subscriber and returns a function to remove it.
     *
     * @param listener - The subscriber function.
     * @returns A function that removes the subscription.
     */
    add(listener: (value: T) => void): Unsubscribe {
        this.#listeners.add(listener);
        return () => {
            this.#listeners.delete(listener);
        };
    }

    /**
     * Notifies all subscribers with the given value.
     *
     * @param value - The value to send to all subscribers.
     */
    notify(value: T): void {
        if (this.#disposed) {
            return;
        }

        for (const listener of this.#listeners) {
            listener(value);
        }
    }

    /**
     * Removes all subscribers and marks this manager as disposed.
     */
    dispose(): void {
        this.#disposed = true;
        this.#listeners.clear();
    }
}

/**
 * Reads a value from a nested object using a dot-separated path.
 *
 * @param obj - The root object.
 * @param path - A dot-separated property path (e.g., `'address.city'`).
 * @returns The value at the path, or `undefined` if any segment is missing.
 */
export function getByPath(obj: any, path: string): any {
    const segments = path.split('.');
    let current = obj;
    for (let i = 0; i < segments.length; i++) {
        if (current == null) {
            return undefined;
        }
        current = current[segments[i]];
    }
    return current;
}

/**
 * Returns a shallow clone of the object with the value at the given
 * dot-separated path replaced. Intermediate objects are also shallow-cloned
 * so the original is not mutated.
 *
 * @param obj - The root object.
 * @param path - A dot-separated property path.
 * @param value - The value to set at the path.
 * @returns A new object with the value at the path replaced.
 */
export function setByPath(obj: any, path: string, value: any): any {
    const segments = path.split('.');
    if (segments.length === 1) {
        return { ...obj, [segments[0]]: value };
    }

    const [head, ...rest] = segments;
    return {
        ...obj,
        [head]: setByPath(obj?.[head] ?? {}, rest.join('.'), value),
    };
}
