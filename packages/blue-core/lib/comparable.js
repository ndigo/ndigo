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
 * @returns {number} A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
/**
 */
/**
 * Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @returns {number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */
/**
 * @extends module:core.Comparable
 */
/**
 * Compares this string-based object with the specified string-based object for order, ignoring case. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @returns {number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */
/**
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
 * @implements module:core.Comparator<external:string>
 */
/**
 */
export const likeComparable = like({ compareTo: Function });
/**
 */
export const likeComparator = like({ compare: Function });
/**
 */
export const naturalComparison = comparator(naturalPredicate);
/**
 * @param {module:core.comparison} compare The comparison to invert
 * @returns {module:core.comparison} The inverted comparison
 */
export const invertComparison = (compare) => (value1, value2) => -compare(value1, value2);
/**
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
 * @extends module:core~PredicateComparator
 */
class NaturalComparator extends PredicateComparator {
    constructor() {
        super(naturalPredicate);
    }
}
/**
 * Comparator that adapts Comparables to the Comparator interface. Mainly for internal use in other Comparators, when supposed to work on Comparables.
 * @implements module:core.Comparator
 */
class ComparableComparator {
    compare(value1, value2) {
        return value1.compareTo(value2);
    }
}
/**
 * @extends module:core~PredicateComparator
 */
class DateComparator extends PredicateComparator {
    constructor() {
        super(isBefore);
    }
}
/**
 * @extends module:core~NaturalComparator
 */
class NumberComparator extends NaturalComparator {
}
/**
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
 */
export const comparableComparator = new ComparableComparator();
/**
 */
export const dateComparator = new DateComparator();
/**
 */
export const numberComparator = new NumberComparator();
/**
 */
export const stringComparator = new StringComparator();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21wYXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBa0J4RDs7Ozs7OztHQU9HO0FBRUg7R0FDRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixnQkFBZ0IsR0FBRyxDQUFJLE1BQVMsRUFBRSxNQUFTLEVBQVcsRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFFN0UsTUFBTSxPQUFnQix1QkFBdUI7SUFDaEMsS0FBSyxDQUFTO0lBRXZCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8saUJBQWlCLENBQUM7SUFDN0IsQ0FBQztJQUVELFlBQVksS0FBYTtRQUNyQixjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FHSjtBQUVEOzs7R0FHRztBQUVIO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUF3QyxDQUFDO0FBRW5HO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUF3QyxDQUFDO0FBRWpHO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUU5RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FDekIsQ0FBSSxPQUFzQixFQUFpQixFQUFFLENBQzdDLENBQUMsTUFBUyxFQUFFLE1BQVMsRUFBRSxFQUFFLENBQ3JCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUVqQzs7R0FFRztBQUNILE1BQU0sbUJBQW1CO0lBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8scUJBQXFCLENBQUM7SUFDakMsQ0FBQztJQUVELE9BQU8sQ0FBZ0I7SUFFdkIsWUFBWSxJQUFrQjtRQUMxQixjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUM1QixLQUFLLEVBQUUsVUFBVSxDQUFJLElBQUksQ0FBQztZQUMxQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0saUJBQXFCLFNBQVEsbUJBQXNCO0lBQ3JEO1FBQ0ksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxvQkFBb0I7SUFDdEIsT0FBTyxDQUFDLE1BQVMsRUFBRSxNQUFTO1FBQ3hCLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sY0FBZSxTQUFRLG1CQUF5QjtJQUNsRDtRQUNJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sZ0JBQWlCLFNBQVEsaUJBQXlCO0NBQUc7QUFFM0Q7O0dBRUc7QUFDSCxNQUFNLGdCQUFpQixTQUFRLGlCQUF5QjtJQUNwRCxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsTUFBYztRQUM1QyxPQUFPLENBQ0gsT0FBTyxNQUFNLEtBQUssUUFBUTtZQUMxQixPQUFPLE1BQU0sS0FBSyxRQUFRO1lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUMzRCxDQUFDO0lBQ04sQ0FBQztDQUNKO0FBRUQ7R0FDRztBQUNILE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQztBQUUvRDtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFFbkQ7R0FDRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztBQUV2RDtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIn0=