/**
 * Strategy initializer.
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable, Enumerable, IllegalStateError } from '@ndigo/core';
import { toPascal } from '@ndigo/util/string';

/**
 * The strategy plumbing every strategy mixin relies on: a registry of strategy
 * names it contributed, plus initializers that read the application context and
 * install the configured strategy — falling back to the mixin's default when
 * the context names none.
 */
export interface StrategyInitializer {
    /** Names of the strategies this composition contributes. */
    strategies: string[];
    /**
     * Records a strategy name to initialize later.
     *
     * @param name - The strategy name.
     */
    addStrategy(name: string): void;
    /**
     * Installs a default strategy under a context key.
     *
     * @param context - The application context.
     * @param key - The context key to register under.
     * @param strategy - The default strategy value.
     * @returns The strategy now registered in the context.
     */
    getDefaultStrategy<T>(context: ApplicationContext, key: string, strategy: T): T;
    /**
     * Runs the `init<Strategy>` initializer for every recorded strategy.
     *
     * @param context - The application context.
     */
    initStrategies(context: ApplicationContext): void;
    /**
     * Installs a collection strategy from the context or its default.
     *
     * @param context - The application context.
     * @param collectionStrategyKey - The context key holding the collection.
     * @param strategyKey - The context key holding a single strategy.
     * @param name - The instance property to assign.
     * @param defaultStrategy - The fallback collection.
     */
    initCollectionStrategy<T = unknown>(
        context: ApplicationContext,
        collectionStrategyKey: string,
        strategyKey: string,
        name: string,
        defaultStrategy: T[]
    ): void;
    /**
     * Installs a single strategy from the context or its default.
     *
     * @param context - The application context.
     * @param strategyKey - The context key holding the strategy.
     * @param name - The instance property to assign.
     * @param defaultStrategy - The fallback strategy.
     */
    initStrategy<T = unknown>(context: ApplicationContext, strategyKey: string, name: string, defaultStrategy: T): void;
}

const { isArray } = Array;

/**
 * The mixin's strategy properties (init* methods) are name-driven and unknown
 * at compile time; this cast lets the anonymous class mount them without a
 * static schema.
 */
const dynamic = (target: object) => target as unknown as Record<string, unknown>;

/**
 * Mixin that implements `StrategyInitializer`: tracks the strategy names a
 * composition contributes and resolves each one from the application context
 * once, so a subclass can mix in several strategy contracts without repeating
 * the wiring.
 */
export const AsStrategyInitializer = <T extends Constructable>(superclass: T): Constructable<StrategyInitializer> & T =>
    class extends superclass implements StrategyInitializer {
        /** Whether `initStrategies` has run. */
        initialized!: boolean;
        /** Names of the strategies to initialize. */
        strategies!: string[];
        /** The context captured at initialization. */
        applicationContext!: ApplicationContext;

        /**
         * Records a strategy name to initialize later.
         *
         * @param name - The strategy name.
         */
        addStrategy(name: string): void {
            if (this.initialized) {
                throw new IllegalStateError('Cannot add strategy after initialization');
            }

            if (!this.strategies) {
                this.strategies = [];
            }

            if (name) {
                this.strategies.push(name);
            }
        }

        getDefaultStrategy<U = unknown>(context: ApplicationContext, key: string, strategy: U): U {
            context.setValue<U>(key, strategy);
            return context.getValue<U>(key);
        }

        initStrategies(context: ApplicationContext): void {
            this.applicationContext = context;
            if (!this.initialized) {
                this.initialized = true;

                const length = this.strategies.length;
                let index = 0,
                    initializer: string,
                    strategy: string;

                for (; index < length; index++) {
                    strategy = this.strategies[index];
                    initializer = `init${toPascal(strategy)}`;
                    const initializerFn = dynamic(this)[initializer];
                    if (typeof initializerFn !== 'function') {
                        throw new TypeError(`Strategy ${strategy} initializer ${initializer} is not implemented`);
                    }
                    // Invoke as a method so the strategy mixin's own fields
                    // (e.g. handlerAdapterKey) stay bound to this instance.
                    initializerFn.call(this, context);
                }
            }
        }

        initCollectionStrategy<U = unknown>(
            context: ApplicationContext,
            collectionStrategyKey: string,
            strategyKey: string,
            name: string,
            defaultStrategy: U[]
        ): void {
            if (context.hasValue(collectionStrategyKey)) {
                const collection = context.getValue<Enumerable<PropertyKey, U>>(collectionStrategyKey);
                if (isArray(collection)) {
                    dynamic(this)[name] = collection;
                } else {
                    const collected: U[] = [];
                    collection.forEach((value) => collected.push(value));
                    dynamic(this)[name] = collected;
                }
            } else if (context.hasValue(strategyKey)) {
                dynamic(this)[name] = [context.getValue<U>(strategyKey)];
            }

            // Fall back to default strategy
            if (!dynamic(this)[name]) {
                dynamic(this)[name] = this.getDefaultStrategy<U[]>(context, collectionStrategyKey, defaultStrategy);
            }
        }

        initStrategy<U = unknown>(
            context: ApplicationContext,
            strategyKey: string,
            name: string,
            defaultStrategy: U
        ): void {
            if (context.hasValue(strategyKey)) {
                dynamic(this)[name] = context.getValue<U>(strategyKey);
            }

            // Fall back to default strategy
            if (!dynamic(this)[name]) {
                dynamic(this)[name] = this.getDefaultStrategy<U>(context, strategyKey, defaultStrategy);
            }
        }
    };
