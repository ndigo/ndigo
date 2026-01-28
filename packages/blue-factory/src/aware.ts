/**
 * @author Jeff Rose
 */

import { both, like } from '@blue/util';
//import { Constructable } from '@blue/core';

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

/**
 */
export const $aware: unique symbol = Symbol.for('@@aware');

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
export const AsAware = <T extends Constructable>(superclass: T): Constructable<Aware> & T =>
    class extends superclass implements Aware {
        get [$aware](): boolean {
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
export const AsNameAware = <T extends Constructable>(superclass: T): Constructable<NameAware> & T =>
    class extends AsAware(superclass) implements NameAware {
        readonly name: string;

        /**
         * @param {string} name
         */
        setName(name: string): void {
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
export const likeAware = like({ [$aware]: Boolean }) as (value) => value is Aware;

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
export const likeAwareAnd = both(likeAware) as (predicate) => (value) => boolean;

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link NameAware|NameAware}.
 */
export const likeNameAware = likeAwareAnd(like({ setName: Function })) as (value) => value is NameAware;
