/**
 * @author Jeff Rose
 */
import { comparator, isBefore, like } from '@blue/util';
/**
 * Compares its two arguments for order. Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 * @template T
 * @callback module:core.comparison
 * @param {T} value1
 * @param {T} value2
 * @returns {external:number} A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
/**
 * @interface module:core.Comparable
 */
/**
 * Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @function module:core.Comparable#compareTo
 * @returns {external:number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */
/**
 * @interface module:core.StringComparable
 * @extends module:core.Comparable
 */
/**
 * Compares this string-based object with the specified string-based object for order, ignoring case. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @function module:core.StringComparable#compareToIgnoreCase
 * @returns {external:number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */
/**
 * @interface module:core.Comparator
 * @property {module:core.comparison} compare
 */
const { defineProperty } = Reflect, naturalPredicate = (value1, value2) => value1 < value2;
export class AbstractValueComparator {
    value;
    get [Symbol.toStringTag]() {
        return 'ValueComparator';
    }
    constructor(value) {
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @abstract
 * @class module:core.AbstractValueComparator
 * @implements module:core.Comparator<external:string>
 */
/**
 * @function module:core.likeComparable
 */
export const likeComparable = like({ compareTo: Function });
/**
 * @function module:core.likeComparator
 */
export const likeComparator = like({ compare: Function });
/**
 * @const {module:core.comparison} module:core.naturalComparison
 */
export const naturalComparison = comparator(naturalPredicate);
/**
 * @const {external:Function} module:core.invertComparison
 * @param {module:core.comparison} compare The comparison to invert
 * @returns {module:core.comparison} The inverted comparison
 */
export const invertComparison = (compare) => (value1, value2) => -compare(value1, value2);
/**
 * @class module:core~PredicateComparator
 * @implements module:core.Comparator
 */
class PredicateComparator {
    get [Symbol.toStringTag]() {
        return 'PredicateComparator';
    }
    compare;
    constructor(pred) {
        defineProperty(this, 'compare', {
            value: comparator(pred),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @class module:core~NaturalComparator
 * @extends module:core~PredicateComparator
 */
class NaturalComparator extends PredicateComparator {
    constructor() {
        super(naturalPredicate);
    }
}
/**
 * Comparator that adapts Comparables to the Comparator interface. Mainly for internal use in other Comparators, when supposed to work on Comparables.
 * @class module:core.ComparableComparator
 * @implements module:core.Comparator
 */
class ComparableComparator {
    compare(value1, value2) {
        return value1.compareTo(value2);
    }
}
/**
 * @class module:core~DateComparator
 * @extends module:core~PredicateComparator
 */
class DateComparator extends PredicateComparator {
    constructor() {
        super(isBefore);
    }
}
/**
 * @class module:core~NumberComparator
 * @extends module:core~NaturalComparator
 */
class NumberComparator extends NaturalComparator {
}
/**
 * @class module:core~StringComparator
 * @extends module:core~NaturalComparator
 */
class StringComparator extends NaturalComparator {
    compareIgnoreCase(value1, value2) {
        return (typeof value1 === 'string' &&
            typeof value2 === 'string' &&
            this.compare(value1.toLowerCase(), value2.toLowerCase()));
    }
}
/**
 * @const {module:core~ComparableComparator} module:core.comparableComparator
 */
export const comparableComparator = new ComparableComparator();
/**
 * @const {module:core~DateComparator} module:core.dateComparator
 */
export const dateComparator = new DateComparator();
/**
 * @const {module:core~NumberComparator} module:core.numberComparator
 */
export const numberComparator = new NumberComparator();
/**
 * @const {module:core~StringComparator} module:core.stringComparator
 */
export const stringComparator = new StringComparator();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21wYXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBa0J4RDs7Ozs7OztHQU9HO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGdCQUFnQixHQUFHLENBQUksTUFBUyxFQUFFLE1BQVMsRUFBVyxFQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUU3RSxNQUFNLE9BQWdCLHVCQUF1QjtJQUNoQyxLQUFLLENBQVM7SUFFdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWSxLQUFhO1FBQ3JCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzFCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUdKO0FBRUQ7Ozs7R0FJRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBd0MsQ0FBQztBQUVuRzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQXdDLENBQUM7QUFFakc7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUU5RDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQ3pCLENBQUksT0FBc0IsRUFBaUIsRUFBRSxDQUM3QyxDQUFDLE1BQVMsRUFBRSxNQUFTLEVBQUUsRUFBRSxDQUNyQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFakM7OztHQUdHO0FBQ0gsTUFBTSxtQkFBbUI7SUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxxQkFBcUIsQ0FBQztJQUNqQyxDQUFDO0lBRUQsT0FBTyxDQUFnQjtJQUV2QixZQUFZLElBQWtCO1FBQzFCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVCLEtBQUssRUFBRSxVQUFVLENBQUksSUFBSSxDQUFDO1lBQzFCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUVEOzs7R0FHRztBQUNILE1BQU0saUJBQXFCLFNBQVEsbUJBQXNCO0lBQ3JEO1FBQ0ksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sb0JBQW9CO0lBQ3RCLE9BQU8sQ0FBQyxNQUFTLEVBQUUsTUFBUztRQUN4QixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxjQUFlLFNBQVEsbUJBQXlCO0lBQ2xEO1FBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQUVEOzs7R0FHRztBQUNILE1BQU0sZ0JBQWlCLFNBQVEsaUJBQXlCO0NBQUc7QUFFM0Q7OztHQUdHO0FBQ0gsTUFBTSxnQkFBaUIsU0FBUSxpQkFBeUI7SUFDcEQsaUJBQWlCLENBQUMsTUFBYyxFQUFFLE1BQWM7UUFDNUMsT0FBTyxDQUNILE9BQU8sTUFBTSxLQUFLLFFBQVE7WUFDMUIsT0FBTyxNQUFNLEtBQUssUUFBUTtZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FDM0QsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFFbkQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7QUFFdkQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUMifQ==