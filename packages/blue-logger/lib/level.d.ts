/**
 * @author Jeff Rose
 */
import { Comparable, Comparator, Serializable } from '@blue/core';
type Constructable<T = {}> = new (...args: any[]) => T;
/**
 * @implements module:core.Comparable
 * @implements module:core.Serializable
 * @param {string} name
 * @param {number} value
 */
export declare class Level implements Comparable<Level>, Serializable {
    /**
     */
    static OFF: Level;
    /**
     */
    static ALL: Level;
    /**
     * @readonly
     */
    readonly name: string;
    /**
     * @readonly
     */
    readonly value: number;
    get [Symbol.toStringTag](): string;
    constructor(name: string, value: number);
    /**
     * @param {module:logger.Level} value
     * @returns {number}
     */
    compareTo(value: Level): number;
    /**
     * @returns {string}
     */
    toJSON(): string;
    /**
     * @returns {string} The string representation of the level
     */
    toString(): string;
}
export interface LevelComparator extends Comparator<Level> {
}
/**
 * @param {T} superclass
 * @returns {module:core.Constructable<module:logger.AsLevelComparator>}
 */
export declare const AsLevelComparator: <T extends Constructable>(superclass: T) => Constructable<LevelComparator> & T;
export {};
/**
 * @extends {module:core.Comparator}
 */
//# sourceMappingURL=level.d.ts.map