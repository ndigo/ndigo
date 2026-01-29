/**
 * @author Jeff Rose
 */
import { is } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV2ZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGV2ZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFdEMsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUtuQzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxLQUFLO0lBQ2Q7T0FDRztJQUNILE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWpDO09BQ0c7SUFDSCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFaEQ7O09BRUc7SUFDTSxJQUFJLENBQVM7SUFFdEI7O09BRUc7SUFDTSxLQUFLLENBQVM7SUFFdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsWUFBWSxJQUFZLEVBQUUsS0FBYTtRQUNuQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN6QixLQUFLLEVBQUUsSUFBSTtZQUNYLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzFCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxLQUFZO1FBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksU0FBUyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDM0IsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7YUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQzthQUFNLENBQUM7WUFDSixPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNO1FBQ0YsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDOztBQUtMLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUUxQiwwSEFBMEg7QUFDMUg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsQ0FBMEIsVUFBYSxFQUFzQyxFQUFFLENBQzVHLEtBQU0sU0FBUSxVQUFVO0lBQ3BCLE9BQU8sQ0FBQyxNQUFhLEVBQUUsTUFBYTtRQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDbkIsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDbkIsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO2FBQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyQyxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUM7QUFFTjs7R0FFRyJ9