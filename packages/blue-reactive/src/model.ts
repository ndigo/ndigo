/**
 * @author Jeff Rose
 */

/**
 * Function that removes a subscription when called.
 */
export type Unsubscribe = () => void;

/**
 * Custom equality function for determining whether a value has changed.
 *
 * @param a - The previous value.
 * @param b - The next value.
 * @returns `true` if the values are considered equal.
 */
export type EqualsFn<T> = (a: T, b: T) => boolean;

/**
 * Options for creating writable or derived models.
 */
export interface ModelOptions<T> {
    /** Custom equality function. Defaults to `Object.is`. */
    equals?: EqualsFn<T>;
}

/**
 * A reactive value container that can be read and observed.
 *
 * @typeParam T - The type of value held by the model.
 */
export interface ReadableModel<T> {
    /**
     * Returns the current value.
     */
    get(): T;

    /**
     * Registers a listener that is invoked whenever the value changes.
     * The listener is called immediately with the current value upon subscription.
     *
     * @param listener - Callback invoked with the new value.
     * @returns A function that removes the subscription when called.
     */
    subscribe(listener: (value: T) => void): Unsubscribe;
}

/**
 * A reactive value container that can be read, written, and observed.
 *
 * @typeParam T - The type of value held by the model.
 */
export interface WritableModel<T> extends ReadableModel<T> {
    /**
     * Replaces the current value. Notifies subscribers if the value has changed
     * according to the configured equality function.
     *
     * @param value - The new value.
     */
    set(value: T): void;

    /**
     * Applies a function to the current value and stores the result.
     * Notifies subscribers if the resulting value has changed.
     *
     * @param updater - A function that receives the current value and returns the new value.
     */
    update(updater: (value: T) => T): void;
}

/**
 * An object that holds resources which can be released.
 */
export interface Disposable {
    /**
     * Releases resources held by this object. After disposal, the object
     * should not be used.
     */
    dispose(): void;
}
