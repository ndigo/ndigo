/**
 * @author Jeff Rose
 */
import { both, like } from '@blue/util';
/**
 */
export const $aware = Symbol.for('@@aware');
/**
 * An interface indicating that a value is eligible to be notified by the factory of a particular framework object through a callback-style method. The actual method signature is determined by individual subinterfaces but should typically consist of just one void-returning method that accepts a single argument, e.g. `setName( name )`.
 *
 * Note that merely implementing `Aware` provides no default functionality. Rather, processing must be done explicitly, for example in an {@link EntryProcessor|EntryProcessor}. Refer to {@link ApplicationContextAwareProcessor|ApplicationContextAwareProcessor} for an example of processing specific `*Aware` interface callbacks
 */
/**
 */
/**
 * Interface to be implemented by values that want to be aware of their value name in a factory.
 * @extends module:factory.Aware
 */
/**
 * Set the name of the value in the factory that created it.
 *
 * Invoked after population of normal value properties but before an `init` callback.
 * @param {string} name The name of the value in the factory.
 */
/**
 * @see module:factory.AsAware
 * @implements module:factory.Aware
 * @returns {module:factory.Constructable<module:factory.Aware>}
 */
export const AsAware = (superclass) => class extends superclass {
    get [$aware]() {
        return true;
    }
};
/**
 * @readonly
 */
/**
 * @see module:factory.AsNameAware
 * @implements module:factory.NameAware
 * @returns {module:factory.Constructable<module:factory.NameAware>}
 */
export const AsNameAware = (superclass) => class extends AsAware(superclass) {
    name;
    /**
     * @param {string} name
     */
    setName(name) {
        Reflect.defineProperty(this, 'name', {
            get: () => name,
            configurable: true,
            enumerable: true,
        });
    }
};
/**
 * @readonly
 */
/**
 * @readonly
 */
/**
 * Determines whether or not the `value` is aware. i.e. implements the {@link Aware|Aware} interface.
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Aware|Aware}.
 */
export const likeAware = like({ [$aware]: Boolean });
/**
 * @param {Function} predicate
 * @returns {Function} A function that will test whether a `value` is both {@link Aware|Aware} and matches the the given `predicate`.
 * @example
 * const
 *  isYellow = ( value ) => 'color' in value && value.color === 'yellow',
 *  likeAwareAndYellow = likeAwareAnd( isYellow );
 * likeAwareAndYellow( { color: 'yellow' } ); // false
 * likeAwareAndYellow( { '@@aware': true, color: 'yellow' } ); // true
 */
export const likeAwareAnd = both(likeAware);
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link NameAware|NameAware}.
 */
export const likeNameAware = likeAwareAnd(like({ setName: Function }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQU14QztHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFrQixNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBVzNEOzs7O0dBSUc7QUFFSDtHQUNHO0FBRUg7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQTBCLFVBQWEsRUFBNEIsRUFBRSxDQUN4RixLQUFNLFNBQVEsVUFBVTtJQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ1IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKLENBQUM7QUFFTjs7R0FFRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBMEIsVUFBYSxFQUFnQyxFQUFFLENBQ2hHLEtBQU0sU0FBUSxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ3BCLElBQUksQ0FBUztJQUV0Qjs7T0FFRztJQUNILE9BQU8sQ0FBQyxJQUFZO1FBQ2hCLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUNqQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtZQUNmLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFDO0FBRU47O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBOEIsQ0FBQztBQUVsRjs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBc0MsQ0FBQztBQUVqRjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFrQyxDQUFDIn0=