/**
 * @author Jeff Rose
 */
export type primitive = boolean | null | number | string | symbol | bigint | undefined;
/**
 * A primitive is data that is not an object and has no methods.
 * @typedef {external:boolean | external:number | external:string | external:symbol | external:bigint | external:undefined} module:core.primitive
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @function module:core.isPrimitive
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is primitive
 * @see {@link module:core.primitive}
 */
export declare const isPrimitive: (value: any) => value is primitive;
/**
 * @function module:core.isNotPrimitive
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is non-primitive
 * @see {@link module:core.primitive}
 */
export declare const isNotPrimitive: (value: any) => value is object;
//# sourceMappingURL=primitive.d.ts.map