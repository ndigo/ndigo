/**
 * @author Jeff Rose
 */

import { complement } from '@blue/util/logic';

export type primitive = boolean | null | number | string | symbol | bigint | undefined;

/**
 * A primitive is data that is not an object and has no methods.
 * @typedef {boolean | external:number | external:string | external:symbol | external:bigint | external:undefined} module:core.primitive
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is primitive
 * @see {@link primitive}
 */
export const isPrimitive = (value): value is primitive => {
    switch (typeof value) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
        case 'undefined':
            return true;
        case 'object':
            return value === null;
        default:
            return false;
    }
};

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is non-primitive
 * @see {@link primitive}
 */
export const isNotPrimitive = complement(isPrimitive) as (value) => value is object;
