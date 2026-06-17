/**
 * @author Jeff Rose
 */

import { like } from '@blue/util/types';
//import { Constructable } from '@blue/core';

/**
 * A generic constructor type.
 * @template T The type of the instance created by the constructor.
 */
type Constructable<T = {}> = new (...args: any[]) => T;

/**
 */
export const $aware: unique symbol = Symbol.for('@@aware');

/**
 * An interface indicating that a value is eligible to be notified by the factory of a particular framework object through a callback-style method. The actual method signature is determined by individual subinterfaces but should typically consist of just one void-returning method that accepts a single argument, e.g. `setName( name )`.
 *
 * Note that merely implementing `Aware` provides no default functionality. Rather, processing must be done explicitly, for example in an {@link EntryProcessor|EntryProcessor}. Refer to {@link ApplicationContextAwareProcessor|ApplicationContextAwareProcessor} for an example of processing specific `*Aware` interface callbacks
 */
export interface Aware {
    /**
     * A symbol indicating that the value is aware.
     */
    readonly [$aware]: boolean;
}

/**
 * Interface to be implemented by values that want to be aware of their value name in a factory.
 * @extends Aware
 */
export interface NameAware extends Aware {
    /**
     * The name of the value in the factory.
     */
    readonly name: string;
    /**
     * Sets the name of the value in the factory.
     * @param name The name to set.
     */
    setName(name: string): void;
}

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
        readonly name!: string;

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
 * Determines whether or not the `value` provided is {@link Aware}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link Aware}.
 */
export const likeAware = (value: unknown): value is Aware => {
    return like({ [$aware]: Boolean })(value);
};

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
export const likeAwareAnd = ((predicate: (value: unknown) => boolean) => (value: unknown) => likeAware(value) && predicate(value)) as (
    predicate: (value: unknown) => boolean
) => (value: unknown) => boolean;

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link NameAware|NameAware}.
 */
export const likeNameAware = likeAwareAnd(like({ setName: Function })) as (value: unknown) => value is NameAware;
