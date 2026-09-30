/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
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

// Import category modules
import * as crypto from './crypto/index.js';
import * as math from './math/index.js';
import * as string from './string/index.js';
import * as types from './type/index.js';

export { is, like } from './type/index.js';
export { randomToken } from './crypto/index.js';

// Named category exports
export { crypto, math, string, types };

// Default export with all categories
export default {
    crypto,
    math,
    string,
    types,
};
