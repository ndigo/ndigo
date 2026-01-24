/**
 * @author Jeff Rose
 */
import { Comparable, Comparator, Serializable } from '@blue/core';
type Constructable<T = {}> = new (...args: any[]) => T;
/**
 * @class module:logger.Level
 * @implements module:core.Comparable
 * @implements module:core.Serializable
 * @param {external:string} name
 * @param {external:number} value
 */
export declare class Level implements Comparable<Level>, Serializable {
    /**
     * @member {module:logger.Level} module:logger.Level.OFF
     */
    static OFF: Level;
    /**
     * @member {module:logger.Level} module:logger.Level.ALL
     */
    static ALL: Level;
    /**
     * @readonly
     * @member {external:string} module:logger.Level#name
     */
    readonly name: string;
    /**
     * @readonly
     * @member {external:number} module:logger.Level#value
     */
    readonly value: number;
    get [Symbol.toStringTag](): string;
    constructor(name: string, value: number);
    /**
     * @function module:logger.Level#compareTo
     * @param {module:logger.Level} value
     * @returns {external:number}
     */
    compareTo(value: Level): number;
    /**
     * @function module:logger.Level#toJSON
     * @returns {external:string}
     */
    toJSON(): string;
    /**
     * @function module:logger.Level#toString
     * @returns {external:string} The string representation of the level
     */
    toString(): string;
}
export interface LevelComparator extends Comparator<Level> {
}
/**
 * @function module:logger.AsLevelComparator
 * @param {T} superclass
 * @returns {module:core.Constructable<module:logger.AsLevelComparator>}
 */
export declare const AsLevelComparator: <T extends Constructable>(superclass: T) => Constructable<LevelComparator> & T;
export {};
/**
 * @interface module:logger.LevelComparator
 * @extends {module:core.Comparator}
 */
//# sourceMappingURL=level.d.ts.map