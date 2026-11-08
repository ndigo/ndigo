/**
 * Aware mixins for injecting factory and context dependencies.
 */
import { like } from '@ndigo/util/types';
//import { Constructable } from '@ndigo/core';

/**
 * A generic constructor type.
 * @typeParam T - The type of the instance created by the constructor.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- TS2545 requires mixin superclass ctors to be exactly `...args: any[]`; no erasable alternative.
type Constructable<T = {}> = new (...args: any[]) => T;

export const $aware: unique symbol = Symbol.for('@@aware');

/**
 * An interface indicating that a value is eligible to be notified by the factory of a particular framework object through a callback-style method. The actual method signature is determined by individual subinterfaces but should typically consist of just one void-returning method that accepts a single argument, e.g. `setName( name )`.
 *
 * Note that merely implementing `Aware` provides no default functionality. Rather, processing must be done explicitly, for example in an `EntryProcessor`. Refer to `ApplicationContextAwareProcessor` for an example of processing specific `*Aware` interface callbacks
 */
export interface Aware {
    /**
     * A symbol indicating that the value is aware.
     */
    readonly [$aware]: boolean;
}

/**
 * Interface to be implemented by values that want to be aware of their value name in a factory.
 */
export interface NameAware extends Aware {
    /**
     * The name of the value in the factory.
     */
    readonly name: string;
    /**
     * Sets the name of the value in the factory.
     * @param name - The name to set.
     */
    setName(name: string): void;
}

/**
 * Mixin marking a class as aware: adds a `true` value under the `Aware` symbol
 * key so the factory can recognise aware instances without a concrete
 * interface.
 */
export const AsAware = <T extends Constructable>(superclass: T): Constructable<Aware> & T =>
    class extends superclass implements Aware {
        get [$aware](): boolean {
            return true;
        }
    };

/**
 * Mixin adding a mutable `name` property to a class.
 */
export const AsNameAware = <T extends Constructable>(superclass: T): Constructable<NameAware> & T =>
    class extends AsAware(superclass) implements NameAware {
        readonly name!: string;

        /**
         * Sets the value's name.
         *
         * @param name - The name to set.
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
 * Determines whether or not the `value` provided is {@link Aware}.
 * @param value - The value to be tested.
 * @returns Whether or not the `value` provided is {@link Aware}.
 */
export const likeAware = (value: unknown): value is Aware => {
    return like({ [$aware]: Boolean })(value);
};

/**
 * Builds a predicate that tests whether a value is {@link Aware} and matches the given `predicate`.
 *
 * @param predicate - The additional test applied to aware values.
 * @returns A function that will test whether a `value` is both {@link Aware|Aware} and matches the the given `predicate`.
 * @example
 * ```ts
 * const isYellow = (value: unknown) => 'color' in value && value.color === 'yellow';
 * const likeAwareAndYellow = likeAwareAnd(isYellow);
 * likeAwareAndYellow({ color: 'yellow' }); // false
 * likeAwareAndYellow({ '@@aware': true, color: 'yellow' }); // true
 * ```
 */
export const likeAwareAnd =
    (predicate: (value: unknown) => boolean) =>
    (value: unknown): boolean =>
        likeAware(value) && predicate(value);

/**
 * Returns whether a value is {@link NameAware|NameAware}.
 *
 * @param value - The value to be tested.
 * @returns Whether or not the `value` is {@link NameAware|NameAware}.
 */
export const likeNameAware = likeAwareAnd(like({ setName: Function })) as (value: unknown) => value is NameAware;
