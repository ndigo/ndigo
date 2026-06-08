/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable, Enumerable, IllegalStateError } from '@blue/core';
import { toPascal } from '@blue/util/string';

export interface StrategyInitializer {
    strategies: string[];
    addStrategy(name: string): void;
    getDefaultStrategy<T>(context: ApplicationContext, key: string, strategy: T): T;
    initStrategies(context: ApplicationContext): void;
    initCollectionStrategy<T = any>(
        context: ApplicationContext,
        collectionStrategyKey: string,
        strategyKey: string,
        name: string,
        defaultStrategy: T[]
    ): void;
    initStrategy<T = any>(context: ApplicationContext, strategyKey: string, name: string, defaultStrategy: T): void;
}

const { isArray } = Array;

export const AsStrategyInitializer = <T extends Constructable>(superclass: T): Constructable<StrategyInitializer> & T =>
    class extends superclass implements StrategyInitializer {
        initialized!: boolean;
        strategies!: string[];

        addStrategy(name: string): void {
            if (this.initialized) {
                throw new IllegalStateError('Cannot add strategy after initialization');
            }

            if (!this.strategies) {
                this.strategies = [];
            }

            name && this.strategies.push(name);
        }

        getDefaultStrategy<T = any>(context: ApplicationContext, key: string, strategy: T): T {
            context.setValue<T>(key, strategy);
            return context.getValue<T>(key);
        }

        initStrategies(context: ApplicationContext): void {
            (this as any).applicationContext = context;
            if (!this.initialized) {
                this.initialized = true;

                const length = this.strategies.length;
                let index = 0,
                    initializer: string,
                    strategy: string;

                for (; index < length; index++) {
                    strategy = this.strategies[index];
                    initializer = `init${toPascal(strategy)}`;
                    if (typeof (this as any)[initializer] !== 'function') {
                        throw new TypeError(`Strategy ${strategy} initializer ${initializer} is not implemented`);
                    }
                    (this as any)[initializer](context);
                }
            }
        }

        initCollectionStrategy<T = any>(
            context: ApplicationContext,
            collectionStrategyKey: string,
            strategyKey: string,
            name: string,
            defaultStrategy: T[]
        ): void {
            if (context.hasValue(collectionStrategyKey)) {
                const collection = context.getValue<Enumerable<PropertyKey, T>>(collectionStrategyKey);
                if (isArray(collection)) {
                    (this as any)[name] = collection;
                } else {
                    (this as any)[name] = [];
                    collection.forEach((value) => (this as any)[name].push(value));
                }
            } else if (context.hasValue(strategyKey)) {
                (this as any)[name] = [context.getValue<T>(strategyKey)];
            }

            // Fall back to default strategy
            if (!(this as any)[name]) {
                (this as any)[name] = this.getDefaultStrategy<T[]>(context, collectionStrategyKey, defaultStrategy);
            }
        }

        initStrategy<T = any>(
            context: ApplicationContext,
            strategyKey: string,
            name: string,
            defaultStrategy: T
        ): void {
            if (context.hasValue(strategyKey)) {
                (this as any)[name] = context.getValue<T>(strategyKey);
            }

            // Fall back to default strategy
            if (!(this as any)[name]) {
                (this as any)[name] = this.getDefaultStrategy<T>(context, strategyKey, defaultStrategy);
            }
        }
    };
