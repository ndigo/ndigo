/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { ViewResolver } from '@blue/view';
import { StrategyInitializer } from './strategy-initializer';
export interface ViewResolverStrategy {
    viewResolvers: ViewResolver[];
    initViewResolvers(context: ApplicationContext): void;
}
export declare const AsViewResolverStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<ViewResolverStrategy> & T;
//# sourceMappingURL=view-resolver-strategy.d.ts.map