/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@ndigo/context';
import { Constructable, Enumerable, IllegalStateError } from '@ndigo/core';
import { toPascal } from '@ndigo/util/string';

export interface StrategyInitializer {
    strategies: string[];
    addStrategy(name: string): void;
    getDefaultStrategy<T>(context: ApplicationContext, key: string, strategy: T): T;
    initStrategies(context: ApplicationContext): void;
    initCollectionStrategy<T = unknown>(
        context: ApplicationContext,
        collectionStrategyKey: string,
        strategyKey: string,
        name: string,
        defaultStrategy: T[]
    ): void;
    initStrategy<T = unknown>(context: ApplicationContext, strategyKey: string, name: string, defaultStrategy: T): void;
}

const { isArray } = Array;

/**
 * The mixin's strategy properties (init* methods) are name-driven and unknown
 * at compile time; this cast lets the anonymous class mount them without a
 * static schema.
 */
const dynamic = (target: object) => target as unknown as Record<string, unknown>;

export const AsStrategyInitializer = <T extends Constructable>(superclass: T): Constructable<StrategyInitializer> & T =>
    class extends superclass implements StrategyInitializer {
        initialized!: boolean;
        strategies!: string[];
        applicationContext!: ApplicationContext;

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
