/**
 * @author Jeff Rose
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred}
 */
/**
 */
export default class Deferred {
    promise;
    /**
     * Fulfills the associated promise with the specified value, or propagates the state of an existing promise. If the associated promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing.
     * @param {T} [value] If this value is not a promise, including undefined, it becomes the fulfillment value of the associated promise. If this value is a promise, then the associated promise will be resolved to the passed promise, and follow the state as the provided promise (including any future transitions).
     */
    resolve;
    /**
     * Rejects the associated promise with the specified reason. If the promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing.
     * @param {*} [reason] The rejection reason for the associated promise. Although the reason can be undefined, it is generally an {@link external:Error} object, like in exception handling.
     */
    reject;
    get [Symbol.toStringTag]() {
        return 'Deferred';
    }
    constructor() {
        this.resolve = null;
        this.reject = null;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        Object.freeze(this);
    }
}
/**
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJyZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGVmZXJyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUg7R0FDRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sUUFBUTtJQUN6QixPQUFPLENBQWE7SUFFcEI7OztPQUdHO0lBQ0gsT0FBTyxDQUF1QztJQUU5Qzs7O09BR0c7SUFDSCxNQUFNLENBQXlCO0lBRS9CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFRDtRQUNJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFRLEVBQUU7WUFDcEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7Q0FDSjtBQUVEO0dBQ0cifQ==