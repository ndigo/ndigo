/**
 * @author Jeff Rose
 */
type Constructable<T = {}> = new (...args: any[]) => T;
/**
 */
export declare const $aware: unique symbol;
export interface Aware {
    readonly [$aware]: boolean;
}
export interface NameAware extends Aware {
    readonly name: string;
    setName(name: string): void;
}
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
export declare const AsAware: <T extends Constructable>(superclass: T) => Constructable<Aware> & T;
/**
 * @readonly
 */
/**
 * @see module:factory.AsNameAware
 * @implements module:factory.NameAware
 * @returns {module:factory.Constructable<module:factory.NameAware>}
 */
export declare const AsNameAware: <T extends Constructable>(superclass: T) => Constructable<NameAware> & T;
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
export declare const likeAware: (value: any) => value is Aware;
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
export declare const likeAwareAnd: (predicate: any) => (value: any) => boolean;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link NameAware|NameAware}.
 */
export declare const likeNameAware: (value: any) => value is NameAware;
export {};
//# sourceMappingURL=aware.d.ts.map