/**
 * @author Jeff Rose
 */
import { is } from '@blue/util';
const { defineProperty } = Reflect;
/**
 * @implements module:core.Comparable
 * @implements module:core.Serializable
 * @param {string} name
 * @param {number} value
 */
export class Level {
    /**
     */
    static OFF = new Level('off', 0);
    /**
     */
    static ALL = new Level('all', Number.MAX_VALUE);
    /**
     * @readonly
     */
    name;
    /**
     * @readonly
     */
    value;
    get [Symbol.toStringTag]() {
        return `Level:${this.name}`;
    }
    constructor(name, value) {
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
    compareTo(value) {
        if (!isLevel(value)) {
            throw new TypeError('value must be an instance of Level');
        }
        if (this.value < value.value) {
            return -1;
        }
        else if (this.value > value.value) {
            return 1;
        }
        else {
            return 0;
        }
    }
    /**
     * @returns {string}
     */
    toJSON() {
        return this.toString();
    }
    /**
     * @returns {string} The string representation of the level
     */
    toString() {
        return this.name;
    }
}
const isLevel = is(Level);
// Setting the return type to "Constructable<LevelComparator> & T" forces importing modules to also import LevelComparator
/**
 * @param {T} superclass
 * @returns {module:core.Constructable<module:logger.AsLevelComparator>}
 */
export const AsLevelComparator = (superclass) => class extends superclass {
    compare(level1, level2) {
        if (!isLevel(level1)) {
            throw new TypeError('level1 must be an instance of Level');
        }
        if (!isLevel(level2)) {
            throw new TypeError('level2 must be an instance of Level');
        }
        if (level1.value < level2.value) {
            return -1;
        }
        else if (level1.value > level2.value) {
            return 1;
        }
        else {
            return 0;
        }
    }
};
/**
 * @extends {module:core.Comparator}
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV2ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGV2ZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWhDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFLbkM7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sS0FBSztJQUNkO09BQ0c7SUFDSCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUVqQztPQUNHO0lBQ0gsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRWhEOztPQUVHO0lBQ00sSUFBSSxDQUFTO0lBRXRCOztPQUVHO0lBQ00sS0FBSyxDQUFTO0lBRXZCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFlBQVksSUFBWSxFQUFFLEtBQWE7UUFDbkMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDekIsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLENBQUMsS0FBWTtRQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbEIsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNsQyxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTTtRQUNGLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDSixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQzs7QUFLTCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFMUIsMEhBQTBIO0FBQzFIOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQTBCLFVBQWEsRUFBc0MsRUFBRSxDQUM1RyxLQUFNLFNBQVEsVUFBVTtJQUNwQixPQUFPLENBQUMsTUFBYSxFQUFFLE1BQWE7UUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM5QixPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQzthQUFNLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckMsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFDO0FBRU47O0dBRUcifQ==