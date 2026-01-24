/**
 * @author Jeff Rose
 */

/**
 * A "clean", empty container.
 * @class module:core.Null
 * @extends external:null
 */
export class Null {}
Reflect.setPrototypeOf(Null.prototype, null);

/**
 * @function module:core.createNull
 * @returns {external:Object} An empty object created from `null`.
 */
export const createNull = Object.create.bind(Object, null);
