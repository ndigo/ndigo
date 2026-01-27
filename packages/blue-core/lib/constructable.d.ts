/**
 * @author Jeff Rose
 */
export type Constructable<T = {}> = new (...args: any[]) => T;
/**
 * @property {T} [prototype]
 */
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Constructable|Constructable}.
 * @remarks TODO: This is actually not a great test since prototype is optional - JBR
 */
export declare const likeConstructable: (value: any) => value is Constructable;
//# sourceMappingURL=constructable.d.ts.map