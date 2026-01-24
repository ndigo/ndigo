/**
 * @author Jeff Rose
 */
import { is } from '@blue/util';
const { defineProperty } = Reflect;
/**
 * @class module:logger.Level
 * @implements module:core.Comparable
 * @implements module:core.Serializable
 * @param {external:string} name
 * @param {external:number} value
 */
export class Level {
    /**
     * @member {module:logger.Level} module:logger.Level.OFF
     */
    static OFF = new Level('off', 0);
    /**
     * @member {module:logger.Level} module:logger.Level.ALL
     */
    static ALL = new Level('all', Number.MAX_VALUE);
    /**
     * @readonly
     * @member {external:string} module:logger.Level#name
     */
    name;
    /**
     * @readonly
     * @member {external:number} module:logger.Level#value
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
     * @function module:logger.Level#compareTo
     * @param {module:logger.Level} value
     * @returns {external:number}
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
     * @function module:logger.Level#toJSON
     * @returns {external:string}
     */
    toJSON() {
        return this.toString();
    }
    /**
     * @function module:logger.Level#toString
     * @returns {external:string} The string representation of the level
     */
    toString() {
        return this.name;
    }
}
const isLevel = is(Level);
// Setting the return type to "Constructable<LevelComparator> & T" forces importing modules to also import LevelComparator
/**
 * @function module:logger.AsLevelComparator
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
 * @interface module:logger.LevelComparator
 * @extends {module:core.Comparator}
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV2ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGV2ZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWhDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFLbkM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLEtBQUs7SUFDZDs7T0FFRztJQUNILE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWpDOztPQUVHO0lBQ0gsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRWhEOzs7T0FHRztJQUNNLElBQUksQ0FBUztJQUV0Qjs7O09BR0c7SUFDTSxLQUFLLENBQVM7SUFFdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsWUFBWSxJQUFZLEVBQUUsS0FBYTtRQUNuQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN6QixLQUFLLEVBQUUsSUFBSTtZQUNYLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzFCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLENBQUMsS0FBWTtRQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbEIsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNsQyxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU07UUFDRixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDOztBQUtMLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUUxQiwwSEFBMEg7QUFDMUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQTBCLFVBQWEsRUFBc0MsRUFBRSxDQUM1RyxLQUFNLFNBQVEsVUFBVTtJQUNwQixPQUFPLENBQUMsTUFBYSxFQUFFLE1BQWE7UUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM5QixPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQzthQUFNLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckMsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFDO0FBRU47OztHQUdHIn0=