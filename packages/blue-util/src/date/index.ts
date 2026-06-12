/**
 * @author Jeff Rose
 * @module date
 */

/**
 * Returns whether the given date is in the future.
 * @category Date
 * @param {Date} date
 * @returns {boolean}
 */
export const isFuture = (date: Date): boolean => date.getTime() > Date.now();

/**
 * Returns whether the given date is in the past.
 * @category Date
 * @param {Date} date
 * @returns {boolean}
 */
export const isPast = (date: Date): boolean => date.getTime() < Date.now();