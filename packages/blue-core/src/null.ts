/**
 * @author Jeff Rose
 */

/**
 * A "clean", empty container.
 * @extends external:null
 */
export class Null {}
Reflect.setPrototypeOf(Null.prototype, null);

/**
 * @returns {Object} An empty object created from `null`.
 */
export const createNull = Object.create.bind(Object, null);
