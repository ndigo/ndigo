/**
 * @author Jeff Rose
 */

import { Comparable, Comparator, Serializable } from '@blue/core';
import { is } from '@blue/util/types';

const { defineProperty } = Reflect;

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

/**
 * @implements module:core.Comparable
 * @implements module:core.Serializable
 * @param {string} name
 * @param {number} value
 */
export class Level implements Comparable<Level>, Serializable {
    /**
     */
    static OFF = new Level('off', 0);

    /**
     */
    static ALL = new Level('all', Number.MAX_VALUE);

    /**
     * @readonly
     */
    readonly name: string;

    /**
     * @readonly
     */
    readonly value: number;

    get [Symbol.toStringTag](): string {
        return `Level:${this.name}`;
    }

    constructor(name: string, value: number) {
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * @param {module:logger.Level} value
     * @returns {number}
     */
    compareTo(value: Level): number {
        if (!isLevel(value)) {
            throw new TypeError('value must be an instance of Level');
        }

        if (this.value < value.value) {
            return -1;
        } else if (this.value > value.value) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * @returns {string}
     */
    toJSON(): string {
        return this.toString();
    }

    /**
     * @returns {string} The string representation of the level
     */
    toString(): string {
        return this.name;
    }
}

export interface LevelComparator extends Comparator<Level> {}

const isLevel = is(Level);

// Setting the return type to "Constructable<LevelComparator> & T" forces importing modules to also import LevelComparator
/**
 * @param {T} superclass
 * @returns {module:core.Constructable<module:logger.AsLevelComparator>}
 */
export const AsLevelComparator = <T extends Constructable>(superclass: T): Constructable<LevelComparator> & T =>
    class extends superclass implements LevelComparator {
        compare(level1: Level, level2: Level): number {
            if (!isLevel(level1)) {
                throw new TypeError('level1 must be an instance of Level');
            }

            if (!isLevel(level2)) {
                throw new TypeError('level2 must be an instance of Level');
            }

            if (level1.value < level2.value) {
                return -1;
            } else if (level1.value > level2.value) {
                return 1;
            } else {
                return 0;
            }
        }
    };

/**
 * @extends {module:core.Comparator}
 */
