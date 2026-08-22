/**
 * @author Jeff Rose
 * @see external:seedrandom
 * @see external:slug
 */
/**
 * @global
 * @external seedrandom
 * @see {@link https://www.npmjs.com/package/seedrandom}
 */
/**
 * @global
 * @external slug
 * @see {@link https://www.npmjs.com/package/slug}
 */
import * as math from './math/index.js';
import * as string from './string/index.js';
import * as types from './type/index.js';
import * as date from './date/index.js';
export { is, like } from './type/index.js';
export { math, string, types, date };
declare const _default: {
    math: typeof math;
    string: typeof string;
    types: typeof types;
    date: typeof date;
};
export default _default;
