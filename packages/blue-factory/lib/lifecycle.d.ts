export interface Destroyable {
    destroyed: boolean;
    destroy(): void;
}
export interface AsyncDestroyable extends Destroyable {
    destroy(): Promise<void>;
}
export interface Initializable {
    init(...args: any[]): void;
}
/**
 * @property {boolean} destroyed
 */
/**
 */
/**
 * @extends module:factory.Destroyable
 */
/**
 * @returns {Promise}
 */
/**
 */
/**
 */
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Destroyable|Destroyable}.
 */
export declare const likeDestroyable: (value: any) => value is Destroyable;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Initializable|Initializable}.
 */
export declare const likeInitializable: (value: any) => value is Initializable;
//# sourceMappingURL=lifecycle.d.ts.map