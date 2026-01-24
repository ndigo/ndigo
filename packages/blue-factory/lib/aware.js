/**
 * @author Jeff Rose
 */
import { both, like } from '@blue/util';
/**
 * @const {external:symbol} module:factory.$aware
 */
export const $aware = Symbol.for('@@aware');
/**
 * An interface indicating that a value is eligible to be notified by the factory of a particular framework object through a callback-style method. The actual method signature is determined by individual subinterfaces but should typically consist of just one void-returning method that accepts a single argument, e.g. `setName( name )`.
 *
 * Note that merely implementing `Aware` provides no default functionality. Rather, processing must be done explicitly, for example in an {@linkcode module:factory.EntryProcessor|EntryProcessor}. Refer to {@linkcode module:context.ApplicationContextAwareProcessor|ApplicationContextAwareProcessor} for an example of processing specific `*Aware` interface callbacks
 * @interface module:factory.Aware
 */
/**
 * @member {external:boolean} module:factory.Aware#@@aware
 */
/**
 * Interface to be implemented by values that want to be aware of their value name in a factory.
 * @interface module:factory.NameAware
 * @extends module:factory.Aware
 */
/**
 * Set the name of the value in the factory that created it.
 *
 * Invoked after population of normal value properties but before an `init` callback.
 * @function module:factory.NameAware#setName
 * @param {external:string} name The name of the value in the factory.
 */
/**
 * @mixin module:factory.AsAware
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
 * @member {external:boolean} module:factory.AsAware#@@aware=true
 */
/**
 * @mixin module:factory.AsNameAware
 * @implements module:factory.NameAware
 * @returns {module:factory.Constructable<module:factory.NameAware>}
 */
export const AsNameAware = (superclass) => class extends AsAware(superclass) {
    name;
    /**
     * @function module:factory.AsNameAware#setName
     * @param {external:string} name
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
 * @member {external:string} module:factory.AsNameAware#name
 */
/**
 * @readonly
 * @member {external:boolean} module:factory.AsNameAware#@@aware=true
 */
/**
 * Determines whether or not the `value` is aware. i.e. implements the {@linkcode module:factory.Aware|Aware} interface.
 * @function module:factory.likeAware
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Aware|Aware}.
 */
export const likeAware = like({ [$aware]: Boolean });
/**
 * @function module:factory.likeAwareAnd
 * @param {external:Function} predicate
 * @returns {external:Function} A function that will test whether a `value` is both {@linkcode module:factory.Aware|Aware} and matches the the given `predicate`.
 * @example
 * const
 *  isYellow = ( value ) => 'color' in value && value.color === 'yellow',
 *  likeAwareAndYellow = likeAwareAnd( isYellow );
 * likeAwareAndYellow( { color: 'yellow' } ); // false
 * likeAwareAndYellow( { '@@aware': true, color: 'yellow' } ); // true
 */
export const likeAwareAnd = both(likeAware);
/**
 * @function module:factory.likeNameAware
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.NameAware|NameAware}.
 */
export const likeNameAware = likeAwareAnd(like({ setName: Function }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQU14Qzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBa0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQVczRDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBMEIsVUFBYSxFQUE0QixFQUFFLENBQ3hGLEtBQU0sU0FBUSxVQUFVO0lBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDUixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0osQ0FBQztBQUVOOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBMEIsVUFBYSxFQUFnQyxFQUFFLENBQ2hHLEtBQU0sU0FBUSxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ3BCLElBQUksQ0FBUztJQUV0Qjs7O09BR0c7SUFDSCxPQUFPLENBQUMsSUFBWTtRQUNoQixPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDakMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUk7WUFDZixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQztBQUVOOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQThCLENBQUM7QUFFbEY7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFzQyxDQUFDO0FBRWpGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFrQyxDQUFDIn0=