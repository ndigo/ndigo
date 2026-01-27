/**
 * @author Jeff Rose
 */

import { Level } from './level';
import { serializable } from '@blue/core';

export type loggable = serializable | Error;

export type Entry = {
    category: string;
    error?: boolean;
    level: Level;
    message: loggable[];
    source?: string;
    timestamp: number;
};

/**
 * @param {string} category
 * @param {module:logger.Level} level
 * @param {Array<module:logger.loggable>} message
 * @param {string} [source]
 */
export const newEntry = (category: string, level: Level, message: loggable[], source?: string): Entry => ({
    message: message,
    error: message[0] instanceof Error,
    level: level,
    category: category,
    source: source,
    timestamp: Date.now(),
});

/**
 * @typedef {module:core.serializable | external:Error} module:logger.loggable
 */

/**
 * @typedef {Object} module:logger.Entry
 * @property {string} category
 * @property {boolean} [error]
 * @property {module:logger.Level} level
 * @property {Array<module:logger.loggable>} message
 * @property {string} [source]
 * @property {number} timestamp
 */
