/**
 * @author Jeff Rose
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred}
 */
/**
 */
export default class Deferred<T> {
    promise: Promise<T>;
    /**
     * Fulfills the associated promise with the specified value, or propagates the state of an existing promise. If the associated promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing.
         * @param {T} [value] If this value is not a promise, including undefined, it becomes the fulfillment value of the associated promise. If this value is a promise, then the associated promise will be resolved to the passed promise, and follow the state as the provided promise (including any future transitions).
     */
    resolve: (value?: T | PromiseLike<T>) => void;
    /**
     * Rejects the associated promise with the specified reason. If the promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing.
         * @param {*} [reason] The rejection reason for the associated promise. Although the reason can be undefined, it is generally an {@link external:Error} object, like in exception handling.
     */
    reject: (reason?: any) => void;
    get [Symbol.toStringTag](): string;
    constructor();
}
/**
 */
//# sourceMappingURL=deferred.d.ts.map