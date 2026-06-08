/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
export interface StrategyInitializer {
    strategies: string[];
    addStrategy(name: string): void;
    getDefaultStrategy<T>(context: ApplicationContext, key: string, strategy: T): T;
    initStrategies(context: ApplicationContext): void;
    initCollectionStrategy<T = any>(context: ApplicationContext, collectionStrategyKey: string, strategyKey: string, name: string, defaultStrategy: T[]): void;
    initStrategy<T = any>(context: ApplicationContext, strategyKey: string, name: string, defaultStrategy: T): void;
}
export declare const AsStrategyInitializer: <T extends Constructable>(superclass: T) => Constructable<StrategyInitializer> & T;
//# sourceMappingURL=strategy-initializer.d.ts.map