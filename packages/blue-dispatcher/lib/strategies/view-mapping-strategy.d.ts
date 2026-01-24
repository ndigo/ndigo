/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { StrategyInitializer } from './strategy-initializer';
export interface ViewMappingStrategy {
    viewMapping: any;
    initViewMapping(context: ApplicationContext): void;
}
/**
 * @interface module:dispatcher.ViewMappingStrategy
 */
export declare const defaultViewMapping: any;
export declare const AsViewMappingStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<ViewMappingStrategy> & T;
//# sourceMappingURL=view-mapping-strategy.d.ts.map