/**
 * @author Jeff Rose
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred}
 */

/**
 * Represents a deferred computation, providing a way to create a Promise that can be resolved or rejected externally.
 * @template T - The type of the resolved value of the promise.
 */
export default class Deferred<T> {
    /**
     * The Promise instance associated with this Deferred object.
     */
    promise: Promise<T>;

    /**
     * Fulfills the associated promise with the specified value, or propagates the state of an existing promise.
     * If the associated promise has already been resolved, this method does nothing.
     * @param value - If this value is not a promise, it becomes the fulfillment value of the associated promise.
     *                If this value is a promise, then the associated promise will be resolved to the passed promise.
     */
    resolve: (value?: T | PromiseLike<T>) => void;

    /**
     * Rejects the associated promise with the specified reason.
     * If the promise has already been resolved, this method does nothing.
     * @param reason - The rejection reason for the associated promise. Typically an `Error` object.
     */
    reject: (reason?: any) => void;

    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'Deferred';
    }

    /**
     * Creates a new Deferred instance.
     * Initializes a new Promise and exposes its `resolve` and `reject` functions.
     */
    constructor() {
        this.resolve = null;
        this.reject = null;

        this.promise = new Promise<T>((resolve, reject): void => {
            this.resolve = resolve;
            this.reject = reject;
        });

        Object.freeze(this);
    }
}

/**
 */
