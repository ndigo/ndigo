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
 * @function module:logger.newEntry
 * @param {external:string} category
 * @param {module:logger.Level} level
 * @param {external:Array<module:logger.loggable>} message
 * @param {external:string} [source]
 */
export declare const newEntry: (category: string, level: Level, message: loggable[], source?: string) => Entry;
/**
 * @typedef {module:core.serializable | external:Error} module:logger.loggable
 */
/**
 * @typedef {external:Object} module:logger.Entry
 * @property {external:string} category
 * @property {external:boolean} [error]
 * @property {module:logger.Level} level
 * @property {external:Array<module:logger.loggable>} message
 * @property {external:string} [source]
 * @property {external:number} timestamp
 */
//# sourceMappingURL=entry.d.ts.map