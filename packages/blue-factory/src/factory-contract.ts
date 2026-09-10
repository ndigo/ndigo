import { Constructable } from '@blue/core';
import { like } from '@blue/util/types';
import { Aware, AsAware, likeAwareAnd } from './aware';
import { Registry } from './registry';
import { EntryProcessor } from './entry-processor';

export interface Factory {
    /**
     * Return an instance of the specified value.
     * @param name The name of the value.
     * @returns An instance of the value specified by the `name`.
     */
    getInstance<T = unknown>(name: string): T;
}

/**
 * Extends {@link Factory} to provide hierarchical factory capabilities.
 */
export interface HierarchicalFactory extends Factory {
    /**
     * The parent factory in the hierarchy.
     */
    readonly parent: Factory | null;
    /**
     * Determines whether this factory contains a value with the given name.
     * @param name The name of the value.
     * @returns `true` if this factory contains the value, `false` otherwise.
     */
    hasOwnValue(name: string): boolean;
}

/**
 * Extends {@link HierarchicalFactory} and {@link Registry} to provide configurable factory capabilities.
 */
export interface ConfigurableFactory extends HierarchicalFactory, Registry {
    /**
     * Adds an entry processor to the factory.
     * @param processor The entry processor to add.
     */
    addProcessor(processor: EntryProcessor): void;
    /**
     * Sets the parent factory.
     * @param parent The parent factory.
     */
    setParent(parent: Factory | null): void;
}

/**
 * Interface to be implemented by values that wish to be aware of their owning {@link Factory|Factory}.
 */
export interface FactoryAware extends Aware {
    /**
     * Setter that supplies the owning factory to the instance.
     * @param factory The factory that created this instance.
     */
    setFactory(factory: Factory): void;
}

const { defineProperty } = Reflect;

/**
 * Returns the error message from an unknown error type.
 * @param e The unknown error.
 * @returns The error message as a string.
 */
export const getErrorMessage = (e: unknown): string => {
    return e instanceof Error ? e.message : String(e);
};

/**
 * A mixin that adds {@link FactoryAware} capabilities to a class.
 * @template T The type of the constructor.
 * @param superclass The superclass to extend.
 * @returns A new class that extends the superclass and implements {@link FactoryAware}.
 */
export const AsFactoryAware = <T extends Constructable>(superclass: T): Constructable<FactoryAware> & T =>
    class extends AsAware(superclass) implements FactoryAware {
        /**
         * The factory that created this instance.
         */
        readonly factory!: Factory;

        /**
         * Sets the factory that created this instance.
         * @param factory The factory instance.
         */
        setFactory(factory: Factory): void {
            defineProperty(this, 'factory', {
                get: () => factory,
                configurable: true,
                enumerable: false,
            });
        }
    };

/**
 * Determines whether or not the `value` provided is a {@link Factory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link Factory}.
 */
export const likeFactory = (value: unknown): value is Factory => like({ getInstance: Function })(value);

/**
 * Determines whether or not the `value` provided is {@link FactoryAware}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link FactoryAware}.
 */
export const likeFactoryAware = (value: unknown): value is FactoryAware =>
    likeAwareAnd(like({ setFactory: Function }))(value);

const _likeHierarchicalShape = like({ parent: true, hasOwnValue: Function });

/**
 * Determines whether or not the `value` provided is {@link HierarchicalFactory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link HierarchicalFactory}.
 */
export const likeHierarchicalFactory = (value: unknown) => likeFactory(value) && _likeHierarchicalShape(value);

const _likeConfigurableShape = like({ addProcessor: Function, setParent: Function });

/**
 * Determines whether or not the `value` provided is {@link ConfigurableFactory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link ConfigurableFactory}.
 */
export const likeConfigurableFactory = (value: unknown) =>
    likeHierarchicalFactory(value) && _likeConfigurableShape(value);
