/**
 * @author Jeff Rose
 */
import { comparator } from '@blue/util/function';
import { isBefore } from '@blue/util/date';
import { like } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21wYXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFrQnhDOzs7Ozs7O0dBT0c7QUFFSDtHQUNHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGdCQUFnQixHQUFHLENBQUksTUFBUyxFQUFFLE1BQVMsRUFBVyxFQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUU3RSxNQUFNLE9BQWdCLHVCQUF1QjtJQUNoQyxLQUFLLENBQVM7SUFFdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWSxLQUFhO1FBQ3JCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzFCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUdKO0FBRUQ7OztHQUdHO0FBRUg7R0FDRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQXdDLENBQUM7QUFFbkc7R0FDRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQXdDLENBQUM7QUFFakc7R0FDRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTlEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUN6QixDQUFJLE9BQXNCLEVBQWlCLEVBQUUsQ0FDN0MsQ0FBQyxNQUFTLEVBQUUsTUFBUyxFQUFFLEVBQUUsQ0FDckIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRWpDOztHQUVHO0FBQ0gsTUFBTSxtQkFBbUI7SUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxxQkFBcUIsQ0FBQztJQUNqQyxDQUFDO0lBRUQsT0FBTyxDQUFnQjtJQUV2QixZQUFZLElBQWtCO1FBQzFCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzVCLEtBQUssRUFBRSxVQUFVLENBQUksSUFBSSxDQUFDO1lBQzFCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxpQkFBcUIsU0FBUSxtQkFBc0I7SUFDckQ7UUFDSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBQ0o7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLG9CQUFvQjtJQUN0QixPQUFPLENBQUMsTUFBUyxFQUFFLE1BQVM7UUFDeEIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxjQUFlLFNBQVEsbUJBQXlCO0lBQ2xEO1FBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxnQkFBaUIsU0FBUSxpQkFBeUI7Q0FBRztBQUUzRDs7R0FFRztBQUNILE1BQU0sZ0JBQWlCLFNBQVEsaUJBQXlCO0lBQ3BELGlCQUFpQixDQUFDLE1BQWMsRUFBRSxNQUFjO1FBQzVDLE9BQU8sQ0FDSCxPQUFPLE1BQU0sS0FBSyxRQUFRO1lBQzFCLE9BQU8sTUFBTSxLQUFLLFFBQVE7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQzNELENBQUM7SUFDTixDQUFDO0NBQ0o7QUFFRDtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO0FBRS9EO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUVuRDtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0FBRXZEO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUMifQ==