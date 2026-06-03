/**
 * @author Jeff Rose
 * @see external:date-fns
 * @see external:date-fns-tz
 * @see external:seedrandom
 * @see external:slug
 */

/**
 * @global
 * @external date-fns
 * @see {@link https://date-fns.org/}
 */

/**
 * @global
 * @external date-fns-tz
 * @see {@link https://github.com/marnusw/date-fns-tz}
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
import * as math from './math/index.js';
import * as string from './string/index.js';
import * as types from './type/index.js';
import * as date from './date/index.js';

export { is, like } from './type/index.js';

// Named category exports
export { math, string, types, date };

// Default export with all categories
export default {
    math,
    string,
    types,
    date,
};
