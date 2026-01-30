/**
 * @author Jeff Rose
 * @see external:date-fns
 * @see external:date-fns-tz
 * @see external:ramda
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
 * @external ramda
 * @see {@link https://ramdajs.com/docs/}
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
import fn from './function/index.js';
import list from './list/index.js';
import logic from './logic/index.js';
import math from './math/index.js';
import object from './object/index.js';
import relation from './relation/index.js';
import string from './string/index.js';
import types from './type/index.js';
import * as date from './date/index.js';

// Back-compat: named exports from the package root.
// Prefer subpath imports (e.g. `@blue/util/list`) but keep a small set here
// for older compiled artifacts that import from `@blue/util`.
export { pipe, compose } from './function/index.js';
export { join, map } from './list/index.js';
export { allPass } from './logic/index.js';
export { is, like } from './type/index.js';

// Named category exports
export { fn, list, logic, math, object, relation, string, types, date };

// Default export with all categories
export default {
    fn,
    list,
    logic,
    math,
    object,
    relation,
    string,
    types,
    date,
};
