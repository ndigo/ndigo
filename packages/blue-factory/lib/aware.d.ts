/**
 * @author Jeff Rose
 */
type Constructable<T = {}> = new (...args: any[]) => T;
/**
 * @const {external:symbol} module:factory.$aware
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
export declare const AsAware: <T extends Constructable>(superclass: T) => Constructable<Aware> & T;
/**
 * @readonly
 * @member {external:boolean} module:factory.AsAware#@@aware=true
 */
/**
 * @mixin module:factory.AsNameAware
 * @implements module:factory.NameAware
 * @returns {module:factory.Constructable<module:factory.NameAware>}
 */
export declare const AsNameAware: <T extends Constructable>(superclass: T) => Constructable<NameAware> & T;
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
export declare const likeAware: (value: any) => value is Aware;
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
export declare const likeAwareAnd: (predicate: any) => (value: any) => boolean;
/**
 * @function module:factory.likeNameAware
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.NameAware|NameAware}.
 */
export declare const likeNameAware: (value: any) => value is NameAware;
export {};
//# sourceMappingURL=aware.d.ts.map